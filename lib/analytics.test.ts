import assert from "node:assert/strict";
import test from "node:test";
import {
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
    gtag: (...args: unknown[]) => calls.push(["gtag", ...args]),
    WebM8Analytics: {
      track: (...args: unknown[]) => calls.push(["webm8.track", ...args]),
      form: (...args: unknown[]) => calls.push(["webm8.form", ...args]),
    },
  };
  withWindow(fake, () => {
    trackEvent("demo_form_started", { placement: "free-demo" });
    assert.deepEqual(calls, [
      ["webm8.track", "demo_form_started"],
      ["webm8.form", "demo_request", "start"],
      ["webm8.form", "demo_request", "step_view", { step: 1, steps: 1 }],
      ["gtag", "event", "demo_form_started", { placement: "free-demo" }],
      ["fbq", "trackCustom", "demo_form_started", { placement: "free-demo" }],
    ]);

    calls.length = 0;
    trackAcceptedDemoRequest("demo-request-1");
    trackAcceptedDemoRequest("demo-request-1");
    assert.deepEqual(calls.filter((args) => String(args[0]).startsWith("webm8.")), [
      ["webm8.track", "demo_request_accepted"],
      ["webm8.form", "demo_request", "success"],
    ]);
    const leads = calls.filter((args) => args[0] === "fbq" && args[1] === "track" && args[2] === "Lead");
    assert.equal(leads.length, 1);
    assert.deepEqual(leads[0][4], { eventID: "demo-request-1" });
  });
});

test("native events work without other providers, and missing providers are safe", () => {
  const tracked: unknown[][] = [];
  const fake = {
    WebM8Analytics: { track: (...args: unknown[]) => tracked.push(args) },
  };
  withWindow(fake, () => {
    trackEvent("demo_cta_clicked", { placement: "hero" });
    assert.deepEqual(tracked, [["demo_cta_clicked"]]);
  });
  withWindow({}, () => {
    assert.doesNotThrow(() => trackEvent("demo_cta_clicked", { placement: "hero" }));
  });
});

test("demo tracking separates starting, failure and a deduplicated saved conversion", () => {
  const forms: [string, string][] = [];
  const events: string[] = [];
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    WebM8Analytics: { track: (name: string) => events.push(name), form: (name: string, action: string) => forms.push([name, action]) },
  } });
  try {
    trackEvent("demo_form_started");
    trackEvent("demo_request_failed", { reason: "validation" });
    trackEvent("demo_request_failed", { reason: "network" });
    assert.equal(forms.some(([, action]) => action === "success"), false);
    trackAcceptedDemoRequest("saved-qa-receipt");
    trackAcceptedDemoRequest("saved-qa-receipt");
    assert.deepEqual(forms.map(([, action]) => action), ["start", "step_view", "validation_error", "submission_error", "success"]);
    assert.equal(events.filter((name) => name === "demo_request_accepted").length, 1);
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
