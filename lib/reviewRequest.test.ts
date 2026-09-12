import assert from "node:assert/strict";
import { test } from "node:test";
import { validateReviewRequest } from "./reviewRequest.ts";

const valid = {
  contactName: "Jamie Smith",
  companyName: "Example Moving Co.",
  email: "jamie@example.com",
  phone: "(555) 123-4567",
  hasWebsite: true,
  websiteUrl: "example.com",
};

test("accepts a complete request and normalizes the website address", () => {
  const result = validateReviewRequest(valid);
  assert.ok(result.ok);
  assert.equal(result.value.websiteUrl, "https://example.com");
  assert.equal(result.value.contactName, "Jamie Smith");
  assert.equal(result.value.companyName, "Example Moving Co.");
  assert.equal(result.value.hasWebsite, true);
});

test("keeps an address that already has a scheme", () => {
  const result = validateReviewRequest({
    ...valid,
    websiteUrl: "http://example.com/moving",
  });
  assert.ok(result.ok);
  assert.equal(result.value.websiteUrl, "http://example.com/moving");
});

test("accepts a company with no website yet", () => {
  const result = validateReviewRequest({
    ...valid,
    hasWebsite: false,
    websiteUrl: "ignored.example.com",
  });
  assert.ok(result.ok);
  assert.equal(result.value.hasWebsite, false);
  assert.equal(result.value.websiteUrl, null);
});

test("treats a blank website as no website supplied, not an error", () => {
  const result = validateReviewRequest({ ...valid, websiteUrl: "   " });
  assert.ok(result.ok);
  assert.equal(result.value.websiteUrl, null);
});

test("reports every missing or malformed field at once", () => {
  const result = validateReviewRequest({
    ...valid,
    contactName: "  ",
    companyName: "",
    email: "nope",
    phone: "12",
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.ok(result.errors.contactName);
  assert.ok(result.errors.companyName);
  assert.ok(result.errors.email);
  assert.ok(result.errors.phone);
});

test("accepts a phone number written any reasonable way", () => {
  for (const phone of ["5551234567", "(555) 123-4567", "+1 555 123 4567"]) {
    const result = validateReviewRequest({ ...valid, phone });
    assert.ok(result.ok, `expected ${phone} to be accepted`);
  }
});

test("keeps recognized plan and billing context and drops anything else", () => {
  const good = validateReviewRequest({
    ...valid,
    plan: "growth",
    billing: "annual",
  });
  assert.ok(good.ok);
  assert.equal(good.value.plan, "growth");
  assert.equal(good.value.billing, "annual");

  const junk = validateReviewRequest({
    ...valid,
    plan: "enterprise",
    billing: "weekly",
  });
  assert.ok(junk.ok);
  assert.equal(junk.value.plan, null);
  assert.equal(junk.value.billing, null);
});

test("carries campaign attribution through", () => {
  const result = validateReviewRequest({
    ...valid,
    utmSource: "facebook",
    utmMedium: "paid_social",
    utmCampaign: "busy-mover",
    referrer: "https://l.facebook.com/",
    pagePath: "/movers/",
  });
  assert.ok(result.ok);
  assert.equal(result.value.utmSource, "facebook");
  assert.equal(result.value.utmCampaign, "busy-mover");
  assert.equal(result.value.pagePath, "/movers/");
});

test("caps absurd input lengths instead of rejecting them", () => {
  const result = validateReviewRequest({
    ...valid,
    companyName: "x".repeat(5000),
  });
  assert.ok(result.ok);
  assert.ok(result.value.companyName.length <= 200);
});

test("rejects a filled honeypot and a submission faster than a human", () => {
  const trap = validateReviewRequest({ ...valid, companyWebsiteHp: "spam" });
  assert.equal(trap.ok, false);

  const tooFast = validateReviewRequest({
    ...valid,
    elapsedMs: 400,
  });
  assert.equal(tooFast.ok, false);
});

test("ignores unknown keys", () => {
  const result = validateReviewRequest({ ...valid, revenue: "$2m", role: "ceo" });
  assert.ok(result.ok);
  assert.ok(!("revenue" in result.value));
});
