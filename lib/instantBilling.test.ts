import assert from "node:assert/strict";
import test from "node:test";
import type Stripe from "stripe";
import { assertPrice, BILLING_EVENTS, canSubmitBrief, checkoutParameters, validateInstantSubmission } from "./instantBilling.ts";
import { emptyAnswers } from "./instantWebsite.ts";

export const testAnswers = () => ({ ...emptyAnswers(), name: "Test Owner", email: "owner@example.com", deliveryPhone: "+44 7700 900123", businessName: "Example Plumbing", industry: "trades" as const, area: "Bromley", checkoutAcknowledged: true, services: "Boiler repair", hasWebsite: "no" as const, contacts: ["email" as const], enquiryEmail: "owner@example.com" });
test("server validation rejects custom work, missing consent, unknown choices and oversized fields", () => {
  for (const patch of [{ scope: "commerce" }, { checkoutAcknowledged: false }, { contacts: ["unknown"] }, { businessName: "x".repeat(201) }, { links: [42] }, { hasWebsite: "invalid" }]) assert.equal(validateInstantSubmission({ ...testAnswers(), ...patch }, "brief").ok, false);
  assert.equal(validateInstantSubmission(testAnswers(), "brief").ok, true);
  assert.equal(validateInstantSubmission({ ...testAnswers(), services: "" }, "brief").ok, true);
  assert.equal(validateInstantSubmission({ ...testAnswers(), services: "", contacts: [] }, "checkout").ok, true);
  assert.equal(validateInstantSubmission({ ...testAnswers(), checkoutAcknowledged: false }, "checkout").ok, true);
  assert.equal(validateInstantSubmission({ ...emptyAnswers(), name: "Test Owner", email: "owner@example.com", deliveryPhone: "+44 7700 900123", businessName: "Example Plumbing", industry: "trades", checkoutAcknowledged: true }, "brief").ok, true);
});
test("checkout fixes price and trial on server and uses custom Stripe Elements with no tax surcharge", () => {
  const params = checkoutParameters({ id: "order-test", answers: testAnswers() }, { priceId: "price_expected", origin: "https://instant.example.com", portalUrl: "https://billing.stripe.com/p/login/test" });
  assert.equal(params.mode, "subscription"); assert.equal(params.ui_mode, "elements");
  assert.deepEqual(params.line_items, [{ price: "price_expected", quantity: 1 }]);
  assert.equal(params.payment_method_collection, "always");
  assert.equal(params.subscription_data?.trial_period_days, 10);
  assert.equal(params.subscription_data?.trial_settings?.end_behavior?.missing_payment_method, "cancel");
  assert.equal(params.automatic_tax?.enabled, false);
  assert.equal(params.return_url, "https://instant.example.com/?checkout=return");
  assert.ok(!("payment_method_types" in params)); assert.ok(!("success_url" in params));
});
test("the configured price must match £39 GBP monthly and the environment", () => {
  const price = { active: true, livemode: false, currency: "gbp", unit_amount: 3900, billing_scheme: "per_unit", recurring: { interval: "month", interval_count: 1, usage_type: "licensed" }, tax_behavior: "unspecified", transform_quantity: null } as Stripe.Price;
  assert.doesNotThrow(() => assertPrice(price, false));
  for (const patch of [{ active: false }, { livemode: true }, { currency: "usd" }, { unit_amount: 390 }, { recurring: { ...price.recurring!, interval: "year" as const } }]) assert.throws(() => assertPrice({ ...price, ...patch }, false));
});
test("a browser checkout flag never authorises a brief without confirmed, current billing state", () => {
  assert.equal(canSubmitBrief({ checkoutConfirmed: false, subscriptionStatus: "trialing", needsReview: false }), false);
  assert.equal(canSubmitBrief({ checkoutConfirmed: true, subscriptionStatus: "trialing", needsReview: false }), true);
  for (const status of ["past_due", "canceled", "unpaid", "incomplete", "paused"]) assert.equal(canSubmitBrief({ checkoutConfirmed: true, subscriptionStatus: status, needsReview: false }), false);
  assert.equal(canSubmitBrief({ checkoutConfirmed: true, subscriptionStatus: "active", needsReview: true }), false);
  for (const name of ["checkout.session.async_payment_succeeded", "invoice.payment_failed", "customer.subscription.deleted", "charge.refunded", "charge.dispute.created", "radar.early_fraud_warning.created"]) assert.ok((BILLING_EVENTS as readonly string[]).includes(name));
});


test("US billing accepts only the exact $79 USD monthly price", () => {
  const price = { active: true, livemode: true, currency: "usd", unit_amount: 7900, billing_scheme: "per_unit", recurring: { interval: "month", interval_count: 1, usage_type: "licensed" }, transform_quantity: null } as Stripe.Price;
  assert.doesNotThrow(() => assertPrice(price, true, "US"));
  for (const patch of [{ currency: "gbp" }, { unit_amount: 3900 }, { livemode: false }, { recurring: { ...price.recurring!, interval_count: 2 } }]) assert.throws(() => assertPrice({ ...price, ...patch }, true, "US"));
  assert.throws(() => assertPrice(price, true, "GB"));
  const params = checkoutParameters({ id: "us-order", answers: testAnswers() }, { priceId: "price_us", origin: "https://instant.example.com", portalUrl: "https://billing.stripe.com/p/login/test" });
  assert.deepEqual(params.line_items, [{ price: "price_us", quantity: 1 }]);
  assert.equal(params.adaptive_pricing?.enabled, false);
  assert.equal(params.locale, "en");
});
