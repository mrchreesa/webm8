import test from "node:test";
import assert from "node:assert/strict";
import { createInstantAnalytics } from "./instantAnalytics.ts";

test("instant events wait for the tracker and never send arbitrary details or Meta conversions", () => {
  const calls: unknown[][] = [];
  let ready = false;
  const api = { form: (...args: unknown[]) => { calls.push(args); return true; }, track: (...args: unknown[]) => { calls.push(args); return true; } };
  const recorder = createInstantAnalytics(() => true, () => ready ? api : undefined);
  recorder.form("start", 1); recorder.form("step_complete", 1); recorder.action("checkout_ready");
  assert.equal(calls.length, 0);
  ready = true; recorder.flush(); recorder.flush();
  assert.deepEqual(calls, [["instant_website", "start", { step: 1, steps: 3 }], ["instant_website", "step_complete", { step: 1, steps: 3 }], ["instant_checkout_ready"]]);
  recorder.form("success", 3);
  assert.deepEqual(calls.at(-1), ["instant_website", "success", { step: 3, steps: 3 }]);
});
test("disabled previews and privacy withdrawal cannot replay queued analytics", () => {
  let enabled = true, ready = false, calls = 0;
  const api = { form: () => { calls++; return true; }, track: () => { calls++; return true; } };
  const recorder = createInstantAnalytics(() => enabled, () => ready ? api : undefined);
  recorder.form("start", 1); enabled = false; recorder.flush(); ready = true;
  recorder.action("checkout_ready"); recorder.form("success", 3);
  enabled = true; recorder.flush(); recorder.form("success", 4);
  assert.equal(calls, 0);
});
test("blocked or rejected tracking never retries a declined event and queues are bounded", () => {
  let ready = false, calls = 0;
  const api = { form: () => { calls++; return false; }, track: () => false };
  const recorder = createInstantAnalytics(() => true, () => ready ? api : undefined);
  for (let i = 0; i < 100; i++) recorder.form("step_view", 1);
  ready = true; recorder.flush(); recorder.flush();
  assert.equal(calls, 40);
});
test("a broken analytics provider cannot interrupt checkout or brief submission", () => {
  const recorder = createInstantAnalytics(() => true, () => ({ form: () => { throw new Error("Provider failed"); }, track: () => { throw new Error("Provider failed"); } }));
  assert.doesNotThrow(() => { recorder.form("success", 3); recorder.action("trial_confirmed"); });
});
