import { createHmac, timingSafeEqual } from "node:crypto";

function signingSecret() {
  const secret =
    process.env.MOVER_PREVIEW_ACCESS_SECRET || process.env.SUPABASE_SECRET_KEY;

  if (!secret) {
    throw new Error("Mover preview access signing is not configured");
  }

  return secret;
}

export function createPreviewAccessToken(requestId: string) {
  return createHmac("sha256", signingSecret())
    .update(`mover-preview:${requestId}`)
    .digest("base64url");
}

export function verifyPreviewAccessToken(requestId: string, token: string) {
  if (!requestId || !token) return false;

  const expected = Buffer.from(createPreviewAccessToken(requestId));
  const supplied = Buffer.from(token);

  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}
