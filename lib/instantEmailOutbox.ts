import { randomUUID, timingSafeEqual } from "node:crypto";
import type { PoolClient } from "pg";
import { billingPool, type Order } from "./instantBillingServer.ts";
import { instantConfirmationEmail, instantNotificationEmail } from "./instantEmail.ts";
import { sendEmail, type EmailMessage, type SendResult } from "./resend.ts";

type Database = Pick<PoolClient, "query">;
type OutboxRow = { id: string; order_id: string; kind: string; payload: EmailMessage; attempts: number; lease_token: string; first_attempt_at: Date };
export function instantEmailSettings(env: Record<string, string | undefined> = process.env) {
  if (env.INSTANT_EMAILS_ENABLED !== "1") return null;
  const notificationEmail = env.INSTANT_NOTIFICATION_EMAIL || "info@webm8agency.com";
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(notificationEmail)) throw new Error("Invalid Instant notification email");
  const portalUrl = env.STRIPE_INSTANT_PORTAL_URL || "";
  const portal = new URL(portalUrl);
  if (portal.protocol !== "https:" || portal.hostname !== "billing.stripe.com" || portal.username || portal.password) throw new Error("Invalid Instant email portal link");
  if (!["test", "live"].includes(env.INSTANT_STRIPE_MODE || "") || (env.INSTANT_STRIPE_MODE === "live" && env.VERCEL_ENV === "preview")) throw new Error("Invalid Instant email environment");
  return { notificationEmail, portalUrl, live: env.INSTANT_STRIPE_MODE === "live" };
}

/** Runs in the same transaction that records the CRM receipt; nothing is sent here. */
export async function queueInstantEmails(db: Database, order: Order) {
  const config = instantEmailSettings();
  if (!config) return;
  if (!order.checkout_confirmed || !order.submitted_at || !order.crm_id || !order.brief_submission || order.brief_submission.billing.livemode !== config.live) throw new Error("Email requires a confirmed checkout and CRM brief receipt");
  const details = { ...order.brief_submission, crmId: order.crm_id, submittedAt: order.submitted_at, ...config };
  for (const [kind, payload] of [["customer_confirmation", instantConfirmationEmail(details)], ["team_notification", instantNotificationEmail(details)]] as const) {
    await db.query("INSERT INTO instant_websites.email_outbox(id,order_id,kind,livemode,payload) VALUES($1,$2,$3,$4,$5) ON CONFLICT(order_id,kind) DO NOTHING", [randomUUID(), order.id, kind, config.live, payload]);
  }
}

export const emailWorkerAuthorized = (authorization: string | null, secret = process.env.CRON_SECRET) => {
  if (!secret || secret.length < 32 || !authorization) return false;
  const expected = Buffer.from(`Bearer ${secret}`), supplied = Buffer.from(authorization);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
};

/** Persistent leases prevent competing workers from sending the same message.
 * The payload and provider key never change across retries. Ambiguous jobs stop
 * before Resend's 24-hour idempotency retention expires; they need manual review.
 */
export async function deliverInstantEmails(orderId?: string, options: { db?: Database; send?: typeof sendEmail; pause?: (ms: number) => Promise<void>; limit?: number } = {}) {
  const config = instantEmailSettings();
  if (!config) return { sent: 0, deferred: 0, failed: 0, needsReview: 0, disabled: true };
  if (!options.send && !process.env.RESEND_API_KEY) throw new Error("Instant email sender is not configured");
  const db = options.db || billingPool();
  const send = options.send || sendEmail;
  const pause = options.pause || (ms => new Promise(resolve => setTimeout(resolve, ms)));
  const summary = { sent: 0, deferred: 0, failed: 0, needsReview: 0, disabled: false };
  const stale = await db.query("UPDATE instant_websites.email_outbox SET status='needs_review',last_error='idempotency_window_expired',lease_token=NULL,lease_until=NULL,updated_at=now() WHERE livemode=$1 AND ($2::uuid IS NULL OR order_id=$2) AND status IN ('pending','sending') AND first_attempt_at < now()-interval '23 hours' AND (lease_until IS NULL OR lease_until < now())", [config.live, orderId || null]);
  summary.needsReview = stale.rowCount || 0;
  const started = Date.now();
  for (let i = 0; i < Math.min(options.limit ?? 6, 6) && Date.now() - started < 45000; i++) {
    const lease = randomUUID();
    const claimed = await db.query<OutboxRow>(`WITH candidate AS (
      SELECT id FROM instant_websites.email_outbox
      WHERE livemode=$1 AND ($2::uuid IS NULL OR order_id=$2)
        AND ((status='pending' AND next_attempt_at<=now()) OR (status='sending' AND lease_until<now()))
        AND (first_attempt_at IS NULL OR first_attempt_at >= now()-interval '23 hours')
      ORDER BY next_attempt_at,created_at,id FOR UPDATE SKIP LOCKED LIMIT 1
    ) UPDATE instant_websites.email_outbox e SET status='sending',attempts=attempts+1,
      first_attempt_at=coalesce(first_attempt_at,now()),lease_token=$3,lease_until=now()+interval '2 minutes',updated_at=now()
      FROM candidate WHERE e.id=candidate.id RETURNING e.*`, [config.live, orderId || null, lease]);
    const row = claimed.rows[0];
    if (!row) break;
    let result: SendResult;
    try { result = await send(row.payload, { idempotencyKey: `instant-signup/${row.order_id}/${row.kind}/v1`, timeoutMs: 8000 }); }
    catch { result = { ok: false, reason: "transport_error", retryable: true }; }
    if (result.ok) {
      await db.query("UPDATE instant_websites.email_outbox SET status='sent',provider_id=$3,sent_at=now(),lease_token=NULL,lease_until=NULL,last_error=NULL,updated_at=now() WHERE id=$1 AND lease_token=$2", [row.id, lease, result.id]);
      summary.sent++;
    } else {
      const retry = result.retryable === true;
      const exhausted = row.attempts >= 12;
      const status = retry && !exhausted ? "pending" : retry ? "needs_review" : "failed";
      const reason = /^[a-zA-Z_0-9]{1,60}$/.test(result.reason) ? result.reason : "send_failed";
      const delay = Math.min(3600, 60 * 2 ** Math.min(row.attempts - 1, 6));
      await db.query("UPDATE instant_websites.email_outbox SET status=$3,last_error=$4,next_attempt_at=now()+make_interval(secs=>$5),lease_token=NULL,lease_until=NULL,updated_at=now() WHERE id=$1 AND lease_token=$2", [row.id, lease, status, reason, delay]);
      if (status === "pending") summary.deferred++; else if (status === "failed") summary.failed++; else summary.needsReview++;
    }
    // Respect the sending API's rate limit even when both emails are ready.
    await pause(600);
  }
  if (summary.failed || summary.needsReview) console.error("instant-email: attention required", { failed: summary.failed, needsReview: summary.needsReview });
  return summary;
}
