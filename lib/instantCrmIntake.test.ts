import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { emptyAnswers } from "./instantWebsite.ts";
import { instantCrmSubmission, saveInstantToCrm, type InstantCrmBilling } from "./instantCrmIntake.ts";

const answers = { ...emptyAnswers(), name: "Test Owner", businessName: "Example Plumbing", email: "owner@example.com", deliveryPhone: "+44 7700 900123", area: "London", industry: "trades" as const, hasWebsite: "no" as const, contacts: ["email" as const], enquiryEmail: "enquiries@example.com", services: "S".repeat(2000), difference: "D".repeat(2000), notes: "N".repeat(2000) };
const billing: InstantCrmBilling = { orderId: "ec0e035d-8b60-45d6-8a48-33b582db45db", customerId: "cus_fixture", subscriptionId: "sub_fixture", status: "trialing", trialEnd: "2026-11-19T12:00:00.000Z", livemode: false };
const options = { url: "https://crm.example.com/api/webhooks/website", secret: "fixture-secret-not-real-".repeat(3) };

test("Instant CRM delivery signs a complete long brief and retains the stable receipt on retry", async () => {
  const bodies: string[] = [];
  const fetcher: typeof fetch = async (_url, init) => {
    const body = String(init?.body); bodies.push(body);
    assert.equal(new Headers(init?.headers).get("x-webm8-signature-256"), "sha256=" + createHmac("sha256", options.secret).update(body).digest("hex"));
    const data = JSON.parse(body);
    assert.equal(data.formType, "instant");
    assert.equal(data.submissionKey, billing.orderId);
    assert.equal(data.brief.services, answers.services);
    assert.equal(data.brief.difference, answers.difference);
    assert.equal(data.brief.notes, answers.notes);
    assert.equal(data.billing.livemode, false);
    assert.equal(init?.redirect, "error");
    return Response.json({ ok: true, id: billing.orderId, duplicate: bodies.length > 1 });
  };
  assert.equal((await saveInstantToCrm(answers, billing, { ...options, fetcher })).duplicate, false);
  assert.equal((await saveInstantToCrm(answers, billing, { ...options, fetcher })).duplicate, true);
  assert.equal(bodies[0], bodies[1]);
});

test("private delivery phone never becomes a public website phone and deselected values are omitted", () => {
  const saved = instantCrmSubmission({ ...answers, phone: "07700900456", whatsapp: "07700900789", website: "https://stale.example.com", bookingUrl: "https://stale.example.com/book", menuUrl: "https://stale.example.com/menu", samePhone: true }, billing);
  assert.equal(saved.phone, answers.deliveryPhone);
  assert.equal(saved.brief.publicPhone, "");
  assert.equal(saved.brief.publicWhatsapp, "");
  assert.equal(saved.link, null);
  assert.equal(saved.brief.bookingUrl, "");
  assert.equal(saved.brief.menuUrl, "");
  const whatsapp = instantCrmSubmission({ ...answers, contacts: ["whatsapp"], samePhone: true, phone: "07700900456", whatsapp: "07700900789" }, billing);
  assert.equal(whatsapp.brief.publicWhatsapp, "07700900789");
});

test("CRM outage, malformed receipt, oversized request or missing credentials never report success", async () => {
  await assert.rejects(saveInstantToCrm(answers, billing, { ...options, secret: "" }), /not configured/);
  await assert.rejects(saveInstantToCrm(answers, billing, { ...options, fetcher: async () => new Response(null, { status: 503 }) }), /503/);
  await assert.rejects(saveInstantToCrm(answers, billing, { ...options, fetcher: async () => Response.json({ ok: true }) }), /invalid receipt/);
  await assert.rejects(saveInstantToCrm({ ...answers, notes: "N".repeat(33000) }, billing, { ...options, fetcher: async () => { throw new Error("Should not send"); } }), /limit/);
});
