import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { saveDemoToCrm } from "./crmIntake.ts";
import type { DemoSubmission } from "./demoRequest.ts";

const demo: DemoSubmission = {
  trade: "cleaning", tradeOther: null, business: "Test business", link: null,
  name: "Test", email: "test@example.com", phone: "07700900123",
  submissionKey: "ec0e035d-8b60-45d6-8a48-33b582db45db",
  attribution: { utm_content: "arena" }, referrer: null, pagePath: "/free-demo/",
};
const options = { url: "https://crm.example.com/api/webhooks/website", secret: "a".repeat(48) };
test("CRM handoff signs the complete request and preserves the accepted id for a retry", async () => {
  const fetcher: typeof fetch = async (_input, init) => {
    const body = String(init?.body);
    assert.deepEqual(JSON.parse(body), demo);
    const expected = "sha256=" + createHmac("sha256", options.secret).update(body).digest("hex");
    assert.equal(new Headers(init?.headers).get("x-webm8-signature-256"), expected);
    return Response.json({ ok: true, id: demo.submissionKey, duplicate: true });
  };
  assert.deepEqual(await saveDemoToCrm(demo, { ...options, fetcher }),
    { id: demo.submissionKey, duplicate: true });
});
test("missing credentials, service failure and malformed receipts never report a saved request", async () => {
  await assert.rejects(saveDemoToCrm(demo, { url: options.url, secret: "" }), /not configured/);
  await assert.rejects(saveDemoToCrm(demo, { ...options, fetcher: async () => new Response("", { status: 503 }) }), /503/);
  await assert.rejects(saveDemoToCrm(demo, { ...options, fetcher: async () => Response.json({ ok: true }) }), /invalid receipt/);
});

test("Meta click presence is serialized as a bounded CRM attribution string", async () => {
  await saveDemoToCrm({ ...demo, attribution: { has_fbclid: true } }, { ...options, fetcher: async (_input, init) => {
    assert.deepEqual(JSON.parse(String(init?.body)).attribution, { has_fbclid: "true" });
    return Response.json({ ok: true, id: demo.submissionKey, duplicate: false });
  } });
});
