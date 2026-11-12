import { draftReportAuthorized, readInstantDrafts } from "@/lib/instantDraftServer";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
  // This endpoint accepts only a small server-signed filter; it never accepts browser credentials.
  if (Number(request.headers.get("content-length")) > 2048) return new Response(null, { status: 413, headers });
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400, headers });
  let bytes = 0; const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read(); if (done) break;
    bytes += value.length;
    if (bytes > 2048) { await reader.cancel(); return new Response(null, { status: 413, headers }); }
    chunks.push(value);
  }
  const body = Buffer.concat(chunks).toString("utf8");
  if (!draftReportAuthorized(body, request.headers.get("x-webm8-timestamp"), request.headers.get("x-webm8-signature"))) return new Response(null, { status: 401, headers });
  try { return Response.json({ ok: true, ...await readInstantDrafts(JSON.parse(body)) }, { headers }); }
  catch { return Response.json({ ok: false }, { status: 503, headers }); }
}
