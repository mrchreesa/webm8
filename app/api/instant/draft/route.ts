import { requestVisitorCountry } from "@/lib/instantCountry";
import { cookies } from "next/headers";
import { apiError, assertOrigin, BillingError, billingPool, requestJson, SESSION_COOKIE, tokenHash } from "@/lib/instantBillingServer";
import { saveInstantDraft } from "@/lib/instantDraftServer";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    if (process.env.INSTANT_DRAFTS_ENABLED !== "1") throw new BillingError("Progress saving is unavailable.", 503);
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token || !/^[a-f0-9]{64}$/.test(token)) throw new BillingError("Reload this page before saving progress.", 401);
    const key = tokenHash(`draft:${request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || token}`);
    const limits = await billingPool().query<{ attempts: number }>("INSERT INTO instant_websites.rate_limits(key,window_start,attempts) VALUES($1,now(),1) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN instant_websites.rate_limits.window_start<now()-interval '10 minutes' THEN 1 ELSE instant_websites.rate_limits.attempts+1 END,window_start=CASE WHEN instant_websites.rate_limits.window_start<now()-interval '10 minutes' THEN now() ELSE instant_websites.rate_limits.window_start END RETURNING attempts", [key]);
    if (limits.rows[0].attempts > 300) throw new BillingError("Progress saving paused. Try again in a few minutes.", 429);
    const result = await saveInstantDraft(token, await requestJson(request), requestVisitorCountry(request.headers));
    return Response.json({ ok: true, ...result }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error); }
}
