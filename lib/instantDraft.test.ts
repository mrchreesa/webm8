import assert from "node:assert/strict";
import test from "node:test";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { draftAnswers, draftVisitKey, hasDraftContent } from "./instantDraft.ts";
import { requestVisitorCountry } from "./instantCountry.ts";
import { draftReportAuthorized, purgeInstantDrafts, readInstantDrafts, saveInstantDraft } from "./instantDraftServer.ts";
import { billingPool, tokenHash } from "./instantBillingServer.ts";

test("drafts retain incomplete answers, replace cleared values and exclude payment/unknown fields", () => {
  const draft = draftAnswers({ name: "Ta", email: "tavi@", notes: "<script>example</script>", links: ["", "https://example.com", 4], card: "4242", password: "secret", checkoutAcknowledged: true, _billing: { price: 1 } });
  assert.deepEqual(draft, { name: "Ta", email: "tavi@", notes: "<script>example</script>", links: ["https://example.com"] });
  assert.equal(hasDraftContent(draftAnswers({ scope: "standard" })), false);
  assert.equal(hasDraftContent(draftAnswers({ name: "" })), false);
  assert.equal(String(draftAnswers({ notes: "x".repeat(40000) }).notes).length, 2000);
});

test("draft links require the active Instant Websites tracker and a complete visit pair", () => {
  const visitorId = randomUUID(), sessionId = randomUUID();
  const siteId = "ea003967-7c28-47a1-a4a8-6b0b2713879c";
  assert.equal(draftVisitKey({ siteId, visitorId, sessionId }), `${visitorId}/${sessionId}`);
  assert.equal(draftVisitKey(null), null);
  assert.equal(draftVisitKey({ siteId: randomUUID(), visitorId, sessionId }), null);
  assert.equal(draftVisitKey({ siteId, visitorId, sessionId: "" }), null);
});

test("visitor country uses the deployment edge only, independently of the pricing market", () => {
  for (const [input, expected] of [["US","US"], ["gb","GB"], ["CA","CA"], ["ZZ",null], ["XX",null], ["EU",null], ["US, GB",null], ["",null]]) {
    const headers = new Headers({ "x-vercel-ip-country": input!, "cf-ipcountry": "GB" });
    assert.equal(requestVisitorCountry(headers, true), expected);
    assert.equal(requestVisitorCountry(headers, false), null);
  }
  assert.equal(requestVisitorCountry(new Headers({ "accept-language": "en-GB" }), true), null);
});

test("draft reports require a separate signed filter, fresh timestamp, and exact request body", () => {
  const secret = "fixture-not-a-real-credential-12345678", now = Date.now(), timestamp = String(now), body = '{"page":1}';
  const signature = createHmac("sha256", secret).update(`instant-drafts:v1\n${timestamp}\n${body}`).digest("hex");
  assert.equal(draftReportAuthorized(body, timestamp, signature, secret, now), true);
  assert.equal(draftReportAuthorized('{"page":2}', timestamp, signature, secret, now), false);
  assert.equal(draftReportAuthorized(body, timestamp, signature, secret, now + 300001), false);
  assert.equal(draftReportAuthorized(body, timestamp, "fake", secret, now), false);
  assert.equal(draftReportAuthorized(body, timestamp, signature, "wrong-secret-that-is-long-enough-0000", now), false);
});

