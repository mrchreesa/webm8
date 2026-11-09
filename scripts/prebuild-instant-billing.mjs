// Block enabled-billing releases when their live services do not match the offer.
// Disabled previews and local design builds do not require billing credentials.
if (process.env.INSTANT_BILLING_ENABLED === "1") {
  await import("./check-instant-billing.mjs");
}
