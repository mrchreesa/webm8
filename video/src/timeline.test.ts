import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DECK,
  END,
  END_CUES,
  END_STILL_FROM,
  FPS,
  HOOK,
  SITE_COUNT,
  SITES,
  TOTAL_FRAMES,
  beats,
  easeInOut,
  flashSpans,
  hookLineSpan,
  length,
  nameVisibleSpan,
  overlaps,
  shakeAt,
  shakeSpans,
  siteSlot,
  siteSpan,
  whipAt,
  whipDirection,
  whipSpans,
} from "./timeline.ts";

test("the reel is 20 seconds at 30 fps", () => {
  assert.equal(FPS, 30);
  assert.equal(TOTAL_FRAMES, 20 * FPS);
});

test("the beats run back to back and fill all 600 frames", () => {
  const spans = beats();
  assert.deepEqual(
    spans.map((span) => span.from),
    [0, 60, 450, 510],
  );
  assert.equal(spans[0].from, 0);
  for (let i = 1; i < spans.length; i++) assert.equal(spans[i].from, spans[i - 1].to);
  assert.equal(spans.at(-1)!.to, TOTAL_FRAMES);
  assert.deepEqual(spans, [HOOK, SITES, DECK, END]);
});

test("the six site slots split the sites beat evenly", () => {
  assert.equal(SITE_COUNT, 6);
  assert.equal(siteSlot(0).from, SITES.from);
  assert.equal(siteSlot(SITE_COUNT - 1).to, SITES.to);
  for (let i = 0; i < SITE_COUNT; i++) assert.equal(length(siteSlot(i)), 65);
});

test("the hook is three 20-frame lines", () => {
  assert.deepEqual([0, 1, 2].map(hookLineSpan), [
    { from: 0, to: 20 },
    { from: 20, to: 40 },
    { from: 40, to: 60 },
  ]);
});

test("the first site cuts in hard and the last cuts out hard", () => {
  assert.equal(siteSpan(0).from, SITES.from);
  assert.equal(siteSpan(SITE_COUNT - 1).to, SITES.to);
});

test("a 6-frame whip sits on each boundary between sites, alternating direction", () => {
  const whips = whipSpans();
  assert.equal(whips.length, SITE_COUNT - 1);
  whips.forEach((whip, i) => {
    assert.equal(length(whip), 6);
    const boundary = siteSlot(i).to;
    assert.equal(whip.from, boundary - 3);
    assert.equal(whip.to, boundary + 3);
    // Both neighbours are rendered for the whole whip.
    assert.ok(siteSpan(i).to >= whip.to);
    assert.ok(siteSpan(i + 1).from <= whip.from);
  });
  assert.deepEqual([0, 1, 2, 3, 4].map(whipDirection), [1, -1, 1, -1, 1]);
});

test("every business name is fully on screen for at least 1.5 seconds", () => {
  for (let i = 0; i < SITE_COUNT; i++) {
    const visible = nameVisibleSpan(i);
    assert.ok(length(visible) >= 45, `site ${i} shows its name for ${length(visible)} frames`);
    for (const whip of whipSpans()) assert.ok(!overlaps(visible, whip), `site ${i}'s name is visible during a whip`);
  }
});

test("shakes and full-frame flashes never land on a site scene", () => {
  for (const span of [...shakeSpans(), ...flashSpans()]) {
    for (let i = 0; i < SITE_COUNT; i++) {
      assert.ok(!overlaps(span, siteSpan(i)), `${JSON.stringify(span)} overlaps site ${i}`);
    }
  }
});

test("the end card is still for its last 1.5 seconds", () => {
  assert.equal(END_STILL_FROM, TOTAL_FRAMES - 45);
  for (const [name, cue] of Object.entries(END_CUES)) {
    assert.ok(cue.from >= END.from, `${name} starts before the end card`);
    assert.ok(cue.to <= END_STILL_FROM, `${name} still moves at frame ${cue.to - 1}`);
  }
});

test("overlaps treats spans as half open", () => {
  assert.equal(overlaps({ from: 0, to: 10 }, { from: 10, to: 20 }), false);
  assert.equal(overlaps({ from: 0, to: 11 }, { from: 10, to: 20 }), true);
});

test("during a whip the two sites travel as one pan, a frame width apart", () => {
  whipSpans().forEach((whip, i) => {
    const dir = whipDirection(i);
    for (let frame = whip.from; frame < whip.to; frame++) {
      const out = whipAt(frame, i);
      const into = whipAt(frame, i + 1);
      assert.ok(Math.abs(into.x - out.x - dir) < 1e-9, `frame ${frame}: ${out.x} and ${into.x}`);
      assert.ok(out.blur > 0 && into.blur > 0);
    }
  });
});

test("outside a whip a site is centred and sharp", () => {
  for (let i = 0; i < SITE_COUNT; i++) {
    const visible = nameVisibleSpan(i);
    for (let frame = visible.from; frame < visible.to; frame++) {
      assert.deepEqual(whipAt(frame, i), { x: 0, blur: 0 });
    }
  }
});

test("the camera only shakes inside the shake spans", () => {
  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const moving = shakeSpans().some((span) => frame >= span.from && frame < span.to);
    const { x, y } = shakeAt(frame);
    assert.equal(x !== 0 || y !== 0, moving, `frame ${frame}`);
  }
});

test("easeInOut runs from 0 to 1 and is symmetric", () => {
  assert.equal(easeInOut(0), 0);
  assert.equal(easeInOut(1), 1);
  assert.equal(easeInOut(0.5), 0.5);
  assert.ok(Math.abs(easeInOut(0.2) + easeInOut(0.8) - 1) < 1e-9);
});
