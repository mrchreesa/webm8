import assert from "node:assert/strict";
import test from "node:test";
import { sendEmail, type EmailMessage } from "./resend.ts";
test("provider adapter supplies stable idempotency and keeps addresses out of failures", async () => {
  const previous = globalThis.fetch, key = process.env.RESEND_API_KEY;
  const message: EmailMessage = { from: "sender@example.test", to: "person@example.test", cc: ["team@example.test", "owner@example.test"], subject: "Test", html: "<p>Test</p>", text: "Test" };
  try {
    process.env.RESEND_API_KEY = "fixture-only";
    globalThis.fetch = (async (_url, options) => {
      assert.equal(new Headers(options?.headers).get("Idempotency-Key"), "order/customer/v1");
      assert.deepEqual(JSON.parse(String(options?.body)).cc, message.cc);
      return Response.json({ id: "email_receipt" });
    }) as typeof fetch;
    assert.deepEqual(await sendEmail(message, { idempotencyKey: "order/customer/v1" }), { ok: true, id: "email_receipt" });
    for (const status of [403, 422, 429, 500]) {
      globalThis.fetch = (async () => Response.json({ message: "Private person@example.test" }, { status })) as typeof fetch;
      const result = await sendEmail(message);
      assert.deepEqual(result, { ok: false, reason: `status_${status}`, retryable: status === 429 || status >= 500 });
      assert.ok(!JSON.stringify(result).includes("person@example.test"));
    }
    globalThis.fetch = (async () => Response.json({})) as typeof fetch;
    assert.deepEqual(await sendEmail(message), { ok: false, reason: "missing_receipt", retryable: true });
  } finally { globalThis.fetch = previous; if (key === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = key; }
});
