import assert from "node:assert/strict";
import { test } from "node:test";
import {
  RING_TURN,
  STORY_ANCHORS,
  followScroll,
  heroPhonePose,
  phoneScreenRect,
  ringDemos,
  storyFrame,
  storyLayout,
} from "./homeStory.ts";
import { projects } from "./site.ts";

const DEMOS = 7;
const laptop = storyLayout(1280, 720);

test("each progress point belongs to its chapter", () => {
  assert.equal(storyFrame(0, DEMOS).chapter, "search");
  assert.equal(storyFrame(0.3, DEMOS).chapter, "dive");
  assert.equal(storyFrame(0.5, DEMOS).chapter, "work");
  assert.equal(storyFrame(0.8, DEMOS).chapter, "steps");
  assert.equal(storyFrame(0.97, DEMOS).chapter, "finale");
});

test("the ring rests on each demo in turn", () => {
  for (let k = 0; k < DEMOS; k++) {
    const p = RING_TURN.from + ((k + 0.2) / (DEMOS - 1)) * (RING_TURN.to - RING_TURN.from);
    const frame = storyFrame(p, DEMOS);
    assert.equal(frame.ringFront, k, `demo ${k}`);
    assert.ok(Math.abs(frame.ringSpin - (-k * 2 * Math.PI) / DEMOS) < 1e-9, `demo ${k} is square on`);
  }
});

test("each demo gets at least a quarter of a screen's scroll", () => {
  // The track is 10 screens tall on a laptop, so the ring's share of its 9 screens of scroll, per demo.
  const perDemo = ((RING_TURN.to - RING_TURN.from) * 9) / (DEMOS - 1);
  assert.ok(perDemo >= 0.35, `only ${perDemo.toFixed(2)} of a screen per demo`);
});

test("the ring only ever turns one way", () => {
  let last = Infinity;
  for (let i = 0; i <= 200; i++) {
    const spin = storyFrame(RING_TURN.from - 0.02 + (i / 200) * (RING_TURN.to - RING_TURN.from + 0.04), DEMOS).ringSpin;
    assert.ok(spin <= last + 1e-12);
    last = spin;
  }
});

test("the anchors land on settled chapters", () => {
  const work = storyFrame(STORY_ANCHORS.work, DEMOS);
  assert.equal(work.chapter, "work");
  assert.equal(work.ringFront, 0);
  assert.equal(work.ringAppear, 1);
  assert.equal(work.ringLeave, 0);
  assert.equal(work.workOn, 1);
  const steps = storyFrame(STORY_ANCHORS.steps, DEMOS);
  assert.equal(steps.chapter, "steps");
  assert.deepEqual(steps.stepIn, [1, 1, 1, 1]);
  assert.equal(steps.stepOut, 0);
  assert.equal(steps.stepsTitle, 1);
});

test("the sharp copy of the screen takes over from the phone at the dive", () => {
  assert.equal(storyFrame(0.237, DEMOS).zoom, 0);
  assert.equal(storyFrame(0.3, DEMOS).zoom, 1);
  assert.equal(storyFrame(0.43, DEMOS).zoom, 0);
  assert.equal(storyFrame(0.24, DEMOS).grow, 0);
  assert.equal(storyFrame(0.34, DEMOS).grow, 1);
  assert.equal(heroPhonePose(0.2, laptop).visible, true);
  assert.equal(heroPhonePose(0.25, laptop).visible, false);
  assert.equal(heroPhonePose(0.85, laptop).visible, false);
  assert.equal(heroPhonePose(0.9, laptop).visible, true);
});

test("the phone is straight and centred at the handoff", () => {
  const pose = heroPhonePose(0.244, laptop);
  assert.deepEqual([pose.x, pose.y, pose.rx, pose.ry, pose.rz], [0, 0, 0, 0, 0]);
  assert.ok(Math.abs(pose.scale - 1.12) < 1e-9);
  const rect = phoneScreenRect(pose, laptop);
  assert.ok(Math.abs(rect.left + rect.width / 2 - laptop.W / 2) < 1e-9);
  assert.ok(Math.abs(rect.top + rect.height / 2 - laptop.H / 2) < 1e-9);
  assert.ok(rect.height > rect.width * 1.9 && rect.height < rect.width * 2.2);
});

test("the hero words leave and the finale is reached on cue", () => {
  assert.equal(storyFrame(0, DEMOS).copy, 1);
  assert.equal(storyFrame(0.2, DEMOS).copy, 0);
  assert.equal(storyFrame(0.939, DEMOS).finaleReached, false);
  assert.equal(storyFrame(0.94, DEMOS).finaleReached, true);
  const end = storyFrame(0.995, DEMOS);
  assert.deepEqual([end.finale, end.waves, ...end.notifications], [1, 1, 1, 1, 1]);
  assert.equal(end.ringing, true);
});

test("the story glides after the scroll instead of jumping with each wheel notch", () => {
  const step = followScroll(0.5, 0.51, 16);
  assert.ok(step > 0.5 && step < 0.51, "a small scroll is followed partway in one frame");
  let shown = 0.5;
  for (let i = 0; i < 60; i++) shown = followScroll(shown, 0.51, 16);
  assert.equal(shown, 0.51, "and caught up within a second");
  for (let i = 0; i < 30; i++) assert.ok(followScroll(0.5, 0.51, 16 * i) <= 0.51, "never overshoots");
});

test("a scroll after a pause still glides: the pause is not catch-up time", () => {
  // The page stops drawing when nothing moves, so the next frame can come seconds later.
  const next = followScroll(0.5, 0.51, 5000);
  assert.ok(next < 0.51, "the first frame after a pause moves only part of the way");
});

test("a jump, like a link to a chapter, lands at once", () => {
  assert.equal(followScroll(0, STORY_ANCHORS.work, 16), STORY_ANCHORS.work);
});

test("the ring shows seven real demos, labelled as the demo deck labels them", () => {
  const labels: Record<string, string> = {
    "stitch-house": "Tailor, London",
    "boniface-salon": "Hair salon, Kent",
    "allen-fitness": "Activewear",
    "waffles-bubbles": "Desserts, Orpington",
    "fcg-painting": "Painter, Margate",
    "aesthetic-nacre": "Aesthetic clinic",
    "dps-gasworks": "Heating, Bedford",
  };
  assert.deepEqual(ringDemos.map((demo) => demo.slug), Object.keys(labels));
  for (const { slug, label } of ringDemos) {
    const project = projects.find((item) => item.slug === slug);
    assert.ok(project?.siteUrl, `${slug} has a live site`);
    assert.equal(label, labels[slug]);
    assert.ok(label.length <= 22);
  }
});

test("a laptop gets the side-by-side layout and a phone the stacked one", () => {
  assert.equal(laptop.wide, true);
  assert.ok(laptop.anchorX > 0);
  const phone = storyLayout(390, 844);
  assert.equal(phone.wide, false);
  assert.equal(phone.anchorX, 0);
  assert.ok(phone.anchorY > 0);
});
