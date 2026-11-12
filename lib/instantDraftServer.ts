import { createHmac, timingSafeEqual } from "node:crypto";
import { BillingError, billingPool, tokenHash } from "./instantBillingServer.ts";
import { draftAnswers, DRAFT_STEPS, hasDraftContent, validDraftVisitKey } from "./instantDraft.ts";

export function draftReportAuthorized(body: string, timestamp: string | null, signature: string | null, secret = process.env.INSTANT_DRAFT_REPORT_SECRET, now = Date.now()) {
  if (!secret || secret.length < 32 || !timestamp || !/^\d{13}$/.test(timestamp) || Math.abs(now - Number(timestamp)) > 300000 || !signature || !/^[a-f0-9]{64}$/.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(`instant-drafts:v1\n${timestamp}\n${body}`).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
export async function saveInstantDraft(token: string, input: unknown, visitorCountry: string | null = null) {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new BillingError("Reload this page before saving progress.", 401);
  if (!input || typeof input !== "object") throw new BillingError("Invalid draft.");
  const data = input as Record<string, unknown>;
  if (!Number.isSafeInteger(data.revision) || Math.abs(Date.now() - Number(data.revision)) > 300000 || !DRAFT_STEPS.includes(data.step as typeof DRAFT_STEPS[number])) throw new BillingError("Reload this page before saving progress.");
  const answers = data.enabled === true ? draftAnswers(data.answers) : {};
  const deleted = data.enabled !== true || !hasDraftContent(answers);
  const visit = validDraftVisitKey(data.visitKey) ? { _visitKey: data.visitKey } : {};
  const snapshot = deleted ? {} : { ...answers, ...visit, ...(visitorCountry ? { _visitorCountry: visitorCountry } : {}) };
  const result = await billingPool().query(`INSERT INTO instant_websites.drafts(access_hash,answers,step,revision,deleted)
    SELECT $1,$2,$3,$4,$5 WHERE NOT EXISTS(SELECT 1 FROM instant_websites.orders WHERE access_hash=$1 AND submitted_at IS NOT NULL)
    ON CONFLICT(access_hash) DO UPDATE SET answers=EXCLUDED.answers,step=EXCLUDED.step,revision=EXCLUDED.revision,deleted=EXCLUDED.deleted,updated_at=now()
    WHERE instant_websites.drafts.revision<EXCLUDED.revision RETURNING updated_at`,
  [tokenHash(token), JSON.stringify(snapshot), data.step, data.revision, deleted]);
  // A lost response can retry an identical revision. A different/newer snapshot
  // must never receive a misleading "saved" acknowledgement.
  const duplicate = result.rowCount ? null : await billingPool().query<{ matches: boolean }>(
    `SELECT revision=$2 AND (answers - '_visitorCountry')=$3::jsonb AND step=$4 AND deleted=$5 AS matches
     FROM instant_websites.drafts WHERE access_hash=$1`,
    [tokenHash(token), data.revision, JSON.stringify(deleted ? {} : { ...answers, ...visit }), data.step, deleted]);
  return { saved: result.rowCount === 1 || duplicate?.rows[0]?.matches === true, revision: data.revision };
}
export async function purgeInstantDrafts() {
  return billingPool().query("DELETE FROM instant_websites.drafts d WHERE updated_at < now()-interval '24 hours' OR EXISTS(SELECT 1 FROM instant_websites.orders o WHERE o.access_hash=d.access_hash AND o.submitted_at IS NOT NULL)");
}
export async function readInstantDrafts(input: unknown) {
  const data = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const date = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v));
  if (!date(data.from) || !date(data.to) || String(data.from) > String(data.to)) throw new BillingError("Invalid date range.");
  const requestedPage = Math.min(100000, Math.max(1, Math.floor(Number(data.page) || 1)));
  const visits = data.visits ?? [];
  if (!Array.isArray(visits) || visits.length > 21 || !visits.every(validDraftVisitKey) ||
    (data.selectedVisit !== undefined && (!validDraftVisitKey(data.selectedVisit) || !visits.includes(data.selectedVisit)))) throw new BillingError("Invalid visit selection.");
  const db = billingPool();
  const where = `FROM instant_websites.drafts d LEFT JOIN instant_websites.orders o ON o.access_hash=d.access_hash
    WHERE NOT d.deleted AND d.updated_at >= now()-interval '24 hours' AND o.submitted_at IS NULL
    AND d.updated_at >= $1::date AND d.updated_at < $2::date + interval '1 day'`;
  const count = await db.query<{ total: string }>(`SELECT count(*) AS total ${where}`, [data.from, data.to]);
  const total = Number(count.rows[0].total), pages = Math.max(1, Math.ceil(total / 20)), page = Math.min(requestedPage, pages);
  const fields = "d.answers - '_visitorCountry' - '_visitKey'";
  const key = "d.answers->>'_visitKey'";
  const metadata = `${key} AS visit_key,d.answers->>'_visitorCountry' AS estimated_country,d.step,d.created_at,d.updated_at,
    CASE WHEN o.checkout_confirmed THEN 'Trial started; brief unfinished' WHEN o.checkout_session_id IS NOT NULL THEN 'Checkout unfinished' ELSE 'Details unfinished' END AS status`;
  const result = await db.query(`SELECT ${fields} AS answers,${metadata} ${where}
    ORDER BY d.updated_at DESC,d.access_hash LIMIT 20 OFFSET $3`, [data.from, data.to, (page - 1) * 20]);
  const matches = visits.length ? await db.query(`SELECT DISTINCT ON (${key}) ${metadata},
    CASE WHEN ${key} = $4 THEN ${fields} ELSE '{}'::jsonb END AS answers
    ${where} AND ${key} = ANY($3::text[]) ORDER BY ${key}, d.updated_at DESC,d.access_hash`,
    [data.from, data.to, visits, data.selectedVisit ?? null]) : null;
  return { items: result.rows, matches: matches?.rows ?? [], total, page, pages };
}
