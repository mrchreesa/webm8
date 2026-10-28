import assert from "node:assert/strict";
import { test } from "node:test";
import { cameraDistance, cardOffset, nearestTurn, springStep, wrapIndex } from "./demoDeck.ts";

test("indexes wrap in both directions", () => {
  assert.equal(wrapIndex(0, 6), 0);
  assert.equal(wrapIndex(6, 6), 0);
  assert.equal(wrapIndex(-1, 6), 5);
  assert.equal(wrapIndex(-7, 6), 5);
  assert.equal(wrapIndex(3, 0), 0);
});

test("a single card is always at the front", () => {
  assert.equal(cardOffset(0, 0, 1), 0);
  assert.equal(cardOffset(0, 4, 1), 0);
});

test("offsets take the short way round the deck", () => {
  // An odd deck has as many cards behind on each side.
  assert.deepEqual(
    Array.from({ length: 7 }, (_, card) => cardOffset(card, 0, 7)),
    [0, 1, 2, 3, -3, -2, -1],
  );
  assert.deepEqual(
    Array.from({ length: 7 }, (_, card) => cardOffset(card, 5, 7)),
    [2, 3, -3, -2, -1, 0, 1],
  );
});

test("an even deck puts the far card behind on the right", () => {
  assert.deepEqual(
    Array.from({ length: 6 }, (_, card) => cardOffset(card, 0, 6)),
    [0, 1, 2, 3, -2, -1],
  );
});

test("a deck caught between cards gives fractional offsets, still the short way round", () => {
  assert.equal(cardOffset(1, 0.25, 12), 0.75);
  assert.equal(cardOffset(11, 0.25, 12), -1.25);
  assert.equal(cardOffset(0, 11.5, 12), 0.5);
});

test("the active position can run on past either end of the deck", () => {
  assert.equal(cardOffset(0, -0.5, 12), 0.5);
  assert.equal(cardOffset(3, 25, 12), 2);
  assert.equal(cardOffset(10, -13, 12), -1);
});

test("a spring with no time passed stays put", () => {
  assert.deepEqual(springStep(0.7, -2, 14, 0), [0.7, -2]);
});

test("a spring let go from rest comes home without passing it", () => {
  let [offset, velocity] = [1, 0];
  let previous = offset;
  for (let frame = 0; frame < 60; frame++) {
    [offset, velocity] = springStep(offset, velocity, 14, 1 / 60);
    assert.ok(offset > 0 && offset < previous, `frame ${frame}: ${offset}`);
    previous = offset;
  }
  assert.ok(offset < 1e-4, `${offset}`);
});

test("a spring moves the same however the time is sliced into frames", () => {
  let state: [number, number] = [-2, 3];
  for (let frame = 0; frame < 120; frame++) state = springStep(state[0], state[1], 14, 1 / 120);
  const once = springStep(-2, 3, 14, 1);
  assert.ok(Math.abs(state[0] - once[0]) < 1e-12 && Math.abs(state[1] - once[1]) < 1e-12);
});

test("a spring carries a flick on before it turns for home", () => {
  const [offset] = springStep(0, 5, 14, 0.05);
  assert.ok(offset > 0, `${offset}`);
});

test("the 3D ring turns the short way round to the next demo", () => {
  assert.equal(nearestTurn(0, 10, 11), -1);
  assert.equal(nearestTurn(10.6, 0, 11), 11);
  assert.equal(nearestTurn(3.2, 3, 11), 3);
  assert.equal(nearestTurn(-12.4, 9, 11), -13);
});

test("the camera stands far enough back for the front demo to fit both ways", () => {
  const fov = 30;
  const half = Math.tan((fov / 2) * (Math.PI / 180));
  for (const aspect of [0.6, 1, 1.6]) {
    const d = cameraDistance(fov, aspect, 3.8, 2.3);
    assert.ok(2 * d * half * aspect >= 3.8 - 1e-9, `width fits at aspect ${aspect}`);
    assert.ok(2 * d * half >= 2.3 - 1e-9, `height fits at aspect ${aspect}`);
    assert.ok(Math.abs(2 * d * half * aspect - 3.8) < 1e-9 || Math.abs(2 * d * half - 2.3) < 1e-9, "and no further back than it needs");
  }
});
