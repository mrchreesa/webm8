import { requestInstantMarket } from "@/lib/instantPricing";
import { verifiedInstantSession } from "@/lib/verifiedInstantSession";
import { createInstantCheckout } from "@/lib/instantCheckout";
import { apiError, assertOrigin, BillingError, billingPool, requestJson, tokenHash } from "@/lib/instantBillingServer";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const token = await verifiedInstantSession();
    const key = tokenHash(`checkout:${request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || token}`);
    const limits = await billingPool().query<{ attempts: number }>("INSERT INTO instant_websites.rate_limits(key,window_start,attempts) VALUES($1,now(),1) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN instant_websites.rate_limits.window_start<now()-interval '10 minutes' THEN 1 ELSE instant_websites.rate_limits.attempts+1 END,window_start=CASE WHEN instant_websites.rate_limits.window_start<now()-interval '10 minutes' THEN now() ELSE instant_websites.rate_limits.window_start END RETURNING attempts", [key]);
    if (limits.rows[0].attempts > 12) throw new BillingError("Please wait a few minutes before trying checkout again.", 429);
    const result = await createInstantCheckout(token, await requestJson(request), undefined, requestInstantMarket(request.headers));
    return Response.json({ ok: !("errors" in result), ...result }, { status: "errors" in result ? 400 : 200, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
