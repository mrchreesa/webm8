import { cookies } from "next/headers";
import { after } from "next/server";
import { deliverInstantEmails } from "@/lib/instantEmailOutbox";
import { submitInstantBrief } from "@/lib/instantCheckout";
import { apiError, assertOrigin, BillingError, requestJson, SESSION_COOKIE } from "@/lib/instantBillingServer";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token || !/^[a-f0-9]{64}$/.test(token)) throw new BillingError("Your session has expired. Please contact WebM8 to recover your brief.", 401);
    const result = await submitInstantBrief(token, await requestJson(request));
    if (!("errors" in result) && result.order?.submitted) {
      after(async () => {
        try { await deliverInstantEmails(result.order.id); }
        catch { console.error("instant-email: background delivery deferred to scheduled retry"); }
      });
    }
    return Response.json({ ok: !("errors" in result), ...result }, { status: "errors" in result ? 400 : 200, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
