import assert from "node:assert/strict";
import test from "node:test";
import {
  flushAnalyticsQueue,
  trackAcceptedDemoRequest,
  trackAcceptedReviewRequest,
  trackEvent,
} from "./analytics.ts";

test("withdrawal gates business events, standard Meta leads and queued provider events", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  const calls: unknown[][] = [];
  const fake = {
    __webm8MeasurementAllowed: false,
    __webm8AnalyticsQueue: [{ name: "demo_request_accepted", details: {} }],
    fbq: (...args: unknown[]) => calls.push(args),
    mixpanel: { track: (...args: unknown[]) => calls.push(args) },
    WebM8Analytics: {
      track: (...args: unknown[]) => calls.push(args),
      form: (...args: unknown[]) => calls.push(args),
    },
  };
  Object.defineProperty(globalThis, "window", {
    value: fake,
    configurable: true,
  });
  try {
    trackEvent("demo_cta_clicked");
    trackAcceptedDemoRequest("gating-demo");
    trackAcceptedReviewRequest("gating-review");
    flushAnalyticsQueue();
    assert.deepEqual(calls, []);
    fake.__webm8MeasurementAllowed = true;
    trackAcceptedDemoRequest("gating-demo");
    trackAcceptedDemoRequest("gating-demo");
    assert.equal(
      calls.filter((args) => args[0] === "track" && args[1] === "Lead").length,
      1,
    );
    fake.__webm8MeasurementAllowed = false;
    const before = calls.length;
    trackAcceptedReviewRequest("gating-review-after-withdrawal");
    flushAnalyticsQueue();
    assert.equal(calls.length, before);
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
