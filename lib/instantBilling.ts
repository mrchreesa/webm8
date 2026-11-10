import { instantOffer, type InstantMarket } from "./instantPricing.ts";
import type Stripe from "stripe";
import { emptyAnswers, needsQuote, validateStep, type Answers, type Errors } from "./instantWebsite.ts";

export const BILLING_EVENTS = [
  "checkout.session.completed", "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed", "checkout.session.expired",
  "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted",
  "customer.subscription.paused", "customer.subscription.resumed", "customer.subscription.trial_will_end",
  "invoice.paid", "invoice.payment_failed", "invoice.payment_action_required",
  "charge.refunded", "charge.dispute.created", "radar.early_fraud_warning.created",
] as const;
export const BILLING_INTEGRATION = "webm8-instant-qxmvbtrn";
export type BillingStatus = {
  id: string; market: InstantMarket; answers: Answers; checkoutConfirmed: boolean; submitted: boolean;
  briefPending: boolean;
  subscriptionStatus: string | null; trialEnd: string | null; cancelAt: string | null;
  cancelAtPeriodEnd: boolean; needsReview: boolean;
};

/** Strict server validation: browser drafts never establish billing state. */
export function validateInstantSubmission(input: unknown, stage: "checkout" | "brief"):
  { ok: true; answers: Answers } | { ok: false; errors: Errors } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, errors: { form: "Enter your business details first." } };
  const raw = input as Record<string, unknown>;
  const answers = emptyAnswers();
  const errors: Errors = {};
  for (const key of Object.keys(answers) as (keyof Answers)[]) {
    if (typeof answers[key] === "string") {
      const value = raw[key];
      if (value !== undefined && typeof value !== "string") errors[key] = "Enter text for this answer.";
      else if (typeof value === "string") {
        const max = ["services", "difference", "notes", "quoteDetails"].includes(key) ? 2000 : ["website", "bookingUrl", "menuUrl"].includes(key) ? 1000 : 200;
        if (value.length > max) errors[key] = `Keep this answer under ${max} characters.`;
        (answers as unknown as Record<string, unknown>)[key] = value.trim();
      }
    }
  }
  for (const key of ["samePhone", "bookingLater", "checkoutAcknowledged"] as const) answers[key] = raw[key] === true;
  for (const key of ["features", "contacts", "links"] as const) {
    if (raw[key] !== undefined && (!Array.isArray(raw[key]) || raw[key].length > (key === "links" ? 4 : 6) || raw[key].some((v: unknown) => typeof v !== "string" || v.length > 1000))) errors[key] = "Check these choices.";
    else if (Array.isArray(raw[key])) (answers[key] as string[]) = [...new Set(raw[key] as string[])];
  }
  if (answers.features.some(v => !["information", "enquiries", "requests", "booking", "commerce", "custom"].includes(v))) errors.features = "Choose a supported website feature.";
  if (answers.contacts.some(v => !["phone", "whatsapp", "email", "request", "booking"].includes(v))) errors.contacts = "Choose a supported contact method.";
  if (!["yes", "no", ""].includes(answers.hasWebsite)) errors.hasWebsite = "Choose yes or no.";
  if (answers.scope !== "standard" || needsQuote(answers)) errors.form = "These requirements need a custom quote. Please contact WebM8.";
  // Preparing payment fields does not accept terms or start a subscription.
  Object.assign(errors, validateStep("business", answers));
  if (stage === "brief") Object.assign(errors, validateStep("checkout", answers), validateStep("brief", answers));
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, answers };
}

export function checkoutParameters(order: { id: string; answers: Answers }, config: { priceId: string; origin: string; portalUrl: string }): Stripe.Checkout.SessionCreateParams {
  return {
    mode: "subscription", ui_mode: "elements", integration_identifier: BILLING_INTEGRATION,
    client_reference_id: order.id, customer_email: order.answers.email,
    line_items: [{ price: config.priceId, quantity: 1 }],
    payment_method_collection: "always",
    subscription_data: { trial_period_days: 10, billing_mode: { type: "flexible" }, trial_settings: { end_behavior: { missing_payment_method: "cancel" } } },
    return_url: `${config.origin}/?checkout=return`,
    automatic_tax: { enabled: false },
    adaptive_pricing: { enabled: false },
    locale: "en",
  };
}

export function assertPrice(price: Stripe.Price, live: boolean, market: InstantMarket = "GB") {
  const offer = instantOffer(market);
  if (!price.active || price.livemode !== live || price.currency !== offer.currency || price.unit_amount !== offer.minorUnits || price.billing_scheme !== "per_unit" || price.recurring?.interval !== "month" || price.recurring.interval_count !== 1 || price.recurring.usage_type !== "licensed" || price.transform_quantity) throw new Error(`The configured Stripe price does not match the ${offer.price} monthly offer.`);
}

export function canSubmitBrief(status: Pick<BillingStatus, "checkoutConfirmed" | "subscriptionStatus" | "needsReview">) {
  return status.checkoutConfirmed && ["trialing", "active"].includes(status.subscriptionStatus || "") && !status.needsReview;
}

export function stripeId(value: string | { id: string } | null | undefined) { return typeof value === "string" ? value : value?.id || null; }

export function invoiceSubscription(invoice: Stripe.Invoice) { return stripeId(invoice.parent?.subscription_details?.subscription); }
