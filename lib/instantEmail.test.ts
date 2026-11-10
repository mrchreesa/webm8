import assert from "node:assert/strict";
import test from "node:test";
import { INSTANT_EMAIL_CC, instantConfirmationEmail, instantNotificationEmail, type InstantEmailDetails } from "./instantEmail.ts";
import { emailWorkerAuthorized, instantEmailSettings } from "./instantEmailOutbox.ts";
import { emptyAnswers } from "./instantWebsite.ts";

const details: InstantEmailDetails = {
  answers: { ...emptyAnswers(), name: "Alex Owner", email: "alex@example.test", deliveryPhone: "+447700900123", businessName: "Alex's Café", industry: "food", area: "Bromley", services: "Lunch and coffee", contacts: ["phone", "whatsapp", "email", "booking"], phone: "+442000000000", whatsapp: "+447000000000", enquiryEmail: "cafe@example.test", bookingLater: true, hasWebsite: "yes", website: "https://old.example.test", links: ["https://social.example.test/alex", "https://maps.example.test/alex"], difference: "Family run", colours: "Blue and cream", address: "1 Example Road", hours: "Mon–Fri 9–5", menuUrl: "https://menu.example.test", notes: "Include outdoor seating" },
  billing: { orderId: "08824d56-7982-41b9-b972-d042e5b3c6c5", customerId: "cus_example", subscriptionId: "sub_example", status: "trialing", trialEnd: "2026-11-19T12:00:00Z", livemode: true },
  crmId: "08824d56-7982-41b9-b972-d042e5b3c6c6", submittedAt: new Date("2026-11-09T12:00:00Z"), portalUrl: "https://billing.stripe.com/p/login/example", notificationEmail: "info@webm8agency.com",
};

test("both confirmations copy the requested team addresses without duplicating the primary recipient", () => {
  for (const makeEmail of [instantConfirmationEmail, instantNotificationEmail]) assert.deepEqual(makeEmail(details).cc, INSTANT_EMAIL_CC);
  const email = instantConfirmationEmail({ ...details, answers: { ...details.answers, email: "MrChreesa@gmail.com" } });
  assert.deepEqual(email.cc, ["devpatel0701@gmail.com"]);
});

test("customer confirmation states delivery, revision promise and actual trial date without implying a charge", () => {
  const email = instantConfirmationEmail(details);
  assert.equal(email.to, details.answers.email); assert.equal(email.replyTo, "info@webm8agency.com");
  for (const expected of ["one business day", "WhatsApp", "+447700900123", "Unlimited revisions", "100% satisfied", "£39", "November 19, 2026", details.portalUrl]) assert.ok(email.text.includes(expected), expected);
  assert.ok(!email.text.includes("payment received")); assert.ok(!email.text.includes("cus_example"));
  assert.match(email.html, /html lang="en-US"/);
  assert.match(instantConfirmationEmail({ ...details, billing: { ...details.billing, status: "active" } }).text, /original 10-day free trial/);
});

test("internal notification contains the complete build brief and distinguishes private from public contact details", () => {
  const email = instantNotificationEmail(details);
  assert.equal(email.to, "info@webm8agency.com"); assert.equal(email.replyTo, details.answers.email);
  for (const value of [details.answers.name, details.answers.businessName, details.answers.services, details.answers.area, details.answers.deliveryPhone, details.answers.phone, details.answers.whatsapp, details.answers.enquiryEmail, details.answers.website, ...details.answers.links, details.answers.difference, details.answers.colours, details.answers.address, details.answers.hours, details.answers.menuUrl, details.answers.notes, details.crmId, details.billing.subscriptionId]) assert.ok(email.text.includes(value), value);
  assert.match(email.text, /private delivery/); assert.match(email.text, /publish only these/); assert.match(email.text, /booking link later/);
});

test("untrusted answers are escaped and test-mode emails are visibly labelled", () => {
  const unsafe = { ...details, answers: { ...details.answers, businessName: '<img src=x onerror="alert(1)">\r\nBcc: elsewhere', notes: '<script>steal()</script>' }, billing: { ...details.billing, livemode: false } };
  for (const email of [instantConfirmationEmail(unsafe), instantNotificationEmail(unsafe)]) {
    assert.match(email.subject, /^\[TEST\]/); assert.doesNotMatch(email.subject, /[\r\n]/);
    assert.doesNotMatch(email.html, /<script>|<img src=x/); assert.match(email.html, /&lt;img/);
  }
});

test("retry access fails closed and email configuration rejects malformed destinations and preview live mode", () => {
  const secret = "a".repeat(48);
  assert.equal(emailWorkerAuthorized(`Bearer ${secret}`, secret), true);
  assert.equal(emailWorkerAuthorized("Bearer wrong", secret), false);
  assert.equal(emailWorkerAuthorized(`Bearer ${secret}`, ""), false);
  assert.equal(instantEmailSettings({}), null);
  const config = { INSTANT_EMAILS_ENABLED: "1", INSTANT_STRIPE_MODE: "live", STRIPE_INSTANT_PORTAL_URL: details.portalUrl };
  assert.equal(instantEmailSettings(config)?.notificationEmail, "info@webm8agency.com");
  assert.throws(() => instantEmailSettings({ ...config, INSTANT_NOTIFICATION_EMAIL: "person@example.com\nBcc: bad" }));
  assert.throws(() => instantEmailSettings({ ...config, VERCEL_ENV: "preview" }));
});


test("US customer and team emails preserve the dollar offer, including active subscriptions", () => {
  for (const status of ["trialing", "active"] as const) {
    const us = { ...details, billing: { ...details.billing, status, market: "US" as const } };
    for (const email of [instantConfirmationEmail(us), instantNotificationEmail(us)]) {
      assert.match(email.text, /\$79/);
      assert.doesNotMatch(email.text, /£/);
      assert.match(email.html, /lang="en-US"/);
    }
  }
});
