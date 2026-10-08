import assert from "node:assert/strict";
import { test } from "node:test";
import { demoConfirmationEmail, demoNotificationEmail, escapeHtml } from "./demoEmail.ts";
import type { DemoSubmission } from "./demoRequest.ts";

const request: DemoSubmission = {
  trade: "plumbing",
  tradeOther: null,
  business: "Reyes Plumbing",
  link: null,
  name: "Jamie Reyes",
  phone: "(512) 555-0142",
  email: "jamie@example.com",
  submissionKey: "0b6f4c1e-2f0a-4c1b-9a51-6d6f2b7f9a10",
  attribution: { utm_source: "facebook", utm_campaign: "uk-trades", utm_content: "carousel-a" },
  referrer: null,
  pagePath: "/demo/",
};

const meta = { id: "5a1f6c2e-8f43-4b7e-9d0e-1c2b3a4d5e6f", receivedAt: new Date("2026-10-05T18:04:00Z") };

test("the notification subject names the business and trade", () => {
  const email = demoNotificationEmail(request, meta);
  assert.equal(email.subject, "New demo request: Reyes Plumbing (Plumbing)");
});

test("the notification carries every detail, with a dialable phone link", () => {
  const { text, html } = demoNotificationEmail(request, meta);
  for (const value of ["Jamie Reyes", "(512) 555-0142", "jamie@example.com", "uk-trades", "carousel-a", meta.id, "2026-10-05 18:04 UTC"]) {
    assert.ok(text.includes(value), `text has ${value}`);
  }
  assert.ok(html.includes('href="tel:+5125550142"') || html.includes('href="tel:5125550142"'));
  assert.ok(!text.includes("Link:"), "no link line when there is no link");
});

test("something else shows what the business does", () => {
  const email = demoNotificationEmail({ ...request, trade: "other", tradeOther: "Dog grooming" }, meta);
  assert.equal(email.subject, "New demo request: Reyes Plumbing (Dog grooming)");
});

test("a link appears, clickable, only when there is one", () => {
  const { text, html } = demoNotificationEmail({ ...request, link: "https://reyesplumbing.com/" }, meta);
  assert.ok(text.includes("Link: https://reyesplumbing.com/"));
  assert.ok(html.includes('href="https://reyesplumbing.com/"'));
});

test("everything the visitor typed is escaped in the HTML", () => {
  const hostile = { ...request, business: '<script>alert("x")</script>', name: "Jo & <b>Co</b>" };
  const notification = demoNotificationEmail(hostile, meta);
  const confirmation = demoConfirmationEmail(hostile, {});
  for (const html of [notification.html, confirmation.html]) {
    assert.ok(!html.includes("<script>"));
    assert.ok(!html.includes("<b>Co</b>"));
  }
  assert.ok(notification.html.includes("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"));
  assert.equal(escapeHtml(`'"&<>`), "&#39;&quot;&amp;&lt;&gt;");
});

test("the confirmation greets them by first name and sets out what happens next", () => {
  const email = demoConfirmationEmail(request, {});
  assert.equal(email.subject, "We've got your request, Jamie");
  assert.ok(email.text.includes("We'll call you today about Reyes Plumbing's free website demo"));
  assert.ok(email.text.includes("within 48 hours of our call"));
  assert.ok(email.text.includes("No payment. No obligation."));
  assert.ok(!email.text.includes("Our call will come from"));
});

test("the confirmation names the number we call from, once it is set", () => {
  const email = demoConfirmationEmail(request, { callFrom: "+1 (888) 555-0147" });
  assert.ok(email.text.includes("Our call will come from +1 (888) 555-0147."));
  assert.ok(email.html.includes("+1 (888) 555-0147"));
});

test("a business name ending in s takes a plain apostrophe", () => {
  const email = demoConfirmationEmail({ ...request, business: "Brightline Electrics" }, {});
  assert.ok(email.text.includes("Brightline Electrics' free website demo"));
});
