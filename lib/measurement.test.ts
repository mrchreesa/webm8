import assert from "node:assert/strict";
import { test } from "node:test";
import {
  readMeasurementChoice,
  measurementBlocked,
  MEASUREMENT_DAYS,
} from "./measurement.ts";
test("measurement needs a current, explicitly saved choice; malformed and expired choices stay off", () => {
  const now = Date.now();
  for (const raw of [
    null,
    "{}",
    "{",
    JSON.stringify({ allowed: "true", expires: now + 1000 }),
    JSON.stringify({ allowed: true, expires: now }),
    JSON.stringify({
      allowed: true,
      expires: now + (MEASUREMENT_DAYS + 1) * 86400_000,
    }),
  ])
    assert.equal(readMeasurementChoice(raw, now), null);
  assert.equal(
    readMeasurementChoice(
      JSON.stringify({ allowed: false, expires: now + 1000 }),
      now,
    )?.allowed,
    false,
  );
  assert.equal(
    readMeasurementChoice(
      JSON.stringify({ allowed: true, expires: now + 1000 }),
      now,
    )?.allowed,
    true,
  );
});
test("either browser privacy signal prevents measurement", () => {
  assert.equal(measurementBlocked({ doNotTrack: "1" }), true);
  assert.equal(measurementBlocked({ globalPrivacyControl: true }), true);
  assert.equal(
    measurementBlocked({ doNotTrack: "0", globalPrivacyControl: false }),
    false,
  );
});
