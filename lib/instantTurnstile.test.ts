import { test } from "node:test";
import assert from "node:assert/strict";
import { signupProof, validSignupProof, verifyTurnstile, turnstileKeys } from "./instantTurnstile.ts";

test("verification only covers the original signup session until its signed expiry", () => {
  const expires = Date.now() + 30000;
  const proof = signupProof("session-a", expires, "secret");
  assert.equal(validSignupProof("session-a", proof, "secret", expires - 1), true);
  for (const [session, receipt, key, now] of [
    ["session-b", proof, "secret", expires - 1],
    ["session-a", proof, "secret", expires],
    ["session-a", proof, "different-secret", expires - 1],
    ["session-a", proof.replace(String(expires), String(expires + 10000)), "secret", expires - 1],
    ["session-a", undefined, "secret", expires - 1],
  ] as const) assert.equal(validSignupProof(session, receipt, key, now), false);
});

test("only a successful Siteverify result for the signup action and configured host is accepted", async t => {
  const hostname = "instant.example.com";
  const valid = { success: true, hostname, action: "instant_signup" };
  const call = t.mock.method(globalThis, "fetch", async () => Response.json(valid));
  await verifyTurnstile("test-token", "secret", hostname);
  for (const result of [{ ...valid, success: false }, { ...valid, hostname: "other.example.com" }, { ...valid, action: "login" }, {}]) {
    call.mock.mockImplementation(async () => Response.json(result));
    await assert.rejects(verifyTurnstile("test-token", "secret", hostname), { status: 403 });
  }
  call.mock.mockImplementation(async () => new Response(null, { status: 503 }));
  await assert.rejects(verifyTurnstile("test-token", "secret", hostname), { status: 503 });
  const before = call.mock.callCount();
  for (const token of [null, "", "x".repeat(2049)]) await assert.rejects(verifyTurnstile(token, "secret", hostname), { status: 403 });
  assert.equal(call.mock.callCount(), before);
});

test("public test credentials cannot authorize deployed or live signups", () => {
  const env = {
    TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
    TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
    INSTANT_STRIPE_MODE: "test",
    INSTANT_WEBSITES_ORIGIN: "http://localhost:3000",
  };
  assert.doesNotThrow(() => turnstileKeys(env));
  for (const overrides of [
    { VERCEL_ENV: "production" },
    { INSTANT_WEBSITES_ORIGIN: "https://instant.example.com" },
    { INSTANT_STRIPE_MODE: "live" },
    { TURNSTILE_SECRET_KEY: "" },
  ]) assert.throws(() => turnstileKeys({ ...env, ...overrides }), { status: 503 });
});
