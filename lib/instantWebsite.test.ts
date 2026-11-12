import assert from "node:assert/strict";
import test from "node:test";
import { DRAFT_TTL_MS, emptyAnswers, needsQuote, trialEndDate, readDraft, safeUrl, suggestedContacts, validateAttachment, validateStep, type Answers } from "./instantWebsite.ts";

function brief(overrides: Partial<Answers> = {}): Answers {
  return { ...emptyAnswers(), scope: "standard", industry: "trades", features: ["enquiries"], businessName: "Example Plumbing", area: "Bromley", hasWebsite: "no", name: "Test Owner", email: "owner@example.com", deliveryPhone: "+44 7700 900123", checkoutAcknowledged: true, services: "Boiler repairs", contacts: ["email"], enquiryEmail: "business@example.com", ...overrides };
}

test("commerce and custom features always route to a quote, even alongside included features", () => {
  assert.equal(needsQuote(brief()), false);
  assert.equal(needsQuote(brief({ features: ["information", "commerce"] })), true);
  assert.equal(needsQuote(brief({ features: ["requests", "custom"] })), true);
  assert.equal(needsQuote(brief({ industry: "other" })), false);
  assert.equal(needsQuote(brief({ scope: "commerce", features: [] })), true);
  assert.equal(needsQuote(brief({ scope: "custom", features: [] })), true);
});

test("new businesses can qualify without a website or social profiles", () => {
  assert.deepEqual(validateStep("business", brief({ area: "", hasWebsite: "", features: [], services: "", contacts: [], links: [""] })), {});
  const errors = validateStep("business", emptyAnswers());
  assert.deepEqual(Object.keys(errors), ["name", "email", "deliveryPhone", "businessName", "industry"]);
  assert.equal(emptyAnswers().scope, "standard");
  assert.deepEqual(validateStep("business", brief({ scope: "", features: [] })), {});
});

test("signup requires a delivery phone independently of public contact numbers", () => {
  for (const deliveryPhone of ["", "123", "not a phone", "1234567890123456"]) {
    assert.ok(validateStep("business", brief({ deliveryPhone, phone: "+44 7700 900456", whatsapp: "+44 7700 900789" })).deliveryPhone);
  }
  assert.deepEqual(validateStep("business", brief({ deliveryPhone: "07700 900123", phone: "", whatsapp: "" })), {});
  assert.deepEqual(validateStep("business", brief({ deliveryPhone: "+1 (202) 555-0123" })), {});
});

test("payment asks only for acknowledgement; website requirements are collected afterwards", () => {
  const answers = brief({ features: [], hasWebsite: "", services: "", contacts: [], checkoutAcknowledged: false });
  assert.deepEqual(validateStep("checkout", answers), { checkoutAcknowledged: "Confirm you understand the free trial and monthly price after it ends." });
  assert.deepEqual(validateStep("checkout", { ...answers, checkoutAcknowledged: true }), {});
  assert.deepEqual(Object.keys(validateStep("brief", answers)), ["hasWebsite", "services", "contacts"]);
  assert.deepEqual(validateStep("brief", brief({ features: [] })), {});
});

test("URLs allow convenient bare domains but reject scripts, credentials and malformed values", () => {
  assert.equal(safeUrl("example.co.uk/path"), "https://example.co.uk/path");
  for (const input of ["javascript:alert(1)", "https://user:password@example.com", "not a url", "file:///etc/passwd", "https://"]) assert.equal(safeUrl(input), null, input);
});

test("hidden website URL does not block a customer who switches to no existing website", () => {
  assert.deepEqual(validateStep("brief", brief({ website: "bad url", hasWebsite: "no" })), {});
  assert.ok(validateStep("brief", brief({ website: "bad url", hasWebsite: "yes" })).website);
});

test("booking link can be deferred only with a valid email for the request fallback", () => {
  assert.ok(validateStep("brief", brief({ contacts: ["booking"] })).bookingUrl);
  assert.deepEqual(validateStep("brief", brief({ contacts: ["booking"], bookingLater: true })), {});
  assert.ok(validateStep("brief", brief({ contacts: ["booking"], bookingLater: true, enquiryEmail: "" })).enquiryEmail);
  assert.deepEqual(validateStep("brief", brief({ contacts: ["booking"], bookingUrl: "book.example.com", enquiryEmail: "" })), {});
});

test("WhatsApp can reuse a valid selected phone, but cannot reuse a hidden phone", () => {
  assert.deepEqual(validateStep("brief", brief({ contacts: ["phone", "whatsapp"], phone: "+44 20 7946 0000", samePhone: true })), {});
  assert.ok(validateStep("brief", brief({ contacts: ["whatsapp"], phone: "+44 20 7946 0000", samePhone: true })).whatsapp);
});

test("custom quote asks for feature details; ecommerce quote does not require them", () => {
  assert.ok(validateStep("quote", brief({ scope: "custom", features: [] })).quoteDetails);
  assert.deepEqual(validateStep("quote", brief({ features: ["commerce"] })), {});
});

test("suggested contact channels follow the chosen requirements", () => {
  assert.deepEqual(suggestedContacts(brief({ features: ["requests", "booking"] })), ["request", "booking"]);
  assert.deepEqual(suggestedContacts(brief({ features: ["information"] })), ["email"]);
});

