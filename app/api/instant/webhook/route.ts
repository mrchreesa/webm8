import { billingConfig, stripeClient } from "@/lib/instantBillingServer";
import { processInstantEvent } from "@/lib/instantWebhook";
export const runtime = "nodejs";
export async function POST(request: Request) {
  let client; let config;
  try { config = billingConfig(); client = stripeClient(); } catch { return new Response("Billing unavailable", { status: 503 }); }
  let event;
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) return new Response("Missing signature", { status: 400 });
    const raw = await request.text();
    if (raw.length > 1_000_000) return new Response("Payload too large", { status: 413 });
    event = client.webhooks.constructEvent(raw, signature, config.webhookSecret);
    if (event.livemode !== config.live) return new Response("Wrong environment", { status: 400 });
  } catch { return new Response("Invalid signature", { status: 400 }); }
  try { await processInstantEvent(event, client); return Response.json({ received: true }); }
  catch { console.error("instant-billing: webhook retry needed", event.id, event.type); return new Response("Retry event", { status: 503 }); }
}
