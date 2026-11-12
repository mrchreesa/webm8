import { requestVisitorCountry } from "@/lib/instantCountry";
import { verifiedInstantSession } from "@/lib/verifiedInstantSession";
import { after } from "next/server";
import { deliverInstantEmails } from "@/lib/instantEmailOutbox";
import { submitInstantBrief } from "@/lib/instantCheckout";
import { apiError, assertOrigin, requestJson } from "@/lib/instantBillingServer";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const token = await verifiedInstantSession();
    const result = await submitInstantBrief(token, await requestJson(request), undefined, undefined, requestVisitorCountry(request.headers));
    if (!("errors" in result) && result.order?.submitted) {
      after(async () => {
        try { await deliverInstantEmails(result.order.id); }
        catch { console.error("instant-email: background delivery deferred to scheduled retry"); }
      });
    }
    return Response.json({ ok: !("errors" in result), ...result }, { status: "errors" in result ? 400 : 200, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
