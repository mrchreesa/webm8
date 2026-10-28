import assert from "node:assert/strict";
import { test } from "node:test";
import { cameraAt, cameraKeys, onScreen, viewOf, type Points } from "./camera.ts";
import { rounds } from "./timeline.ts";

// The screen in both formats is 390 CSS px wide and about 833 tall.
const W = 390;
const H = 833;
const points: Points = {
  searchBar: { x: 140, y: 74 },
  topResult: { x: 150, y: 360 },
  websiteChip: { x: 66, y: 395 },
  siteButton: { x: 219, y: 46 + 517 - 200 },
  sheet: { x: 195, y: H - 250 },
  sendButton: { x: 195, y: H - 56 },
};

test("every round's camera keys run forward in time", () => {
  for (const round of rounds) {
    const keys = cameraKeys(round, points, H);
    for (let i = 1; i < keys.length; i++) assert.ok(keys[i].at > keys[i - 1].at);
  }
});

test("the camera never pulls back past the whole screen", () => {
  for (const round of rounds) {
    const keys = cameraKeys(round, points, H);
    for (let frame = round.search.from; frame < round.enquiry.from; frame++) {
      assert.ok(cameraAt(frame, keys).zoom >= 1, `frame ${frame}`);
    }
  }
});

test("the first round leans in hardest", () => {
  const deepest = rounds.map((round) => Math.max(...cameraKeys(round, points, H).map((key) => key.focus.zoom)));
  for (let i = 1; i < deepest.length; i++) assert.ok(deepest[i] < deepest[i - 1], `round ${i} zooms ${deepest[i]}`);
  assert.ok(deepest[0] >= 2);
});

test("every tap happens in view, with room around it", () => {
  for (const round of rounds) {
    const keys = cameraKeys(round, points, H);
    for (const [at, point] of [
      [round.tapResult, points.websiteChip],
      [round.tapButton, points.siteButton],
      [round.tapSend, points.sendButton],
    ] as const) {
      const spot = onScreen(point, viewOf(cameraAt(at, keys), W, H));
      assert.ok(spot.x > 30 && spot.x < W - 30 && spot.y > 30 && spot.y < H - 30, `tap at frame ${at} is at ${JSON.stringify(spot)}`);
    }
  }
});

test("the view never shows past the content's edges", () => {
  for (const focus of [
    { x: 0, y: 0, zoom: 2.3 },
    { x: W, y: H, zoom: 2.3 },
    { x: 195, y: 400, zoom: 1 },
  ]) {
    const view = viewOf(focus, W, H);
    assert.ok(view.x <= 0 && view.y <= 0);
    assert.ok(view.x + W * view.zoom >= W - 1e-9 && view.y + H * view.zoom >= H - 1e-9);
  }
});

test("the request sheet is held nearly whole while it fills, so its labels stay in view", () => {
  for (const round of rounds) {
    const keys = cameraKeys(round, points, H);
    for (let frame = round.fill.from; frame < round.fill.to; frame++) {
      const label = onScreen({ x: 22, y: H - 300 }, viewOf(cameraAt(frame, keys), W, H));
      assert.ok(label.x >= 0, `frame ${frame}: the labels are cut off`);
    }
  }
});

test("the top result's name is never cut off while the camera looks at it", () => {
  for (const round of rounds) {
    const keys = cameraKeys(round, points, H);
    for (let frame = round.resultsFrom; frame < round.search.to; frame++) {
      const name = onScreen({ x: 18, y: 330 }, viewOf(cameraAt(frame, keys), W, H));
      assert.ok(name.x >= 0, `frame ${frame}: the name starts at ${name.x}`);
    }
  }
});
