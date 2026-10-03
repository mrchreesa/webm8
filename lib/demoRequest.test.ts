import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEMO_PREFILL_KEY,
  demoRequestMailFields,
  demoRequestSubject,
  parseDemoPrefill,
  readDemoPrefill,
  resolveDemoTrade,
  serializeDemoPrefill,
  validateDemoRequest,
  writeDemoPrefill,
  type DemoRequestInput,
} from "./demoRequest.ts";
import { buildMailtoHref } from "./mailto.ts";

const valid: DemoRequestInput = {
  business: "  Reyes   Plumbing ",
  trade: "plumbing",
  name: " Jamie Reyes ",
  email: " Jamie@Example.co.uk ",
  phone: "",
  area: "Austin, TX",
  website: "reyesplumbing.com",
  goal: "",
};

test("a complete request is accepted and tidied", () => {
  const result = validateDemoRequest(valid);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.request.business, "Reyes Plumbing");
  assert.equal(result.request.name, "Jamie Reyes");
  assert.equal(result.request.email, "Jamie@Example.co.uk");
  assert.equal(result.request.trade, "plumbing");
  assert.equal(result.request.website, "reyesplumbing.com");
});

test("long business names are kept in full on the form", () => {
  const result = validateDemoRequest({ ...valid, business: "Northside Heating & Air Conditioning LLC" });
  assert.equal(result.ok && result.request.business, "Northside Heating & Air Conditioning LLC");
});

test("every required field reports its own message", () => {
  const result = validateDemoRequest({ business: " ", trade: "", name: "", email: "", phone: "", area: "", website: "", goal: "" });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(Object.keys(result.errors).sort(), ["area", "business", "email", "name", "trade"]);
  assert.equal(result.errors.email, "Add your email address.");
});

test("malformed emails are rejected with a plain message", () => {
  for (const email of ["name@", "name@site", "name site@example.com", "@example.com", "name@@example.com"]) {
    const result = validateDemoRequest({ ...valid, email });
    assert.equal(result.ok, false, email);
    if (!result.ok) assert.equal(result.errors.email, "Check your email address. It should look like name@example.com.");
  }
});

test("an unknown trade is rejected", () => {
  const result = validateDemoRequest({ ...valid, trade: "plumber" });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.errors.trade, "Choose the kind of business you run.");
});

test("the email draft has a clear subject and leaves out empty answers", () => {
  const result = validateDemoRequest(valid);
  assert.ok(result.ok);
  if (!result.ok) return;
  assert.equal(demoRequestSubject(result.request), "Website demo request from Reyes Plumbing");
  const fields = demoRequestMailFields(result.request);
  assert.equal(fields["Type of business"], "Plumbing business");
  assert.equal(fields.Source, "WebM8 marketing site, /demo");
  const href = buildMailtoHref("info@webm8agency.com", demoRequestSubject(result.request), fields);
  const body = new URLSearchParams(href.split("?")[1]).get("body") ?? "";
  assert.ok(body.includes("Business: Reyes Plumbing"));
  assert.ok(!body.includes("Phone:"));
  assert.ok(!body.includes("Wants more of:"));
});

test("prefill parsing survives junk", () => {
  for (const raw of [null, undefined, "", "not json", "[]", "42", "null", '{"trade":5}']) {
    assert.deepEqual(parseDemoPrefill(raw), { trade: null, business: "" }, String(raw));
  }
  assert.deepEqual(parseDemoPrefill('{"trade":"HVAC","business":"  Reyes   Plumbing "}'), { trade: "hvac", business: "Reyes Plumbing" });
  assert.deepEqual(parseDemoPrefill('{"trade":"toString","business":"x"}'), { trade: null, business: "x" });
  assert.equal(parseDemoPrefill(JSON.stringify({ trade: null, business: "A".repeat(50) })).business.length, 30);
});

test("prefill round-trips through storage", () => {
  const store = new Map<string, string>();
  const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
  writeDemoPrefill({ trade: "dental", business: "Maple Family Dental" }, storage);
  assert.ok(store.has(DEMO_PREFILL_KEY));
  assert.deepEqual(readDemoPrefill(storage), { trade: "dental", business: "Maple Family Dental" });
  assert.equal(serializeDemoPrefill({ trade: null, business: "  a  b " }), '{"trade":null,"business":"a b"}');
});

test("blocked storage never throws", () => {
  const blocked = {
    getItem: () => { throw new Error("SecurityError"); },
    setItem: () => { throw new Error("QuotaExceededError"); },
  };
  assert.deepEqual(readDemoPrefill(blocked), { trade: null, business: "" });
  assert.doesNotThrow(() => writeDemoPrefill({ trade: "hvac", business: "x" }, blocked));
  assert.deepEqual(readDemoPrefill(null), { trade: null, business: "" });
  assert.doesNotThrow(() => writeDemoPrefill({ trade: "hvac", business: "x" }, null));
});

test("a valid ?trade= wins over the stored trade", () => {
  const stored = { trade: "salon" as const, business: "" };
  assert.equal(resolveDemoTrade("?trade=dental", stored), "dental");
  assert.equal(resolveDemoTrade("?trade=nope", stored), "salon");
  assert.equal(resolveDemoTrade("", stored), "salon");
  assert.equal(resolveDemoTrade("", { trade: null, business: "" }), null);
});
