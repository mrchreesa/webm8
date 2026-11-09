import { deliverInstantEmails, emailWorkerAuthorized } from "@/lib/instantEmailOutbox";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  if (!emailWorkerAuthorized(request.headers.get("authorization"))) return new Response(null, { status: 401 });
  try {
    const result = await deliverInstantEmails();
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("instant-email: scheduled delivery failed");
    return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
