import type { InstantMarket } from "./instantPricing.ts";
import { randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import type Stripe from "stripe";
import { assertPrice, canSubmitBrief, checkoutParameters, validateInstantSubmission } from "./instantBilling.ts";
import { BillingError, billingConfig, getOrder, orderAnswers, orderMarket, publicOrder, stripeClient, tokenHash, transaction, type Order } from "./instantBillingServer.ts";
import { saveInstantToCrm, type InstantCrmBilling } from "./instantCrmIntake.ts";
import { queueInstantEmails } from "./instantEmailOutbox.ts";

export async function createInstantCheckout(token: string, input: unknown, client: Stripe = stripeClient(), market: InstantMarket = "GB") {
  const checked = validateInstantSubmission(input, "checkout");
  if (!checked.ok) return { errors: checked.errors };
  const config = billingConfig();
  const hash = tokenHash(token);
  // Commit the identity and the exact request data before calling Stripe, so
  // a lost response or server restart retries the same idempotency key.
  await transaction(async db => {
    await db.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [hash]);
    let order = await getOrder(token, db);
    if (!order) {
      await db.query("INSERT INTO instant_websites.orders(id,access_hash,answers) VALUES($1,$2,$3)", [randomUUID(), hash, { ...checked.answers, _billing: { market, priceId: market === "US" ? config.usPriceId : config.priceId } }]);
      return;
    }
    if (order.checkout_confirmed || order.subscription_id) return;
    if (order.checkout_session_id) {
      const session = await client.checkout.sessions.retrieve(order.checkout_session_id);
      if (session.status === "complete") throw new BillingError("Stripe is confirming your trial. Refresh this page to check again.", 409);
      const changed = !isDeepStrictEqual(publicOrder(order).answers, checked.answers);
      if (session.status === "open" && !changed) return;
      if (session.status === "open") await client.checkout.sessions.expire(session.id);
      await db.query("UPDATE instant_websites.orders SET answers=$2,checkout_session_id=NULL,checkout_attempt=checkout_attempt+1,updated_at=now() WHERE id=$1", [order.id, orderAnswers(order, checked.answers)]);
    }
    // No session ID can mean a lost Stripe response. Never change its payload.
    order = await getOrder(token, db);
    if (order && !order.checkout_session_id && !isDeepStrictEqual(publicOrder(order).answers, checked.answers)) throw new BillingError("A checkout is already being prepared. Retry with the saved details, then edit them after returning.", 409);
  });
  return transaction(async db => {
    const order = (await db.query<Order>("SELECT * FROM instant_websites.orders WHERE access_hash=$1 FOR UPDATE", [hash])).rows[0];
    if (order.checkout_confirmed || order.subscription_id) return { order: publicOrder(order) };
    const priceId = order.answers._billing?.priceId || (orderMarket(order) === "US" ? config.usPriceId : config.priceId);
    assertPrice(await client.prices.retrieve(priceId), config.live, orderMarket(order));
    const params = checkoutParameters(order, { ...config, priceId });
    // Preserve the exact payload for legacy GBP orders with a possibly lost Stripe response.
    if (!order.answers._billing) { delete params.locale; delete params.adaptive_pricing; }
    const session = order.checkout_session_id
      ? await client.checkout.sessions.retrieve(order.checkout_session_id)
      : await client.checkout.sessions.create(params, { idempotencyKey: `instant-checkout:${order.id}:${order.checkout_attempt}` });
    if (!session.client_secret || session.status !== "open") throw new BillingError("Stripe is confirming your trial. Refresh this page to check again.", 409);
    await db.query("UPDATE instant_websites.orders SET checkout_session_id=$2,updated_at=now() WHERE id=$1", [order.id, session.id]);
    return { clientSecret: session.client_secret, order: publicOrder(order) };
  });
}

