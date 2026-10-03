import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chapterAt,
  chapterProgress,
  chapterScrollTarget,
  clamp01,
  easeInOutCubic,
  fieldFill,
  storyProgress,
  typedText,
} from "./storyProgress.ts";

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

test("clamp01 keeps values in range and treats NaN as zero", () => {
  assert.equal(clamp01(-2), 0);
  assert.equal(clamp01(0.4), 0.4);
  assert.equal(clamp01(7), 1);
  assert.equal(clamp01(Number.NaN), 0);
  assert.equal(clamp01(Number.POSITIVE_INFINITY), 0);
});

test("progress follows the section through the viewport", () => {
  assert.equal(storyProgress(0, 4800, 1000), 0);
  assert.equal(storyProgress(-1900, 4800, 1000), 0.5);
  assert.equal(storyProgress(-3800, 4800, 1000), 1);
  assert.equal(storyProgress(-99999, 4800, 1000), 1);
  assert.equal(storyProgress(500, 4800, 1000), 0);
});

test("a section no taller than the viewport never divides by zero", () => {
  assert.equal(storyProgress(100, 900, 900), 0);
  assert.equal(storyProgress(0, 900, 900), 0);
  assert.equal(storyProgress(-10, 800, 900), 1);
  assert.ok(Number.isFinite(storyProgress(-10, 0, 0)));
});

test("chapters change at the agreed bounds", () => {
  const cases: [number, number][] = [[0, 0], [0.0999, 0], [0.1, 1], [0.3199, 1], [0.32, 2], [0.54, 3], [0.76, 4], [1, 4], [1.5, 4], [-1, 0], [Number.NaN, 0]];
  for (const [p, chapter] of cases) assert.equal(chapterAt(p), chapter, `p=${p}`);
});

test("chapter progress runs from 0 to 1 inside its own chapter", () => {
  assert.equal(chapterProgress(0.05, 1), 0);
  close(chapterProgress(0.21, 1), 0.5);
  assert.equal(chapterProgress(0.5, 1), 1);
  assert.equal(chapterProgress(1, 4), 1);
  assert.equal(chapterProgress(Number.NaN, 2), 0);
});

test("typed text grows with the amount and never overruns", () => {
  assert.equal(typedText("plumber near me", 0), "");
  assert.equal(typedText("plumber near me", 0.5), "plumber ");
  assert.equal(typedText("plumber near me", 2), "plumber near me");
  assert.equal(typedText("plumber near me", -1), "");
});

test("form fields fill one after another", () => {
  assert.equal(fieldFill(0.06, 0), 0);
  assert.equal(fieldFill(0.2, 0), 1);
  assert.equal(fieldFill(0.2, 1), 0);
  close(fieldFill(0.29, 1), 0.5);
  assert.equal(fieldFill(1, 3), 1);
});

test("easing starts at 0, ends at 1 and is symmetric", () => {
  assert.equal(easeInOutCubic(0), 0);
  assert.equal(easeInOutCubic(1), 1);
  assert.equal(easeInOutCubic(0.5), 0.5);
  assert.equal(easeInOutCubic(-3), 0);
  assert.equal(easeInOutCubic(3), 1);
});

test("rail buttons scroll to a point well into their chapter", () => {
  assert.equal(chapterScrollTarget(800, 4800, 1000, 1), 1640);
  assert.equal(chapterScrollTarget(800, 900, 1000, 3), 800);
});