test("Postgres draft lifecycle: ownership, stale saves, deletion, completion, expiry and pagination", { skip: !process.env.INSTANT_DRAFT_TEST_DATABASE_URL }, async t => {
  const url = new URL(process.env.INSTANT_DRAFT_TEST_DATABASE_URL!);
  assert.equal(url.hostname, "127.0.0.1"); assert.equal(url.port, "55439"); assert.equal(url.pathname, "/instant_drafts_test");
  Object.assign(process.env, { INSTANT_BILLING_ENABLED: "1", INSTANT_STRIPE_MODE: "test", STRIPE_RESTRICTED_KEY: "rk_test_fixture", NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_fixture", STRIPE_WEBHOOK_SECRET: "whsec_fixture", STRIPE_INSTANT_PRICE_ID: "price_fixture", STRIPE_INSTANT_US_PRICE_ID: "price_us_fixture", STRIPE_INSTANT_PORTAL_CONFIG: "bpc_fixture", STRIPE_INSTANT_PORTAL_URL: "https://billing.stripe.com/p/login/test_fixture", INSTANT_DATABASE_URL: url.href, INSTANT_WEBSITES_ORIGIN: "http://127.0.0.1:3057", CRM_WEBSITE_INTAKE_URL: "https://example.com/intake", WEBSITE_INTAKE_SECRET: "fixture-not-a-real-credential-12345678" });
  const db = billingPool();
  await db.query(await readFile(new URL("../migrations/001_instant_billing.sql", import.meta.url), "utf8"));
  await db.query(await readFile(new URL("../migrations/004_instant_drafts.sql", import.meta.url), "utf8"));
  await db.query("TRUNCATE instant_websites.drafts,instant_websites.orders CASCADE");
  const token = randomBytes(32).toString("hex"), now = Date.now(), day = new Date(now).toISOString().slice(0,10);
  const payload = { enabled: true, step: "business", revision: now, answers: { name: "Test draft", email: "partial@", _visitorCountry: "GB" } };
  const report = () => readInstantDrafts({ from: day, to: day });
  try {
    await t.test("private snapshots and stale retries", async () => {
      await assert.rejects(saveInstantDraft("bad-token", payload));
      await saveInstantDraft(token, payload, "US");
      assert.equal((await saveInstantDraft(token,payload,"GB")).saved,true);
      const first = (await report()).items[0];
      assert.equal(first.estimated_country,"US");
      assert.deepEqual(first.answers,{name:"Test draft",email:"partial@"});
      await saveInstantDraft(token, { ...payload, revision: now + 1, answers: { name: "Newest", email: "" } });
      assert.equal((await saveInstantDraft(token, payload)).saved,false);
      const rows = (await report()).items;
      assert.equal(rows[0].estimated_country,null); assert.equal(rows.length,1); assert.deepEqual(rows[0].answers,{name:"Newest"});
      assert.equal("access_hash" in rows[0],false); assert.equal("checkout_session_id" in rows[0],false);
    });
    await t.test("opting out removes values and late saves cannot recreate them", async () => {
      await saveInstantDraft(token, { ...payload, enabled:false,revision:now+2 });
      await saveInstantDraft(token,payload);
      assert.equal((await report()).total,0);
      assert.deepEqual((await db.query("SELECT answers FROM instant_websites.drafts WHERE access_hash=$1",[tokenHash(token)])).rows[0].answers,{});
    });
    await t.test("final submissions disappear and cannot be reopened by browser claims", async () => {
      await saveInstantDraft(token,{...payload,revision:now+3});
      await db.query("INSERT INTO instant_websites.orders(id,access_hash,answers,submitted_at) VALUES($1,$2,'{}',now())",[randomUUID(),tokenHash(token)]);
      assert.equal((await report()).total,0);
      await saveInstantDraft(token,{...payload,revision:now+4});
      await purgeInstantDrafts();
      assert.equal((await db.query("SELECT count(*) FROM instant_websites.drafts")).rows[0].count,"0");
    });
    await t.test("expired drafts are hidden and purged; pages clamp after removal", async () => {
      for(let i=0;i<22;i++) await saveInstantDraft(randomBytes(32).toString("hex"),payload);
      const browser = randomUUID(), session = randomUUID(), key = `${browser}/${session}`;
      const otherSession = `${browser}/${randomUUID()}`, otherBrowser = `${randomUUID()}/${session}`;
      const linkedToken = randomBytes(32).toString("hex");
      const linked = { ...payload, visitKey: key };
      assert.equal((await saveInstantDraft(linkedToken, linked, "GB")).saved, true);
      assert.equal((await saveInstantDraft(linkedToken, { ...linked, visitKey: otherSession }, "GB")).saved, false);
      await db.query("UPDATE instant_websites.drafts SET updated_at=updated_at-interval '1 second' WHERE access_hash=$1", [tokenHash(linkedToken)]);
      const query = { from: new Date(now - 86400000).toISOString().slice(0,10), to: day, visits: [key, otherSession, otherBrowser] };
      const badge = await readInstantDrafts(query);
      assert.ok(!badge.items.some(item => item.visit_key === key));
      assert.deepEqual(badge.matches.map(item => item.visit_key), [key]);
      assert.deepEqual(badge.matches[0].answers, {});
      assert.equal(badge.matches[0].estimated_country, "GB");
      const selected = await readInstantDrafts({ ...query, selectedVisit: key });
      assert.deepEqual(selected.matches[0].answers, { name: "Test draft", email: "partial@" });
      assert.deepEqual((await readInstantDrafts({ ...query, selectedVisit: otherSession })).matches[0].answers, {});
      await assert.rejects(readInstantDrafts({ ...query, selectedVisit: randomUUID() }));
      await saveInstantDraft(linkedToken, { ...linked, enabled: false, revision: now + 1 });
      assert.deepEqual((await readInstantDrafts(query)).matches, []);
      assert.equal((await report()).items.length,20);
      const page=await readInstantDrafts({from:day,to:day,page:999});
      assert.equal(page.page,2);assert.equal(page.items.length,2);
      await db.query("UPDATE instant_websites.drafts SET updated_at=now()-interval '25 hours'");
      assert.equal((await report()).total,0);
      await purgeInstantDrafts();
      assert.equal((await db.query("SELECT count(*) FROM instant_websites.drafts")).rows[0].count,"0");
    });
  } finally { await db.query("TRUNCATE instant_websites.drafts,instant_websites.orders CASCADE"); await db.end(); }
});
