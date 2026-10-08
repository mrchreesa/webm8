import assert from "node:assert/strict";
import { test } from "node:test";
import { AB_FRAMES, END, END_STILL_FROM, HOOK, HOOK_CUES, SIDE_A, SIDE_B, VERSUS, VERSUS_CUES, beats, length, sideCues } from "./timeline.ts";

test("the post is 16 seconds, its beats back to back", () => {
  assert.equal(AB_FRAMES, 16 * 30);
  const spans = beats();
  assert.equal(spans[0].from, 0);
  for (let i = 1; i < spans.length; i++) assert.equal(spans[i].from, spans[i - 1].to);
  assert.equal(spans.at(-1)!.to, AB_FRAMES);
});

test("the hook asks its question inside the first 1.5 seconds", () => {
  assert.ok(HOOK_CUES.second > HOOK_CUES.first && HOOK_CUES.question > HOOK_CUES.second);
  assert.ok(HOOK_CUES.question < 45 && HOOK_CUES.question < HOOK.to);
});

test("each design gets the same time, at least 4 seconds, and scrolls before it is cut away", () => {
  assert.equal(length(SIDE_A), length(SIDE_B));
  assert.ok(length(SIDE_A) >= 120);
  for (const side of [SIDE_A, SIDE_B]) {
    const cues = sideCues(side);
    assert.ok(cues.scroll.from > cues.look && cues.scroll.to < side.to);
  }
});

test("the question stays up for at least 2.5 seconds before the end card", () => {
  assert.ok(VERSUS.to - VERSUS_CUES.headline >= 75);
  assert.ok(VERSUS_CUES.sub < VERSUS.to);
});

test("the end card holds still for its last second", () => {
  assert.ok(AB_FRAMES - END_STILL_FROM >= 30);
  assert.ok(END_STILL_FROM > END.from);
});
