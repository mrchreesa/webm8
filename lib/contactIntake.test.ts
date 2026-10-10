import { test } from "node:test";
import assert from "node:assert/strict";
import { acceptContact } from "./contactIntake.ts";
import { validateContactSubmission } from "./contactRequest.ts";
import { contactEmails } from "./contactEmail.ts";

const input = {
  business: "QA & Test",
  name: "Test <Owner>",
  email: "test@example.com",
  phone: "+44 7700 900123",
  website: "example.com",
  message: "<script>alert(1)</script>\nPlease call tomorrow.",
  plan: "growth",
  elapsedMs: 5000,
  website_hp: "",
  submissionKey: "ec0e035d-8b60-45d6-8a48-33b582db45db",
  attribution: { utm_source: "google" },
};

test("validation rejects bad fields, bot submissions and oversized messages", () => {
  for (const change of [
    { email: "broken" },
    { phone: "abc" },
    { plan: "invented" },
    { website: "javascript:alert(1)" },
    { message: "x".repeat(3001) },
    { website_hp: "spam" },
    { elapsedMs: 0 },
    { elapsedMs: undefined },
    { submissionKey: "bad" },
  ]) {
    assert.equal(validateContactSubmission({ ...input, ...change }).ok, false);
  }
  const result = validateContactSubmission(input);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.link, "https://example.com/");
    assert.equal(result.value.formType, "contact");
  }
});

test("CRM failure cannot report success or send email", async () => {
  const result = await acceptContact(input, {
    save: async () => {
      throw new Error("timeout");
    },
    send: async () => {
      throw new Error("must not send");
    },
  });
  assert.equal(result.status, 502);
  assert.equal(result.body.ok, false);
});

test("save precedes both emails; delivery failure does not lose a saved enquiry", async () => {
  let saved = false;
  const recipients: string[] = [];
  const result = await acceptContact(input, {
    save: async (enquiry) => {
      assert.equal(enquiry.pagePath, "/contact/");
      saved = true;
      return { id: input.submissionKey, duplicate: false };
    },
    send: async (message) => {
      assert.equal(saved, true);
      recipients.push(message.to);
      return { ok: false, reason: "fixture failure" };
    },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.ok, true);
  assert.deepEqual(recipients.sort(), [
    "info@webm8agency.com",
    "test@example.com",
  ]);
});

test("a retry confirms the existing save without duplicating emails", async () => {
  const result = await acceptContact(input, {
    save: async () => ({ id: input.submissionKey, duplicate: true }),
    send: async () => {
      throw new Error("must not send");
    },
  });
  assert.equal(result.body.ok, true);
});

test("email HTML escapes visitor content and preserves the original message in text", () => {
  const parsed = validateContactSubmission(input);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const messages = contactEmails(parsed.value, input.submissionKey);
  assert.match(messages.notification.text, /<script>/);
  assert.doesNotMatch(messages.notification.html, /<script>/);
  assert.match(messages.notification.html, /&lt;script&gt;/);
  assert.match(messages.confirmation.text, /within one business day/);
});
