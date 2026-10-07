import assert from "node:assert/strict";
import test from "node:test";
import {
  flushAnalyticsQueue,
  trackAcceptedDemoRequest,
  trackEvent,
} from "./analytics.ts";

/** Runs `body` with a stand-in `window`, then puts the real one back. */
function withWindow(fake: object, body: () => void) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { value: fake, configurable: true });
  try {
    body();
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else Reflect.deleteProperty(globalThis, "window");
  }
}

test("business events reach every configured provider, and a saved demo request fires Meta's Lead once", () => {
  const calls: unknown[][] = [];
  const fake = {
    fbq: (...args: unknown[]) => calls.push(["fbq", ...args]),
    mixpanel: { track: (...args: unknown[]) => calls.push(["mixpanel", ...args]) },
    WebM8Analytics: {
      track: (...args: unknown[]) => calls.push(["webm8.track", ...args]),
      form: (...args: unknown[]) => calls.push(["webm8.form", ...args]),
    },
  };
  withWindow(fake, () => {
    trackEvent("demo_form_started");
    assert.deepEqual(calls, [
      ["mixpanel", "demo_form_started", {}],
      ["webm8.track", "demo_form_started"],
      ["webm8.form", "demo_request", "start"],
      ["fbq", "trackCustom", "demo_form_started", {}],
    ]);

    calls.length = 0;
    trackAcceptedDemoRequest("demo-request-1");
    trackAcceptedDemoRequest("demo-request-1");
    const leads = calls.filter((args) => args[0] === "fbq" && args[1] === "track" && args[2] === "Lead");
    assert.equal(leads.length, 1);
    assert.deepEqual(leads[0][4], { eventID: "demo-request-1" });
  });
});

test("events wait in a queue until Mixpanel loads", () => {
  const tracked: unknown[][] = [];
  const fake: { mixpanel?: { track: (...args: unknown[]) => void } } = {};
  withWindow(fake, () => {
    trackEvent("demo_cta_clicked", { placement: "hero" });
    assert.equal(tracked.length, 0);
    fake.mixpanel = { track: (...args) => tracked.push(args) };
    flushAnalyticsQueue();
    assert.deepEqual(tracked, [["demo_cta_clicked", { placement: "hero" }]]);
  });
});
