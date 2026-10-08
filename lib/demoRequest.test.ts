import assert from "node:assert/strict";
import { test } from "node:test";
import {
  emptyDemoAnswers,
  firstNameOf,
  hasOwnWebsite,
  normaliseLink,
  validateDemoAnswers,
  validateDemoSubmission,
  type DemoAnswers,
} from "./demoRequest.ts";

const valid: DemoAnswers = {
  trade: "plumbing",
  tradeOther: "",
  business: "  Reyes   Plumbing ",
  link: "",
  name: " Jamie   Reyes ",
  phone: " (512) 555-0142 ",
  email: " Jamie@Example.co.uk ",
};

const submission = {
  ...valid,
  submissionKey: "0b6f4c1e-2f0a-4c1b-9a51-6d6f2b7f9a10",
  elapsedMs: 42_000,
  website_hp: "",
  attribution: { utm_source: "facebook", utm_campaign: "uk-trades", ad_id: "{{ad.id}}" },
  referrer: "https://l.facebook.com/",
  pagePath: "/demo/",
};

test("a complete request is accepted and tidied", () => {
  const result = validateDemoAnswers(valid);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.request, {
    trade: "plumbing",
    tradeOther: null,
    business: "Reyes Plumbing",
    link: null,
    name: "Jamie Reyes",
    phone: "(512) 555-0142",
    email: "Jamie@Example.co.uk",
  });
});

test("every required field reports its own message", () => {
  const result = validateDemoAnswers(emptyDemoAnswers);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(Object.keys(result.errors).sort(), ["business", "email", "name", "phone", "trade"]);
  assert.equal(result.errors.trade, "Choose the kind of business you run.");
  assert.equal(result.errors.phone, "Add a phone number so we can call you.");
});

test("something else needs a description, and other trades drop it", () => {
  const missing = validateDemoAnswers({ ...valid, trade: "other" });
  assert.equal(!missing.ok && missing.errors.tradeOther, "Tell us what your business does.");

  const other = validateDemoAnswers({ ...valid, trade: "other", tradeOther: "  Dog   grooming " });
  assert.equal(other.ok && other.request.tradeOther, "Dog grooming");

  const plumbing = validateDemoAnswers({ ...valid, tradeOther: "Dog grooming" });
  assert.equal(plumbing.ok && plumbing.request.tradeOther, null);
});

test("an unknown trade is rejected", () => {
  const result = validateDemoAnswers({ ...valid, trade: "plumber" });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.errors.trade, "Choose the kind of business you run.");
});

test("US and UK phone numbers are accepted as typed", () => {
  for (const phone of ["07700 900123", "020 7946 0018", "(512) 555-0142", "+44 7700 900123", "+1 512.555.0142", "512-555-0142"]) {
    const result = validateDemoAnswers({ ...valid, phone });
    assert.equal(result.ok, true, phone);
  }
});

test("phone numbers that cannot be dialled are rejected", () => {
  for (const phone of ["12345", "call me", "0770O 900123", "44+ 7700 900123", "1234567890123456"]) {
    const result = validateDemoAnswers({ ...valid, phone });
    assert.equal(result.ok, false, phone);
    if (!result.ok) assert.equal(result.errors.phone, "Check your phone number, including the area code.");
  }
});

test("malformed emails are rejected with a plain message", () => {
  for (const email of ["name@", "name@site", "name site@example.com", "@example.com", "name@@example.com"]) {
    const result = validateDemoAnswers({ ...valid, email });
    assert.equal(result.ok, false, email);
    if (!result.ok) assert.equal(result.errors.email, "Check your email address. It should look like name@example.com.");
  }
});

test("answers over the length limit are refused rather than cut", () => {
  const result = validateDemoAnswers({ ...valid, business: "x".repeat(121) });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.errors.business, "Keep this under 120 characters.");
});

test("links gain https:// and must look like a web address", () => {
  assert.equal(normaliseLink("reyesplumbing.com"), "https://reyesplumbing.com/");
  assert.equal(normaliseLink(" https://facebook.com/reyesplumbing "), "https://facebook.com/reyesplumbing");
  assert.equal(normaliseLink("http://www.reyes.co.uk/about"), "http://www.reyes.co.uk/about");
  assert.equal(normaliseLink(""), "");
  for (const junk of ["reyes plumbing", "localhost", "javascript:alert(1)", "ftp://reyes.com", "https://"]) {
    assert.equal(normaliseLink(junk), null, junk);
  }

  const result = validateDemoAnswers({ ...valid, link: "reyesplumbing.com" });
  assert.equal(result.ok && result.request.link, "https://reyesplumbing.com/");

  const bad = validateDemoAnswers({ ...valid, link: "my facebook" });
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.equal(bad.errors.link, "That link doesn't look right. Check it, or leave it empty.");
});

test("social and map links do not count as the business's own website", () => {
  assert.equal(hasOwnWebsite(null), false);
  assert.equal(hasOwnWebsite("https://www.facebook.com/reyesplumbing"), false);
  assert.equal(hasOwnWebsite("https://instagram.com/reyesplumbing"), false);
  assert.equal(hasOwnWebsite("https://maps.app.goo.gl/abc123"), false);
  assert.equal(hasOwnWebsite("https://www.google.co.uk/maps/place/Reyes"), false);
  assert.equal(hasOwnWebsite("https://reyesplumbing.com/"), true);
});

test("the first name is the first word of the name", () => {
  assert.equal(firstNameOf(" Jamie   Reyes "), "Jamie");
  assert.equal(firstNameOf("Priya"), "Priya");
  assert.equal(firstNameOf(""), "");
});

test("a full submission is accepted with clean attribution", () => {
  const result = validateDemoSubmission(submission);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.business, "Reyes Plumbing");
  assert.equal(result.value.submissionKey, submission.submissionKey);
  assert.deepEqual(result.value.attribution, { utm_source: "facebook", utm_campaign: "uk-trades" });
  assert.equal(result.value.referrer, "https://l.facebook.com/");
  assert.equal(result.value.pagePath, "/demo/");
});

test("bots are turned away with one generic message", () => {
  for (const input of [
    { ...submission, website_hp: "https://spam.example" },
    { ...submission, elapsedMs: 400 },
  ]) {
    const result = validateDemoSubmission(input);
    assert.equal(result.ok, false);
    if (!result.ok) assert.deepEqual(result.errors, { form: "That request could not be accepted." });
  }
});

test("a submission without a valid key cannot be saved", () => {
  const result = validateDemoSubmission({ ...submission, submissionKey: "abc" });
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.errors.form);
});

test("a submission that is not an object reports field errors, not a crash", () => {
  const result = validateDemoSubmission(null);
  assert.equal(result.ok, false);
});

test("field errors come back for a submission with bad answers", () => {
  const result = validateDemoSubmission({ ...submission, email: "nope" });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.errors.email, "Check your email address. It should look like name@example.com.");
});

test("a page path must be a path on this site", () => {
  const result = validateDemoSubmission({ ...submission, pagePath: "https://evil.example/" });
  assert.equal(result.ok && result.value.pagePath, null);
});
