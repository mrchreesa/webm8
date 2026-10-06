/**
 * Sends one email through Resend's HTTP API. Server only: RESEND_API_KEY
 * must never gain a NEXT_PUBLIC_ prefix. Never throws; the caller decides
 * what a failed send means.
 */

export type EmailMessage = {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
};

export type SendResult = { ok: true; id: string } | { ok: false; reason: string };

export async function sendEmail(message: EmailMessage, { timeoutMs = 5000 } = {}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: false, reason: "not_configured" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: message.from,
        to: [message.to],
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return { ok: false, reason: `status_${response.status}${detail ? `: ${detail.slice(0, 300)}` : ""}` };
    }
    const data = (await response.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id ?? "" };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.name : "unknown" };
  }
}
