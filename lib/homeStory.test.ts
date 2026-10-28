import assert from "node:assert/strict";
import { test } from "node:test";
import {
  RING_TURN,
  STORY_ANCHORS,
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
  assert.equal(storyFrame(0.75, DEMOS).chapter, "steps");
  assert.equal(storyFrame(0.95, DEMOS).chapter, "finale");
});

test("the ring rests on each demo in turn", () => {
  for (let k = 0; k < DEMOS; k++) {
    const p = RING_TURN.from + ((k + 0.2) / (DEMOS - 1)) * (RING_TURN.to - RING_TURN.from);
    const frame = storyFrame(p, DEMOS);
    assert.equal(frame.ringFront, k, `demo ${k}`);
    assert.ok(Math.abs(frame.ringSpin - (-k * 2 * Math.PI) / DEMOS) < 1e-9, `demo ${k} is square on`);
  }
});

test("the ring only ever turns one way", () => {
  let last = Infinity;
  for (let i = 0; i <= 200; i++) {
    const spin = storyFrame(0.44 + (i / 200) * 0.2, DEMOS).ringSpin;
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
  const steps = storyFrame(STORY_ANCHORS.steps, DEMOS);
  assert.equal(steps.chapter, "steps");
  assert.deepEqual(steps.stepIn, [1, 1, 1, 1]);
  assert.equal(steps.stepOut, 0);
});

test("the sharp copy of the screen takes over from the phone at the dive", () => {
  assert.equal(storyFrame(0.237, DEMOS).zoom, 0);
  assert.equal(storyFrame(0.3, DEMOS).zoom, 1);
  assert.equal(storyFrame(0.43, DEMOS).zoom, 0);
  assert.equal(storyFrame(0.24, DEMOS).grow, 0);
  assert.equal(storyFrame(0.34, DEMOS).grow, 1);
  assert.equal(heroPhonePose(0.2, laptop).visible, true);
  assert.equal(heroPhonePose(0.25, laptop).visible, false);
  assert.equal(heroPhonePose(0.85, laptop).visible, true);
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
  assert.equal(storyFrame(0.899, DEMOS).finaleReached, false);
  assert.equal(storyFrame(0.9, DEMOS).finaleReached, true);
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
