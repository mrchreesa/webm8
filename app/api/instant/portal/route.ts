import { cookies } from "next/headers";
import { apiError, assertOrigin, BillingError, billingConfig, getOrder, stripeClient, SESSION_COOKIE } from "@/lib/instantBillingServer";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const config = billingConfig();
    const order = await getOrder((await cookies()).get(SESSION_COOKIE)?.value);
    if (!order?.customer_id) throw new BillingError("Use the billing sign-in link to manage your subscription.", 401);
    const portal = await stripeClient().billingPortal.sessions.create({ customer: order.customer_id, configuration: config.portalConfig, return_url: `${config.origin}/` });
    return Response.json({ ok: true, url: portal.url }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