test("the illustrative free-trial end is ten days after checkout across calendar boundaries", () => {
  assert.equal(trialEndDate("2026-11-09"), "2026-11-19");
  assert.equal(trialEndDate("2026-01-31"), "2026-02-10");
  assert.equal(trialEndDate("2028-02-20"), "2028-03-01");
  assert.equal(trialEndDate("2026-12-25"), "2027-01-04");
  assert.equal(trialEndDate("2026-03-25"), "2026-04-04");
});

test("draft restoration rejects corrupt, expired and future data", () => {
  const now = 1800000000000;
  assert.equal(readDraft("{broken", now), null);
  assert.equal(readDraft(JSON.stringify({ version: 1, savedAt: now - DRAFT_TTL_MS - 1, answers: brief() }), now), null);
  assert.equal(readDraft(JSON.stringify({ version: 1, savedAt: now + 999999, answers: brief() }), now), null);
});

test("restoration cannot skip essential fields or checkout acknowledgement", () => {
  const now = 1800000000000;
  const restore = (answers: Answers, checkoutPreviewed: boolean) => readDraft(JSON.stringify({ version: 1, savedAt: now, step: "complete", answers, checkoutPreviewed }), now);
  assert.equal(restore(brief(), true)?.step, "complete");
  assert.equal(restore(brief({ features: [] }), true)?.step, "complete");
  assert.equal(restore(brief(), false)?.step, "checkout");
  assert.equal(restore(brief({ services: "" }), true)?.step, "brief");
  assert.equal(restore(brief({ businessName: "" }), true)?.step, "business");
  assert.equal(restore(brief({ name: "", email: "invalid" }), true)?.step, "business");
  assert.equal(restore(brief({ deliveryPhone: "" }), true)?.step, "business");
  assert.equal(restore(brief({ scope: "" }), true)?.step, "complete");
  assert.equal(restore(brief({ scope: "" }), true)?.answers.scope, "standard");
  assert.equal(restore(brief({ features: [], hasWebsite: "" }), true)?.step, "brief");
  assert.equal(restore(brief({ features: ["commerce"] }), true)?.step, "quote");
});

test("older drafts missing a delivery phone preserve their answers and return to step one", () => {
  const now = 1800000000000;
  const oldAnswers: Partial<Answers> = brief({ phone: "+44 7700 900456", whatsapp: "+44 7700 900789" });
  delete oldAnswers.deliveryPhone;
  const draft = readDraft(JSON.stringify({ version: 1, savedAt: now, step: "complete", answers: oldAnswers, checkoutPreviewed: true }), now);
  assert.equal(draft?.step, "business");
  assert.equal(draft?.answers.deliveryPhone, "");
  assert.equal(draft?.answers.businessName, oldAnswers.businessName);
  assert.equal(draft?.answers.services, oldAnswers.services);
  assert.equal(draft?.answers.phone, oldAnswers.phone);
  assert.equal(draft?.answers.whatsapp, oldAnswers.whatsapp);
  assert.equal(draft?.checkoutPreviewed, true);
  const current = readDraft(JSON.stringify({ ...draft, step: "complete", answers: { ...draft?.answers, deliveryPhone: "+44 7700 900123" } }), now);
  assert.equal(current?.step, "complete");
  assert.equal(current?.answers.deliveryPhone, "+44 7700 900123");
});

test("old qualification and extras drafts migrate into the new three-step order without losing answers", () => {
  const now = 1800000000000;
  const oldAnswers: Partial<Answers> = brief();
  delete oldAnswers.scope;
  const restore = (step: string, answers = oldAnswers) => readDraft(JSON.stringify({ version: 1, savedAt: now, step, answers, checkoutPreviewed: true }), now);
  assert.equal(restore("fit")?.step, "business");
  assert.equal(restore("extras")?.step, "brief");
  assert.equal(restore("extras")?.answers.scope, "standard");
  assert.equal(restore("extras")?.answers.businessName, "Example Plumbing");
  assert.equal(restore("checkout", { ...oldAnswers, name: "" })?.step, "business");
  assert.equal(restore("checkout", { ...oldAnswers, features: ["commerce"] })?.step, "quote");
});

test("optional details stay in the website step and cannot restore an invalid completed brief", () => {
  const answers = brief({ industry: "food", menuUrl: "not a link" });
  assert.ok(validateStep("brief", answers).menuUrl);
  assert.equal(readDraft(JSON.stringify({ version: 1, savedAt: Date.now(), step: "complete", answers, checkoutPreviewed: true }))?.step, "brief");
});

test("restoration bounds input and removes unknown options and properties", () => {
  const now = 1800000000000;
  const draft = readDraft(JSON.stringify({ version: 1, savedAt: now, step: "fit", answers: { ...brief(), businessName: "x".repeat(9000), features: ["enquiries", "unrecognised"], contacts: ["email", "unrecognised"], links: [42, "example.com"], secret: "never restore" } }), now);
  assert.equal(draft?.answers.businessName.length, 3000);
  assert.deepEqual(draft?.answers.features, ["enquiries"]);
  assert.deepEqual(draft?.answers.links, ["example.com"]);
  assert.equal(Object.hasOwn(draft!.answers, "secret"), false);
});

test("local file selection rejects unsafe types, empty files and oversized assets", () => {
  assert.equal(validateAttachment({ name: "logo.png", type: "image/png", size: 1000 }), null);
  assert.ok(validateAttachment({ name: "logo.svg", type: "image/svg+xml", size: 1000 }));
  assert.ok(validateAttachment({ name: "menu.pdf", type: "application/pdf", size: 0 }));
  assert.ok(validateAttachment({ name: "photo.jpg", type: "image/jpeg", size: 11 * 1024 * 1024 }));
});
