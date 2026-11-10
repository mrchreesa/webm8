import type Stripe from "stripe";
import { BILLING_EVENTS, invoiceSubscription, stripeId } from "./instantBilling.ts";
import { billingConfig, orderMarket, stripeClient, transaction, type Order } from "./instantBillingServer.ts";

const iso = (seconds: number | null | undefined) => seconds ? new Date(seconds * 1000) : null;
/** Resolve current Stripe objects, never assume webhook delivery order. */
export async function processInstantEvent(event: Stripe.Event, client: Stripe = stripeClient()) {
  const config = billingConfig();
  if (event.livemode !== config.live) throw new Error("Webhook mode mismatch");
  if (!(BILLING_EVENTS as readonly string[]).includes(event.type)) return;
  let session: Stripe.Checkout.Session | null = null;
  const subscriptions = new Set<string>();
  let risk = false;
  const objectId = "id" in event.data.object ? event.data.object.id : null;
  if (!objectId) return;
  if (event.type.startsWith("checkout.session.")) {
    session = await client.checkout.sessions.retrieve(objectId);
    if (session.integration_identifier !== "webm8-instant-qxmvbtrn") return;
    const id = stripeId(session.subscription); if (id && session.payment_status !== "unpaid") subscriptions.add(id);
  } else if (event.type.startsWith("customer.subscription.")) subscriptions.add(objectId);
  else if (event.type.startsWith("invoice.")) {
    const invoice = await client.invoices.retrieve(objectId);
    const id = invoiceSubscription(invoice); if (id) subscriptions.add(id);
  } else {
    risk = true;
    let chargeId: string | null = null;
    if (event.type === "charge.refunded") chargeId = event.data.object.id;
    else if (event.type === "charge.dispute.created") chargeId = stripeId((event.data.object as Stripe.Dispute).charge);
    else if (event.type === "radar.early_fraud_warning.created") chargeId = stripeId((event.data.object as Stripe.Radar.EarlyFraudWarning).charge);
    if (!chargeId) return;
    const charge = await client.charges.retrieve(chargeId);
    const paymentIntent = stripeId(charge.payment_intent);
    if (!paymentIntent) return;
    const payments = await client.invoicePayments.list({ payment: { type: "payment_intent", payment_intent: paymentIntent }, limit: 100 }).autoPagingToArray({ limit: 1001 });
    if (payments.length > 1000) throw new Error("Too many invoice payments to reconcile");
    for (const payment of payments) {
      const invoice = await client.invoices.retrieve(stripeId(payment.invoice)!);
      const id = invoiceSubscription(invoice); if (id) subscriptions.add(id);
    }
  }
  await transaction(async db => {
    await db.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [event.id]);
    if ((await db.query("SELECT id FROM instant_websites.stripe_events WHERE id=$1", [event.id])).rowCount) return;
    let orderId: string | null = null;
    // Checkout is the ownership boundary. Lifecycle events delivered before
    // checkout linkage retry instead of being silently discarded.
    if (session) {
      const order = (await db.query<Order>("SELECT * FROM instant_websites.orders WHERE checkout_session_id=$1 FOR UPDATE", [session.id])).rows[0];
      if (!order && session.status === "expired") return;
      if (!order) throw new Error("Checkout linkage not saved yet; retry this event");
      if (session.client_reference_id !== order.id) throw new Error("Checkout ownership mismatch");
      orderId = order.id;
      if (session.status === "complete" && session.payment_status !== "unpaid" && stripeId(session.subscription) && stripeId(session.customer)) {
        await db.query("UPDATE instant_websites.orders SET checkout_confirmed=true,customer_id=$2,subscription_id=$3,updated_at=now() WHERE id=$1", [order.id, stripeId(session.customer), stripeId(session.subscription)]);
      }
    }
    for (const id of subscriptions) {
      const order = (await db.query<Order>("SELECT * FROM instant_websites.orders WHERE subscription_id=$1 FOR UPDATE", [id])).rows[0];
      // Retrieve inside the row lock, so an older event cannot overwrite a
      // newer cancellation/payment state after another worker commits.
      const subscription = await client.subscriptions.retrieve(id);
      if (!order) {
        if (subscription.items.data.some(item => [config.priceId, config.usPriceId].includes(item.price.id))) throw new Error("Subscription linkage not ready; retry this event");
        continue;
      }
      const expectedPrice = order.answers._billing?.priceId || (orderMarket(order) === "US" ? config.usPriceId : config.priceId);
      if (!subscription.items.data.some(item => item.price.id === expectedPrice)) throw new Error("Subscription price does not match the saved regional offer");
      if (stripeId(subscription.customer) !== order.customer_id) throw new Error("Subscription ownership mismatch");
      orderId = order.id;
      await db.query("UPDATE instant_websites.orders SET subscription_status=$2,trial_end=$3,cancel_at=$4,cancel_at_period_end=$5,needs_review=needs_review OR $6,updated_at=now() WHERE id=$1", [order.id, subscription.status, iso(subscription.trial_end), iso(subscription.cancel_at), subscription.cancel_at_period_end, risk]);
    }
    await db.query("INSERT INTO instant_websites.stripe_events(id,type,order_id,stripe_created) VALUES($1,$2,$3,$4)", [event.id, event.type, orderId, event.created]);
  });
}
