import assert from "node:assert/strict";
import { test } from "node:test";
import { STACK_CARDS, rounds } from "./timeline.ts";
import { pile, roundStories, roundTrades } from "./story.ts";

test("there is one trade per round, each a different one", () => {
  assert.equal(roundTrades.length, rounds.length);
  assert.equal(new Set(roundTrades).size, roundTrades.length);
});

test("every round plays a real WebM8 site, with its phone capture and main button", () => {
  for (const story of roundStories()) {
    assert.ok(story.shot.src.endsWith(`${story.project}-phone.webp`), story.shot.src);
    assert.ok(story.shot.button.x > 0 && story.shot.button.x < 390, `${story.project}'s button is off the page`);
    assert.ok(story.shot.button.y - story.shot.scroll > 0, `${story.project}'s button scrolls out of view`);
    assert.equal(story.trade.form.fields.length, 4);
    assert.ok(story.trade.query.length > 0 && story.suggestions[0] === story.trade.query);
  }
});

test("the pile has a card for every landing, each from a different trade, starting with the rounds", () => {
  const cards = pile();
  assert.equal(cards.length, STACK_CARDS);
  assert.equal(new Set(cards.map((card) => card.key)).size, cards.length);
  assert.deepEqual(
    cards.slice(0, roundTrades.length).map((card) => card.key),
    [...roundTrades],
  );
  for (const card of cards) assert.ok(card.business && card.title && card.body, `${card.key} has an empty enquiry`);
});
