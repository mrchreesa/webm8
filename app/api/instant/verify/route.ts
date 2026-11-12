import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError, assertOrigin, BillingError, requestJson, SESSION_COOKIE } from "@/lib/instantBillingServer";
import { signupProof, turnstileKeys, verifyTurnstile, VERIFICATION_COOKIE, VERIFICATION_SECONDS } from "@/lib/instantTurnstile";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const session = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!session || !/^[a-f0-9]{64}$/.test(session)) throw new BillingError("Enable cookies and reload this page to continue.", 401);
    const { secret } = turnstileKeys();
    const origin = new URL(process.env.INSTANT_WEBSITES_ORIGIN!);
    const body = await requestJson(request);
    await verifyTurnstile(body?.token, secret, origin.hostname);
    const expires = Date.now() + VERIFICATION_SECONDS * 1000;
    const response = NextResponse.json({ ok: true, validForSeconds: VERIFICATION_SECONDS }, { headers: { "Cache-Control": "private, no-store" } });
    response.cookies.set(VERIFICATION_COOKIE, signupProof(session, expires, secret), {
      httpOnly: true, secure: origin.protocol === "https:", sameSite: "strict", path: "/api/instant/", maxAge: VERIFICATION_SECONDS,
    });
    return response;
  } catch (error) { return apiError(error); }
}
