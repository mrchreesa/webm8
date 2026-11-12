import { verifiedInstantSession } from "@/lib/verifiedInstantSession";
import { recordInstantCheckoutConsent } from "@/lib/instantCheckout";
import { apiError, assertOrigin, requestJson } from "@/lib/instantBillingServer";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const token = await verifiedInstantSession();
    const result = await recordInstantCheckoutConsent(token, await requestJson(request));
    return Response.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