export async function recordInstantCheckoutConsent(token: string, input: unknown, client: Stripe = stripeClient()) {
  if (!input || typeof input !== "object" || !("acknowledged" in input) || input.acknowledged !== true || !("sessionId" in input) || typeof input.sessionId !== "string") throw new BillingError("Confirm you understand the free trial and monthly price after it ends.");
  return transaction(async db => {
    const order = (await db.query<Order>("SELECT * FROM instant_websites.orders WHERE access_hash=$1 FOR UPDATE", [tokenHash(token)])).rows[0];
    if (!order) throw new BillingError("Reload checkout before starting your trial.", 401);
    if (!order.checkout_session_id || order.checkout_session_id !== input.sessionId) throw new BillingError("Your payment form has changed. Reload this page before continuing.", 409);
    const session = await client.checkout.sessions.retrieve(order.checkout_session_id);
    if (session.status !== "open" || session.client_reference_id !== order.id) throw new BillingError("This payment form is no longer open. Reload this page to check your trial.", 409);
    await db.query("UPDATE instant_websites.orders SET answers=jsonb_set(answers,'{checkoutAcknowledged}','true'::jsonb),updated_at=now() WHERE id=$1", [order.id]);
    return { acknowledged: true };
  });
}

export async function submitInstantBrief(token: string, input: unknown, saveToCrm = saveInstantToCrm, client: Stripe = stripeClient(), visitorCountry: string | null = null) {
  const checked = validateInstantSubmission(input, "brief");
  if (!checked.ok) return { errors: checked.errors };
  const hash = tokenHash(token);
  // Freeze and commit the first complete request before handing it to the CRM.
  // A lost receipt must never let an edited retry diverge from the accepted brief.
  const prepared = await transaction(async db => {
    const order = (await db.query<Order>("SELECT * FROM instant_websites.orders WHERE access_hash=$1 FOR UPDATE", [hash])).rows[0];
    if (!order) throw new BillingError("Complete checkout before submitting your website details.", 401);
    if (order.submitted_at) return { order: publicOrder(order) };
    if (!canSubmitBrief(publicOrder(order))) throw new BillingError("Your trial needs attention before we can accept the website brief. Check your billing status or contact WebM8.", 409);
    if (order.brief_submission) {
      if (!isDeepStrictEqual(order.brief_submission.answers, checked.answers)) return {
        errors: { form: "We’ve restored the answers you already submitted. Select Submit to finish confirming them. You can request edits afterward." },
        restoreBrief: true, order: publicOrder(order),
      };
      return;
    }
    const subscription = await client.subscriptions.retrieve(order.subscription_id!);
    if (subscription.status !== "trialing" && subscription.status !== "active") throw new BillingError("Your subscription is no longer active. Manage your billing or contact WebM8 before submitting.", 409);
    if (!subscription.trial_end) throw new BillingError("We couldn’t verify your trial dates. Please contact WebM8.", 409);
    const billing: InstantCrmBilling = {
      orderId: order.id, customerId: order.customer_id!, subscriptionId: order.subscription_id!,
      market: orderMarket(order), visitorCountry,
      status: subscription.status === "trialing" ? "trialing" : "active", trialEnd: new Date(subscription.trial_end * 1000).toISOString(), livemode: billingConfig().live,
    };
    await db.query("UPDATE instant_websites.orders SET answers=$2,brief_submission=$3,updated_at=now() WHERE id=$1", [order.id, orderAnswers(order, checked.answers), { answers: checked.answers, billing }]);
  });
  if (prepared) return prepared;
  return transaction(async db => {
    const order = (await db.query<Order>("SELECT * FROM instant_websites.orders WHERE access_hash=$1 FOR UPDATE", [hash])).rows[0];
    if (!order) throw new BillingError("Your submission could not be found. Please contact WebM8.", 401);
    if (order.submitted_at) return { order: publicOrder(order) };
    if (!canSubmitBrief(publicOrder(order))) throw new BillingError("Your trial needs attention before we can accept the website brief. Check your billing status or contact WebM8.", 409);
    const subscription = await client.subscriptions.retrieve(order.subscription_id!);
    if (subscription.status !== "trialing" && subscription.status !== "active") throw new BillingError("Your subscription is no longer active. Manage your billing or contact WebM8 before submitting.", 409);
    if (!order.brief_submission) throw new Error("The pending website brief is missing");
    const { answers, billing } = order.brief_submission;
    const receipt = await saveToCrm(answers, billing);
    const saved = await db.query<Order>("UPDATE instant_websites.orders SET answers=$2,submitted_at=now(),crm_id=$3,updated_at=now() WHERE id=$1 RETURNING *", [order.id, orderAnswers(order, answers), receipt.id]);
    await queueInstantEmails(db, saved.rows[0]);
    return { order: publicOrder(saved.rows[0]) };
  });
}
