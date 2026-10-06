import assert from "node:assert/strict";
import { test } from "node:test";
import { cardOffset, wrapIndex } from "./demoDeck.ts";

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
  // Seven cards: the sketch at 0, then six real demos.
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
