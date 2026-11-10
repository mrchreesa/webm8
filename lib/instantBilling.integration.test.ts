import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import Stripe from "stripe";
import { emptyAnswers, type Answers } from "./instantWebsite.ts";
import type { InstantCrmBilling } from "./instantCrmIntake.ts";
import { createInstantCheckout, recordInstantCheckoutConsent, submitInstantBrief } from "./instantCheckout.ts";
import { processInstantEvent } from "./instantWebhook.ts";
import { billingConfig, billingPool, getOrder, orderMarket, publicOrder, tokenHash } from "./instantBillingServer.ts";
import { deliverInstantEmails, queueInstantEmails } from "./instantEmailOutbox.ts";
import type { sendEmail } from "./resend.ts";

test("real Postgres: checkout retries, webhook ordering, private ownership, cancellation and risk", { skip: !process.env.INSTANT_TEST_DATABASE_URL }, async t => {
  const testDatabase = new URL(process.env.INSTANT_TEST_DATABASE_URL!);
  assert.equal(testDatabase.hostname, "127.0.0.1"); assert.equal(testDatabase.port, "55439"); assert.equal(testDatabase.username, "instant_test");
  Object.assign(process.env, { INSTANT_BILLING_ENABLED: "1", INSTANT_STRIPE_MODE: "test", STRIPE_RESTRICTED_KEY: "rk_test_fixture_only", NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_fixture_only", STRIPE_WEBHOOK_SECRET: "whsec_fixture_only", STRIPE_INSTANT_PRICE_ID: "price_fixture", STRIPE_INSTANT_US_PRICE_ID: "price_us_fixture", STRIPE_INSTANT_PORTAL_CONFIG: "bpc_fixture", STRIPE_INSTANT_PORTAL_URL: "https://billing.stripe.com/p/login/test_fixture", INSTANT_DATABASE_URL: process.env.INSTANT_TEST_DATABASE_URL!, INSTANT_WEBSITES_ORIGIN: "http://127.0.0.1:3057", CRM_WEBSITE_INTAKE_URL: "https://crm.example.com/api/intake", WEBSITE_INTAKE_SECRET: "fixture-only-not-a-real-secret-value" });
  const db = billingPool();
  await db.query(await readFile(new URL("../migrations/001_instant_billing.sql", import.meta.url), "utf8"));
  await db.query(await readFile(new URL("../migrations/002_instant_brief_recovery.sql", import.meta.url), "utf8"));
  await db.query(await readFile(new URL("../migrations/003_instant_email_outbox.sql", import.meta.url), "utf8"));
  process.env.INSTANT_EMAILS_ENABLED = "1";
  const answers = { ...emptyAnswers(), name: "Test Owner", email: "owner@example.com", deliveryPhone: "+44 7700 900123", businessName: "Example Plumbing", industry: "trades" as const, area: "Bromley", checkoutAcknowledged: true, services: "Boiler repair", hasWebsite: "no" as const, contacts: ["email" as const], enquiryEmail: "owner@example.com" };
  const token = randomBytes(32).toString("hex");
  const sessions = new Map<string, Stripe.Checkout.Session>();
  const idempotency = new Map<string, Stripe.Checkout.Session>();
  let creationCalls = 0; let loseResponse = true;
  let subscription = { id: "sub_fixture", customer: "cus_fixture", status: "trialing", trial_end: Math.floor(Date.now()/1000) + 864000, cancel_at: null, cancel_at_period_end: false, items: { data: [{ price: { id: "price_fixture" } }] } } as unknown as Stripe.Subscription;
  const client = {
    prices: { retrieve: async (id: string) => ({ active: true, livemode: false, currency: id === "price_us_fixture" ? "usd" : "gbp", unit_amount: id === "price_us_fixture" ? 7900 : 3900, billing_scheme: "per_unit", recurring: { interval: "month", interval_count: 1, usage_type: "licensed" } }) },
    checkout: { sessions: {
      create: async (params: Stripe.Checkout.SessionCreateParams, options: { idempotencyKey: string }) => {
        if (idempotency.has(options.idempotencyKey)) return idempotency.get(options.idempotencyKey)!;
        creationCalls++;
        const session = { id: `cs_test_fixture_${creationCalls}`, status: "open", client_secret: "fixture_client_secret", client_reference_id: params.client_reference_id, integration_identifier: params.integration_identifier, subscription: null, customer: null, payment_status: "unpaid" } as unknown as Stripe.Checkout.Session;
        sessions.set(session.id, session); idempotency.set(options.idempotencyKey, session);
        if (loseResponse) { loseResponse = false; throw new Error("Simulated lost Stripe response"); }
        return session;
      },
      retrieve: async (id: string) => sessions.get(id)!,
      expire: async (id: string) => { sessions.get(id)!.status = "expired"; },
    } },
    subscriptions: { retrieve: async () => subscription },
    invoices: { retrieve: async () => ({ parent: { subscription_details: { subscription: "sub_fixture" } } }) },
    charges: { retrieve: async () => ({ payment_intent: "pi_fixture" }) },
    invoicePayments: { list: () => ({ autoPagingToArray: async () => [{ invoice: "in_fixture" }] }) },
  } as unknown as Stripe;
  const event = (type: string, id: string, object: object) => ({ id, type, livemode: false, created: 1794240000, data: { object } }) as Stripe.Event;
  try {
    await t.test("lost response keeps durable identity; concurrent retries create one session", async () => {
      const preparation = { ...answers, checkoutAcknowledged: false };
      await assert.rejects(createInstantCheckout(token, { ...preparation, market: "US", priceId: "price_us_fixture", amount: 1, _billing: { market: "US", priceId: "price_us_fixture" } }, client));
      assert.equal(orderMarket((await getOrder(token))!), "GB");
      assert.ok(await getOrder(token));
      const result = await Promise.all([createInstantCheckout(token, preparation, client), createInstantCheckout(token, preparation, client, "US")]);
      assert.equal(creationCalls, 1); assert.ok(result.every(r => "clientSecret" in r));
      assert.equal(await getOrder(randomBytes(32).toString("hex")), null);
    });
    await t.test("automatic preparation remains unconfirmed; explicit consent belongs to the current private session", async () => {
      const prepared = (await getOrder(token))!;
      assert.equal(prepared.answers.checkoutAcknowledged, false);
      assert.equal(prepared.checkout_confirmed, false);
      assert.equal(prepared.subscription_id, null);
      await assert.rejects(recordInstantCheckoutConsent(token, { acknowledged: false, sessionId: prepared.checkout_session_id }, client), /Confirm you understand/);
      await assert.rejects(recordInstantCheckoutConsent(randomBytes(32).toString("hex"), { acknowledged: true, sessionId: prepared.checkout_session_id }, client), /Reload checkout/);
      await assert.rejects(recordInstantCheckoutConsent(token, { acknowledged: true, sessionId: "cs_test_stale" }, client), /payment form has changed/);
      assert.equal((await getOrder(token))!.answers.checkoutAcknowledged, false);
      await recordInstantCheckoutConsent(token, { acknowledged: true, sessionId: prepared.checkout_session_id }, client);
      await recordInstantCheckoutConsent(token, { acknowledged: true, sessionId: prepared.checkout_session_id }, client);
      const consented = (await getOrder(token))!;
      assert.equal(consented.answers.checkoutAcknowledged, true);
      assert.equal(consented.checkout_confirmed, false);
      assert.equal(consented.subscription_id, null);
      assert.equal(creationCalls, 1);
    });
    await t.test("no browser claims can submit an unpaid order", async () => {
      await assert.rejects(submitInstantBrief(token, { ...answers, checkoutConfirmed: true }), /needs attention/);
      assert.equal((await db.query("SELECT count(*)::int count FROM instant_websites.email_outbox WHERE order_id=$1", [(await getOrder(token))!.id])).rows[0].count, 0);
    });
    await t.test("lifecycle event before checkout linkage asks Stripe to retry", async () => {
      await assert.rejects(processInstantEvent(event("customer.subscription.created", "evt_early", { id: "sub_fixture" }), client), /linkage/);
      assert.equal((await db.query("SELECT id FROM instant_websites.stripe_events WHERE id='evt_early'")).rowCount, 0);
    });
    const order = (await getOrder(token))!;
    const session = sessions.get(order.checkout_session_id!)!;
    session.status = "complete"; session.subscription = "sub_fixture"; session.customer = "cus_fixture";
    await t.test("completed but unpaid checkout does not grant a trial; async success does", async () => {
      await processInstantEvent(event("checkout.session.completed", "evt_unpaid", { id: session.id }), client);
      assert.equal((await getOrder(token))?.checkout_confirmed, false);
      session.payment_status = "no_payment_required";
      await processInstantEvent(event("checkout.session.async_payment_succeeded", "evt_complete", { id: session.id }), client);
      assert.equal((await getOrder(token))?.subscription_status, "trialing");
      assert.equal((await getOrder(token))?.checkout_confirmed, true);
    });
    await t.test("a lost CRM receipt and concurrent retries recover one complete brief", async () => {
      await Promise.all([processInstantEvent(event("checkout.session.async_payment_succeeded", "evt_complete", { id: session.id }), client), processInstantEvent(event("checkout.session.async_payment_succeeded", "evt_complete", { id: session.id }), client)]);
      assert.equal((await db.query("SELECT id FROM instant_websites.stripe_events WHERE id='evt_complete'")).rowCount, 1);
      let crmCalls = 0;
      const crmRecords = new Map<string, Answers>();
      const longBrief = { ...answers, services: "S".repeat(2000), difference: "D".repeat(2000), notes: "N".repeat(2000) };
      const fakeCrm = async (brief: Answers, billing: InstantCrmBilling) => {
        crmCalls++;
        assert.equal(billing.orderId, order.id);
        assert.equal(billing.subscriptionId, subscription.id);
        assert.equal(billing.trialEnd, new Date(subscription.trial_end! * 1000).toISOString());
        assert.equal(billing.livemode, false);
        const duplicate = crmRecords.has(billing.orderId);
        if (!duplicate) crmRecords.set(billing.orderId, structuredClone(brief));
        // The CRM committed, but the website never received its first response.
        if (crmCalls === 1) throw new Error("Simulated lost CRM receipt");
        return { id: "80e9e316-d650-4bb9-a6f6-69718f9b57ee", duplicate };
      };
      await assert.rejects(submitInstantBrief(token, longBrief, fakeCrm, client), /lost CRM receipt/);
      const pendingOrder = (await getOrder(token))!;
      assert.equal(pendingOrder.submitted_at, null);
      assert.equal(pendingOrder.crm_id, null);
      assert.equal((await db.query("SELECT count(*)::int count FROM instant_websites.email_outbox WHERE order_id=$1", [order.id])).rows[0].count, 0);
      assert.equal(pendingOrder.checkout_confirmed, true);
      assert.deepEqual(publicOrder(pendingOrder).answers, longBrief);
      assert.deepEqual(pendingOrder.brief_submission?.answers, longBrief);
      assert.equal(publicOrder(pendingOrder).briefPending, true);
      const changedRetry = await submitInstantBrief(token, { ...longBrief, notes: "Edited after the lost receipt" }, fakeCrm, client);
      assert.ok("restoreBrief" in changedRetry && changedRetry.restoreBrief);
      assert.ok("order" in changedRetry && changedRetry.order);
      assert.deepEqual(changedRetry.order.answers, longBrief);
      assert.equal(crmCalls, 1);
      const results = await Promise.all([submitInstantBrief(token, longBrief, fakeCrm, client), submitInstantBrief(token, longBrief, fakeCrm, client)]);
      assert.equal(crmCalls, 2);
      assert.equal(crmRecords.size, 1);
      assert.deepEqual(crmRecords.get(order.id), longBrief);
      assert.ok(results.every(r => "order" in r && r.order.submitted));
      const submittedOrder = (await getOrder(token))!;
      assert.equal(submittedOrder.crm_id, "80e9e316-d650-4bb9-a6f6-69718f9b57ee");
      assert.deepEqual(publicOrder(submittedOrder).answers, longBrief);
      assert.equal(publicOrder(submittedOrder).briefPending, false);
      const messages = (await db.query("SELECT kind,payload FROM instant_websites.email_outbox WHERE order_id=$1", [order.id])).rows;
      assert.equal(messages.length, 2);
      assert.ok(messages.find(m => m.kind === "team_notification").payload.text.includes(longBrief.notes));
    });
    await t.test("concurrent workers and lost provider responses send each frozen message once", async () => {
      const accepted = new Map<string, string>(); let lost = false;
      const fakeSend: typeof sendEmail = async (message, options) => {
        const key = options!.idempotencyKey!;
        const id = accepted.get(key) || `email_${accepted.size + 1}`;
        accepted.set(key, id);
        if (message.to === answers.email && !lost) { lost = true; throw new Error("Response lost after provider accepted"); }
        return { ok: true, id };
      };
      const options = { db, send: fakeSend, pause: async () => {} };
      await Promise.all([deliverInstantEmails(order.id, options), deliverInstantEmails(order.id, options)]);
      assert.equal(accepted.size, 2);
      const first = (await db.query("SELECT status FROM instant_websites.email_outbox WHERE order_id=$1", [order.id])).rows.map(r => r.status).sort();
      assert.deepEqual(first, ["pending", "sent"]);
      await db.query("UPDATE instant_websites.email_outbox SET next_attempt_at=now() WHERE order_id=$1 AND status='pending'", [order.id]);
      await deliverInstantEmails(order.id, options);
      await queueInstantEmails(db, (await getOrder(token))!);
      await deliverInstantEmails(order.id, options);
      const done = (await db.query("SELECT status,provider_id,attempts FROM instant_websites.email_outbox WHERE order_id=$1", [order.id])).rows;
      assert.equal(done.length, 2); assert.ok(done.every(r => r.status === "sent" && r.provider_id));
      assert.equal(accepted.size, 2); assert.deepEqual(done.map(r => r.attempts).sort(), [1, 2]);
    });
    await t.test("expired uncertain sends stop for review; permanent failures are not retried", async () => {
      await db.query("UPDATE instant_websites.email_outbox SET status='sending',first_attempt_at=now()-interval '24 hours',lease_until=now()-interval '3 minutes' WHERE order_id=$1 AND kind='customer_confirmation'", [order.id]);
      await db.query("UPDATE instant_websites.email_outbox SET status='pending',next_attempt_at=now() WHERE order_id=$1 AND kind='team_notification'", [order.id]);
      let calls = 0;
      const send: typeof sendEmail = async () => { calls++; return { ok: false, reason: "status_403", retryable: false }; };
      const result = await deliverInstantEmails(order.id, { db, send, pause: async () => {} });
      assert.equal(result.needsReview, 1); assert.equal(result.failed, 1); assert.equal(calls, 1);
      await deliverInstantEmails(order.id, { db, send, pause: async () => {} });
      assert.equal(calls, 1);
    });
    await t.test("a stale paid event cannot undo cancellation", async () => {
      subscription = { ...subscription, status: "canceled", cancel_at_period_end: true, cancel_at: subscription.trial_end };
      await processInstantEvent(event("customer.subscription.deleted", "evt_cancel", { id: "sub_fixture", status: "canceled" }), client);
      await processInstantEvent(event("invoice.paid", "evt_old_paid", { id: "in_fixture" }), client);
      const saved = (await getOrder(token))!;
      assert.equal(saved.subscription_status, "canceled"); assert.equal(saved.cancel_at_period_end, true);
      assert.equal(publicOrder(saved).trialEnd, new Date(subscription.trial_end! * 1000).toISOString());
    });
    await t.test("refund, dispute and fraud graph resolve subscription and flag review", async () => {
      for (const [i, type] of ["charge.refunded", "charge.dispute.created", "radar.early_fraud_warning.created"].entries()) {
        await processInstantEvent(event(type, `evt_risk_${i}`, { id: type === "charge.refunded" ? "ch_fixture" : `risk_${i}`, charge: "ch_fixture" }), client);
        assert.equal((await db.query("SELECT order_id FROM instant_websites.stripe_events WHERE id=$1", [`evt_risk_${i}`])).rows[0].order_id, order.id);
      }
      assert.equal((await getOrder(token))?.needs_review, true);
    });
    await t.test("US offer stays pinned through travel, retries and webhook confirmation", async () => {
      const usToken = randomBytes(32).toString("hex");
      try {
        const result = await createInstantCheckout(usToken, answers, client, "US");
        assert.ok("clientSecret" in result);
        const usOrder = (await getOrder(usToken))!;
        assert.equal(orderMarket(usOrder), "US");
        assert.equal(usOrder.answers._billing?.priceId, "price_us_fixture");
        const retried = await createInstantCheckout(usToken, answers, client, "GB");
        assert.equal("order" in retried && retried.order.market, "US");
        const usSession = sessions.get(usOrder.checkout_session_id!)!;
        usSession.status = "complete"; usSession.payment_status = "no_payment_required";
        usSession.customer = "cus_us_fixture"; usSession.subscription = "sub_us_fixture";
        const previous = subscription;
        subscription = { ...subscription, id: "sub_us_fixture", customer: "cus_us_fixture", status: "trialing", cancel_at_period_end: false, items: { data: [{ price: { id: "price_us_fixture" } }] } } as unknown as Stripe.Subscription;
        await processInstantEvent(event("checkout.session.completed", "evt_us_checkout", { id: usSession.id }), client);
        const confirmed = (await getOrder(usToken))!;
        assert.equal(confirmed.checkout_confirmed, true);
        assert.equal(confirmed.subscription_status, "trialing");
        assert.equal(publicOrder(confirmed).market, "US");
        let receivedBilling: InstantCrmBilling | undefined;
        const brief = await submitInstantBrief(usToken, answers, async (_answers, billing) => { receivedBilling = billing; return { id: "80e9e316-d650-4bb9-a6f6-69718f9b57ef", duplicate: false }; }, client);
        assert.ok("order" in brief && brief.order.submitted);
        assert.equal(receivedBilling?.market, "US");
        const emails = await db.query("SELECT payload FROM instant_websites.email_outbox WHERE order_id=$1", [usOrder.id]);
        assert.equal(emails.rowCount, 2);
        for (const { payload } of emails.rows) { assert.match(payload.text, /\$79/); assert.doesNotMatch(payload.text, /£39/); }
        subscription = previous;
      } finally {
        await db.query("DELETE FROM instant_websites.stripe_events WHERE order_id IN (SELECT id FROM instant_websites.orders WHERE access_hash=$1)", [tokenHash(usToken)]);
        await db.query("DELETE FROM instant_websites.orders WHERE access_hash=$1", [tokenHash(usToken)]);
      }
    });
    await t.test("wrong environment and tampered signatures cannot process", async () => {
      await assert.rejects(processInstantEvent({ ...event("invoice.paid", "evt_wrong", { id: "in_fixture" }), livemode: true }, client), /mode/);
      const stripe = new Stripe("sk_test_fixture_only");
      const payload = JSON.stringify(event("invoice.paid", "evt_signature", { id: "in_fixture" }));
      const header = stripe.webhooks.generateTestHeaderString({ payload, secret: billingConfig().webhookSecret });
      assert.equal(stripe.webhooks.constructEvent(payload, header, billingConfig().webhookSecret).id, "evt_signature");
      assert.throws(() => stripe.webhooks.constructEvent(payload.replace("invoice.paid", "invoice.voided"), header, billingConfig().webhookSecret));
      process.env.INSTANT_STRIPE_MODE = "live"; assert.throws(billingConfig); process.env.INSTANT_STRIPE_MODE = "test";
    });
  } finally {
    await db.query("DELETE FROM instant_websites.stripe_events WHERE order_id IN (SELECT id FROM instant_websites.orders WHERE access_hash=$1)", [tokenHash(token)]);
    await db.query("DELETE FROM instant_websites.orders WHERE access_hash=$1", [tokenHash(token)]);
    await db.end();
  }
});
