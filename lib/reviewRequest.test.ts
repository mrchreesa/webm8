import assert from "node:assert/strict";
import { test } from "node:test";
import { validateReviewRequest } from "./reviewRequest.ts";

const valid = {
  contactName: "Jamie Smith",
  companyName: "Example Moving Co.",
  email: "jamie@example.com",
  phone: "(555) 123-4567",
  businessLink: "facebook.com/examplemoving",
  siteFeel: ["clean-professional", "warm-friendly"],
  additionalNotes: "Family-owned and no stock photos, please.",
  submissionKey: "11111111-1111-4111-8111-111111111111",
};

test("accepts a complete request and normalizes the business link", () => {
  const result = validateReviewRequest(valid);
  assert.ok(result.ok);
  assert.equal(
    result.value.businessLink,
    "https://facebook.com/examplemoving",
  );
  assert.deepEqual(result.value.siteFeel, [
    "clean-professional",
    "warm-friendly",
  ]);
  assert.equal(
    result.value.additionalNotes,
    "Family-owned and no stock photos, please.",
  );
});

test("requires a Google Business or social-media link", () => {
  const missing = validateReviewRequest({ ...valid, businessLink: "" });
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.ok(missing.errors.businessLink);

  const malformed = validateReviewRequest({ ...valid, businessLink: "not-a-link" });
  assert.equal(malformed.ok, false);
  if (!malformed.ok) assert.ok(malformed.errors.businessLink);
});

test("accepts common business and social links", () => {
  for (const businessLink of [
    "https://maps.app.goo.gl/example",
    "facebook.com/examplemoving",
    "instagram.com/examplemoving",
  ]) {
    const result = validateReviewRequest({ ...valid, businessLink });
    assert.ok(result.ok, `expected ${businessLink} to be accepted`);
  }
});

test("requires at least one recognized site feel", () => {
  const empty = validateReviewRequest({ ...valid, siteFeel: [] });
  assert.equal(empty.ok, false);
  if (!empty.ok) assert.ok(empty.errors.siteFeel);

  const result = validateReviewRequest({
    ...valid,
    siteFeel: ["bold-energetic", "unknown", "bold-energetic"],
  });
  assert.ok(result.ok);
  assert.deepEqual(result.value.siteFeel, ["bold-energetic"]);
});

test("allows the additional note to be left blank", () => {
  const result = validateReviewRequest({ ...valid, additionalNotes: "   " });
  assert.ok(result.ok);
  assert.equal(result.value.additionalNotes, null);
});

test("caps a long additional note", () => {
  const result = validateReviewRequest({
    ...valid,
    additionalNotes: "x".repeat(5000),
  });
  assert.ok(result.ok);
  assert.ok(result.value.additionalNotes);
  assert.equal(result.value.additionalNotes.length, 1200);
});

test("reports every missing or malformed contact field at once", () => {
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

test("accepts an optional phone number written any reasonable way", () => {
  for (const phone of [
    "",
    "5551234567",
    "(555) 123-4567",
    "+1 555 123 4567",
  ]) {
    const result = validateReviewRequest({ ...valid, phone });
    assert.ok(result.ok, `expected ${phone || "blank"} to be accepted`);
  }
});

test("keeps recognized plan and billing context and defaults invalid values", () => {
  const good = validateReviewRequest({
    ...valid,
    plan: "growth",
    billing: "annual",
  });
  assert.ok(good.ok);
  assert.equal(good.value.plan, "growth");
  assert.equal(good.value.billing, "annual");

  const fallback = validateReviewRequest({
    ...valid,
    plan: "enterprise",
    billing: "weekly",
  });
  assert.ok(fallback.ok);
  assert.equal(fallback.value.plan, null);
  assert.equal(fallback.value.billing, "monthly");
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

test("rejects a bad submission key, a filled honeypot, and a fast submission", () => {
  const badKey = validateReviewRequest({ ...valid, submissionKey: "not-a-uuid" });
  assert.equal(badKey.ok, false);

  const trap = validateReviewRequest({ ...valid, companyWebsiteHp: "spam" });
  assert.equal(trap.ok, false);

  const tooFast = validateReviewRequest({ ...valid, elapsedMs: 400 });
  assert.equal(tooFast.ok, false);
});

test("ignores unknown keys", () => {
  const result = validateReviewRequest({ ...valid, revenue: "$2m", role: "ceo" });
  assert.ok(result.ok);
  assert.ok(!("revenue" in result.value));
});
