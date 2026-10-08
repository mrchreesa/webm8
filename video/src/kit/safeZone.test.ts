import assert from "node:assert/strict";
import { test } from "node:test";
import { BRAND_BUG, END_CARD, REEL, SAFE, insideSafe } from "./safeZone.ts";

test("the safe zone is Meta's: 14% off the top, 35% off the bottom, 6% off each side", () => {
  assert.deepEqual(REEL, { width: 1080, height: 1920, fps: 30 });
  assert.deepEqual(SAFE, { left: 65, right: 1015, top: 269, bottom: 1248 });
});

test("insideSafe accepts a rect on the boundary and refuses one a pixel over", () => {
  assert.equal(insideSafe({ x: 65, y: 269, width: 950, height: 979 }), true);
  assert.equal(insideSafe({ x: 64, y: 269, width: 10, height: 10 }), false);
  assert.equal(insideSafe({ x: 65, y: 1240, width: 10, height: 9 }), false);
});

test("the brand mark and the end card's words sit inside the safe zone", () => {
  assert.ok(insideSafe(BRAND_BUG));
  for (const [name, rect] of Object.entries(END_CARD)) assert.ok(insideSafe(rect), `${name} is outside the safe zone`);
});
