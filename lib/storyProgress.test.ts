import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CHAPTER_MS,
  STORY_HOLD_MS,
  STORY_PLAY_MS,
  STORY_TURN_MS,
  chapterAt,
  chapterProgress,
  chapterTime,
  clamp01,
  easeInOutCubic,
  fieldFill,
  playProgress,
  typedText,
  type StoryStep,
} from "./storyProgress.ts";

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

test("clamp01 keeps values in range and treats NaN as zero", () => {
  assert.equal(clamp01(-2), 0);
  assert.equal(clamp01(0.4), 0.4);
  assert.equal(clamp01(7), 1);
  assert.equal(clamp01(Number.NaN), 0);
  assert.equal(clamp01(Number.POSITIVE_INFINITY), 0);
});

test("a turn is the story plus the hold", () => {
  assert.equal(STORY_PLAY_MS, CHAPTER_MS.reduce((total, ms) => total + ms, 0));
  assert.equal(STORY_TURN_MS, STORY_PLAY_MS + STORY_HOLD_MS);
});

test("progress runs through each chapter in that chapter's own time", () => {
  assert.equal(playProgress(0), 0);
  close(playProgress(CHAPTER_MS[0]), 0.1);
  close(playProgress(CHAPTER_MS[0] + CHAPTER_MS[1] / 2), 0.21);
  close(playProgress(STORY_PLAY_MS - CHAPTER_MS[4] / 2), 0.88);
  assert.equal(playProgress(STORY_PLAY_MS), 1);
  assert.equal(playProgress(STORY_TURN_MS), 1);
});

test("progress treats bad times as the start", () => {
  assert.equal(playProgress(-500), 0);
  assert.equal(playProgress(Number.NaN), 0);
  assert.equal(playProgress(Number.POSITIVE_INFINITY), 0);
});

test("a chapter's time lands back in that chapter", () => {
  assert.equal(chapterTime(0), 0);
  assert.equal(chapterTime(1), CHAPTER_MS[0]);
  assert.equal(chapterTime(2, 0.5), CHAPTER_MS[0] + CHAPTER_MS[1] + CHAPTER_MS[2] / 2);
  for (const step of [1, 2, 3, 4] as StoryStep[]) {
    const p = playProgress(chapterTime(step, 0.72));
    assert.equal(chapterAt(p), step);
    close(chapterProgress(p, step), 0.72);
  }
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
