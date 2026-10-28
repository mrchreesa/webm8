import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CLOSE,
  CLOSE_CUES,
  CLOSE_STILL_FROM,
  STACK,
  STACK_CARDS,
  TOTAL_FRAMES,
  beats,
  captions,
  length,
  rounds,
  shakeAt,
  shakeSpans,
  stackCardLands,
  typedLength,
  type Span,
} from "./timeline.ts";

const inside = (frame: number, span: Span) => frame >= span.from && frame < span.to;

test("the rounds, the stack and the close run back to back and fill all 600 frames", () => {
  const spans = beats();
  assert.equal(spans[0].from, 0);
  for (let i = 1; i < spans.length; i++) assert.equal(spans[i].from, spans[i - 1].to);
  assert.equal(spans.at(-1)!.to, TOTAL_FRAMES);
  assert.equal(rounds.length, 3);
});

test("each round is faster than the one before", () => {
  for (let i = 1; i < rounds.length; i++) assert.ok(length(rounds[i].span) < length(rounds[i - 1].span));
});

test("a round's screens follow each other: search, site, request, enquiry", () => {
  for (const round of rounds) {
    assert.equal(round.search.from, round.span.from);
    assert.equal(round.site.from, round.search.to);
    assert.equal(round.form.from, round.site.to);
    assert.equal(round.enquiry.from, round.form.to);
    assert.equal(round.enquiry.to, round.span.to);
  }
});

test("every tap lands on its own screen, after what it taps has appeared, and is seen before the cut", () => {
  rounds.forEach((round, i) => {
    assert.ok(round.typing.to <= round.resultsFrom, `round ${i}: results before the query is typed`);
    assert.ok(round.tapResult > round.resultsFrom && round.tapResult <= round.search.to - 4, `round ${i}: result tap`);
    assert.ok(round.tapButton >= round.scroll.to && round.tapButton <= round.site.to - 4, `round ${i}: button tap`);
    assert.ok(round.fill.from >= round.sheetIn.from && round.tapSend >= round.fill.to, `round ${i}: send before the answers`);
    assert.ok(round.tapSend <= round.form.to - 4, `round ${i}: send tap`);
    assert.ok(inside(round.lands, round.enquiry), `round ${i}: enquiry lands outside its beat`);
  });
});

test("the camera leans in less each round, as the rounds speed up", () => {
  for (let i = 1; i < rounds.length; i++) assert.ok(rounds[i].zoom < rounds[i - 1].zoom);
  for (const round of rounds) assert.ok(round.zoom > 0 && round.zoom <= 1);
});

test("the captions follow each other with no gaps, each up for at least 0.8 seconds", () => {
  const list = captions();
  assert.equal(list[0].span.from, 0);
  for (let i = 1; i < list.length; i++) assert.equal(list[i].span.from, list[i - 1].span.to);
  assert.equal(list.at(-1)!.span.to, CLOSE.from);
  for (const caption of list) assert.ok(length(caption.span) >= 24, `${caption.key} is up for ${length(caption.span)} frames`);
});

test("the frame only shakes as an enquiry lands or stacks up", () => {
  for (const span of shakeSpans()) {
    const allowed = [...rounds.map((round) => round.enquiry), STACK];
    assert.ok(
      allowed.some((beat) => span.from >= beat.from && span.to <= beat.to),
      `${JSON.stringify(span)} shakes outside an enquiry`,
    );
  }
  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const moving = shakeSpans().some((span) => inside(frame, span));
    const { x, y } = shakeAt(frame);
    assert.equal(x !== 0 || y !== 0, moving, `frame ${frame}`);
  }
});

test("every card on the pile has landed, and settled, before the close", () => {
  assert.ok(stackCardLands(0) > STACK.from);
  assert.ok(stackCardLands(STACK_CARDS - 1) + 8 <= STACK.to);
});

test("the close is still for its last 1.5 seconds", () => {
  assert.equal(CLOSE_STILL_FROM, TOTAL_FRAMES - 45);
  for (const [name, cue] of Object.entries(CLOSE_CUES)) {
    assert.ok(cue.from >= CLOSE.from, `${name} starts before the close`);
    assert.ok(cue.to <= CLOSE_STILL_FROM, `${name} still moves at frame ${cue.to - 1}`);
  }
});

test("a query types itself out across its span, and is whole afterwards", () => {
  const typing = { from: 10, to: 20 };
  const query = "plumber near me";
  assert.equal(typedLength(9, typing, query), 0);
  assert.ok(typedLength(10, typing, query) > 0);
  assert.equal(typedLength(19, typing, query), query.length);
  assert.equal(typedLength(40, typing, query), query.length);
  for (let frame = 10; frame < 20; frame++) {
    assert.ok(typedLength(frame + 1, typing, query) >= typedLength(frame, typing, query));
  }
});
