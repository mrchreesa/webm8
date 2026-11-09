import assert from "node:assert/strict";
import test from "node:test";
import { billingConfig } from "./instantBillingServer.ts";

test("claimable sandbox keys work only in test mode; production rejects test credentials", () => {
  const before = { ...process.env };
  try {
    Object.assign(process.env, { INSTANT_BILLING_ENABLED: "1", INSTANT_STRIPE_MODE: "test", STRIPE_RESTRICTED_KEY: "rkcs_test_fixture", NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_fixture", STRIPE_INSTANT_PRICE_ID: "price_fixture", STRIPE_WEBHOOK_SECRET: "whsec_fixture", STRIPE_INSTANT_PORTAL_CONFIG: "bpc_fixture", STRIPE_INSTANT_PORTAL_URL: "https://billing.stripe.com/p/login/test_fixture", INSTANT_DATABASE_URL: "postgres://fixture", INSTANT_WEBSITES_ORIGIN: "https://test.example.com", CRM_WEBSITE_INTAKE_URL: "https://crm.example.com", WEBSITE_INTAKE_SECRET: "fixture_only", VERCEL_ENV: "production" });
    assert.equal(billingConfig().live, false);
    process.env.INSTANT_STRIPE_MODE = "live";
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_live_fixture";
    assert.throws(() => billingConfig(), /key mode does not match/);
    process.env.STRIPE_RESTRICTED_KEY = "rk_live_fixture";
    assert.equal(billingConfig().live, true);
    process.env.VERCEL_ENV = "preview";
    assert.throws(() => billingConfig(), /Invalid Instant Websites billing environment/);
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in before)) delete process.env[key];
    Object.assign(process.env, before);
  }
});
