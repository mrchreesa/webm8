import assert from "node:assert/strict";
import { test } from "node:test";
import { measurementBlocked } from "./measurement.ts";

test("either browser privacy signal prevents measurement", () => {
  assert.equal(measurementBlocked({ doNotTrack: "1" }), true);
  assert.equal(measurementBlocked({ globalPrivacyControl: true }), true);
  assert.equal(
    measurementBlocked({ doNotTrack: "0", globalPrivacyControl: false }),
    false,
  );
});
