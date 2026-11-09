import Stripe from "stripe";
import { createHash } from "node:crypto";
import { Pool, type PoolClient } from "pg";
import type { Answers } from "./instantWebsite.ts";
import type { BillingStatus } from "./instantBilling.ts";
import type { InstantCrmBilling } from "./instantCrmIntake.ts";

export const SESSION_COOKIE = "webm8-instant-session";
export type Order = {
  id: string; access_hash: string; answers: Answers; checkout_attempt: number;
  checkout_session_id: string | null; checkout_confirmed: boolean; customer_id: string | null;
  subscription_id: string | null; subscription_status: string | null; trial_end: Date | null;
  cancel_at: Date | null; cancel_at_period_end: boolean; needs_review: boolean;
  submitted_at: Date | null; crm_id: string | null; created_at: Date;
  brief_submission: { answers: Answers; billing: InstantCrmBilling } | null;
};
export class BillingError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

export function billingConfig() {
  const env = process.env;
  if (env.INSTANT_BILLING_ENABLED !== "1") throw new BillingError("Checkout is not available yet. Please try again later.", 503);
  const required = ["STRIPE_RESTRICTED_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "STRIPE_INSTANT_PRICE_ID", "STRIPE_WEBHOOK_SECRET", "STRIPE_INSTANT_PORTAL_CONFIG", "STRIPE_INSTANT_PORTAL_URL", "INSTANT_DATABASE_URL", "INSTANT_WEBSITES_ORIGIN", "CRM_WEBSITE_INTAKE_URL", "WEBSITE_INTAKE_SECRET"];
  if (required.some(key => !env[key])) throw new BillingError("Checkout is not available yet. Please contact WebM8.", 503);
  const origin = new URL(env.INSTANT_WEBSITES_ORIGIN!);
  const local = origin.hostname === "localhost" || origin.hostname === "127.0.0.1";
  const live = env.INSTANT_STRIPE_MODE === "live";
  if (!["live", "test"].includes(env.INSTANT_STRIPE_MODE || "") || (!local && origin.protocol !== "https:") || origin.origin !== env.INSTANT_WEBSITES_ORIGIN || origin.username || origin.password || (live && (local || env.VERCEL_ENV === "preview"))) throw new Error("Invalid Instant Websites billing environment.");
  // Stripe's CLI-created claimable sandboxes issue rkcs_test_ keys.
  const keyPattern = live ? /^[rs]k_live_/ : /^(?:[rs]k|rkcs)_test_/;
  if (!keyPattern.test(env.STRIPE_RESTRICTED_KEY!)) throw new Error("Stripe key mode does not match the billing environment.");
  if (!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith(`pk_${live ? "live" : "test"}_`)) throw new Error("Stripe publishable key mode does not match the billing environment.");
  const portal = new URL(env.STRIPE_INSTANT_PORTAL_URL!);
  if (portal.protocol !== "https:" || portal.hostname !== "billing.stripe.com" || portal.username || portal.password) throw new Error("Invalid Stripe portal URL.");
  return { origin: origin.origin, live, priceId: env.STRIPE_INSTANT_PRICE_ID!, portalUrl: portal.href, portalConfig: env.STRIPE_INSTANT_PORTAL_CONFIG!, webhookSecret: env.STRIPE_WEBHOOK_SECRET!, key: env.STRIPE_RESTRICTED_KEY!, database: env.INSTANT_DATABASE_URL! };
}

export function billingAvailable() { try { billingConfig(); return true; } catch { return false; } }
export function stripeClient() { return new Stripe(billingConfig().key, { apiVersion: "2026-10-28.endive", timeout: 10000, maxNetworkRetries: 1 }); }
let pool: Pool | undefined;
export function billingPool() {
  if (!pool) {
    pool = new Pool({ connectionString: billingConfig().database, max: 3, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000, allowExitOnIdle: true });
    pool.on("error", () => console.error("instant-billing: database connection interrupted"));
  }
  return pool;
}
export async function transaction<T>(run: (db: PoolClient) => Promise<T>): Promise<T> {
  const db = await billingPool().connect();
  try { await db.query("BEGIN"); const result = await run(db); await db.query("COMMIT"); return result; }
  catch (error) { await db.query("ROLLBACK"); throw error; }
  finally { db.release(); }
}
export const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
export async function getOrder(token: string | undefined, db: Pick<PoolClient, "query"> = billingPool()): Promise<Order | null> {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return (await db.query<Order>("SELECT * FROM instant_websites.orders WHERE access_hash=$1", [tokenHash(token)])).rows[0] || null;
}
export function publicOrder(order: Order): BillingStatus {
  return { id: order.id, answers: order.answers, checkoutConfirmed: order.checkout_confirmed, submitted: !!order.submitted_at, briefPending: !!order.brief_submission && !order.submitted_at, subscriptionStatus: order.subscription_status, trialEnd: order.trial_end?.toISOString() || null, cancelAt: order.cancel_at?.toISOString() || null, cancelAtPeriodEnd: order.cancel_at_period_end, needsReview: order.needs_review };
}
export function assertOrigin(request: Request) {
  if (request.headers.get("origin") !== billingConfig().origin) throw new BillingError("Reload this page before trying again.", 403);
}
export async function requestJson(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new BillingError("Send your answers as JSON.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new BillingError("Your answers could not be read.");
  let bytes = 0; const chunks: Uint8Array[] = [];
  for (;;) { const { value, done } = await reader.read(); if (done) break; bytes += value.length; if (bytes > 30000) { await reader.cancel(); throw new BillingError("Your answers are too long.", 413); } chunks.push(value); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new BillingError("Your answers could not be read."); }
}
export function apiError(error: unknown) {
  if (!(error instanceof BillingError)) console.error("instant-billing: request failed", error instanceof Error ? error.name : "unknown");
  return Response.json({ ok: false, errors: { form: error instanceof BillingError ? error.message : "We couldn’t confirm that just now. Your answers are still here. Please try again." } }, { status: error instanceof BillingError ? error.status : 503, headers: { "Cache-Control": "no-store" } });
}
