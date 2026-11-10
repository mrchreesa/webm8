import { requestInstantMarket } from "@/lib/instantPricing";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError, billingConfig, getOrder, orderMarket, publicOrder, SESSION_COOKIE, stripeClient } from "@/lib/instantBillingServer";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const config = billingConfig();
    if (request.headers.get("sec-fetch-site") === "cross-site") return new Response(null, { status: 403 });
    const existing = (await cookies()).get(SESSION_COOKIE)?.value;
    const existingToken = existing && /^[a-f0-9]{64}$/.test(existing) ? existing : undefined;
    const token = existingToken ?? randomBytes(32).toString("hex");
    // A newly generated token cannot own an order. Avoid opening a database
    // connection on the first visit; returning visitors still restore privately.
    const order = existingToken ? await getOrder(existingToken) : null;
    const checkoutPending = !!order && !order.checkout_confirmed && !!order.checkout_session_id && (await stripeClient().checkout.sessions.retrieve(order.checkout_session_id)).status === "complete";
    const response = NextResponse.json({ ok: true, market: order ? orderMarket(order) : requestInstantMarket(request.headers), order: order ? publicOrder(order) : null, checkoutPending }, { headers: { "Cache-Control": "private, no-store", "Vary": "Cookie" } });
    response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: config.origin.startsWith("https:"), sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60 });
    return response;
  } catch (error) { return apiError(error); }
}
