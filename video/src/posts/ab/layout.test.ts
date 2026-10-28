import assert from "node:assert/strict";
import { test } from "node:test";
import { REEL, insideSafe } from "../../kit/safeZone.ts";
import { abLayout, textBoxes } from "./layout.ts";

test("every word in the post sits inside Meta's safe zone", () => {
  for (const [name, rect] of Object.entries(textBoxes())) assert.ok(insideSafe(rect), `${name} is outside the safe zone`);
});

test("the phones stay on the frame from side to side", () => {
  const { side, versus, hook } = abLayout;
  for (const phone of [side.phone, ...versus.phones, ...hook.phones]) {
    assert.ok(phone.x >= 0 && phone.x + phone.width <= REEL.width, JSON.stringify(phone));
  }
});

test("in the versus beat the two phones don't overlap", () => {
  const [a, b] = abLayout.versus.phones;
  assert.ok(a.x + a.width <= b.x);
});
