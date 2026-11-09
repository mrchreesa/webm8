/**
 * Sends one email through Resend's HTTP API. Server only: RESEND_API_KEY
 * must never gain a NEXT_PUBLIC_ prefix. Never throws; the caller decides
 * what a failed send means.
 */

export type EmailMessage = {
  from: string;
  to: string;
  cc?: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
};

export type SendResult = { ok: true; id: string } | { ok: false; reason: string; retryable?: boolean };

export async function sendEmail(message: EmailMessage, { timeoutMs = 5000, idempotencyKey }: { timeoutMs?: number; idempotencyKey?: string } = {}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: false, reason: "not_configured" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}) },
      body: JSON.stringify({
        from: message.from,
        to: [message.to],
        ...(message.cc?.length ? { cc: message.cc } : {}),
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });

    if (!response.ok) {
      // Provider error bodies may contain addresses. Keep logs and retries categorical.
      const detail = await response.json().catch(() => ({})) as { name?: string };
      return { ok: false, reason: `status_${response.status}`, retryable: response.status >= 500 || response.status === 429 || detail.name === "concurrent_idempotent_requests" };
    }
    const data = (await response.json().catch(() => ({}))) as { id?: string };
    return data.id ? { ok: true, id: data.id } : { ok: false, reason: "missing_receipt", retryable: true };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.name : "unknown", retryable: true };
  }
}
