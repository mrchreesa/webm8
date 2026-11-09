import { cookies } from "next/headers";
import { recordInstantCheckoutConsent } from "@/lib/instantCheckout";
import { apiError, assertOrigin, BillingError, requestJson, SESSION_COOKIE } from "@/lib/instantBillingServer";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token || !/^[a-f0-9]{64}$/.test(token)) throw new BillingError("Reload checkout before starting your trial.", 401);
    const result = await recordInstantCheckoutConsent(token, await requestJson(request));
    return Response.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
