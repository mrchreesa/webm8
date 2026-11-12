import { billingConfig, billingPool, stripeClient } from "../lib/instantBillingServer.ts";
import { assertPrice } from "../lib/instantBilling.ts";

import { turnstileKeys } from "../lib/instantTurnstile.ts";

let db;
try {
  const config = billingConfig();
  turnstileKeys();
  const stripe = stripeClient();
  assertPrice(await stripe.prices.retrieve(config.priceId), config.live);
  assertPrice(await stripe.prices.retrieve(config.usPriceId), config.live, "US");
  const portal = await stripe.billingPortal.configurations.retrieve(config.portalConfig);
  if (!portal.active || portal.livemode !== config.live || !portal.features.subscription_cancel.enabled || portal.features.subscription_cancel.mode !== "at_period_end" || !portal.features.payment_method_update.enabled || portal.login_page?.url !== config.portalUrl) throw new Error("Customer portal configuration does not match the offer.");
  db = billingPool();
  await db.query("SELECT id,brief_submission FROM instant_websites.orders LIMIT 0");
  await db.query("SELECT id FROM instant_websites.stripe_events LIMIT 0");
  await db.query("SELECT key FROM instant_websites.rate_limits LIMIT 0");
  if (process.env.INSTANT_EMAILS_ENABLED === "1") {
    if (!process.env.RESEND_API_KEY || (process.env.CRON_SECRET || "").length < 32) throw new Error("Instant email configuration is incomplete.");
    await db.query("SELECT id,payload,status,provider_id FROM instant_websites.email_outbox LIMIT 0");
  }
  console.log(`Billing configuration, £39 GBP and $79 USD prices, cancellation portal and database checked (${config.live ? "live" : "test"}).`);
  console.log("A full sandbox checkout, signed webhook delivery, cancellation and CRM brief submission must also pass before enabling production.");
} catch (error) { console.error("Billing configuration check failed:", error.name, error.message?.includes("configuration") ? error.message : "Check the configured services and permissions."); process.exitCode = 1; }
finally { if (db) await db.end(); }
