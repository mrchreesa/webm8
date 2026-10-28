/**
 * "The phone rings": where every beat sits, in frames. Three rounds of a
 * customer finding a business and asking for a quote, each faster than the
 * last, then enquiries from nine trades piling up, then the close.
 * Pure numbers, held in place by timeline.test.ts.
 */
import { FPS, TOTAL_FRAMES, length, type Span } from "../timeline.ts";

export { FPS, TOTAL_FRAMES, length, type Span };

/** A round's moments, all in absolute frames. */
export type Round = {
  span: Span;
  /** The search screen: the query types itself, then the results drop in and the top one is tapped. */
  search: Span;
  typing: Span;
  resultsFrom: number;
  tapResult: number;
  /** The business's real site: it scrolls, then its main button is tapped. */
  site: Span;
  scroll: Span;
  tapButton: number;
  /** The request sheet: it slides up, the answers fill in, then it is sent. */
  form: Span;
  sheetIn: Span;
  fill: Span;
  tapSend: number;
  /** The phone turns round to the owner's lock screen, on neon, and the enquiry lands. */
  enquiry: Span;
  flip: Span;
  lands: number;
  /** How hard the camera leans in (camera.ts), 0 to 1: the first, slower round hardest. */
  zoom: number;
};

type RoundPlan = {
  lengths: { search: number; site: number; form: number; enquiry: number };
  /** From the search screen's first frame. */
  typing: [number, number];
  results: number;
  tapResult: number;
  /** From the site's first frame. */
  scroll: [number, number];
  tapButton: number;
  /** From the request sheet's first frame. */
  sheetIn: number;
  fill: [number, number];
  tapSend: number;
  zoom: number;
};

const FLIP_FRAMES = 6;
const SHAKE_FRAMES = 3;

const plans: RoundPlan[] = [
  {
    lengths: { search: 70, site: 50, form: 40, enquiry: 50 },
    typing: [6, 36],
    results: 40,
    tapResult: 58,
    scroll: [6, 30],
    tapButton: 38,
    sheetIn: 8,
    fill: [10, 24],
    tapSend: 32,
    zoom: 1,
  },
  {
    lengths: { search: 36, site: 30, form: 24, enquiry: 30 },
    typing: [2, 18],
    results: 20,
    tapResult: 29,
    scroll: [3, 18],
    tapButton: 22,
    sheetIn: 5,
    fill: [6, 13],
    tapSend: 19,
    zoom: 0.6,
  },
  {
    lengths: { search: 26, site: 22, form: 17, enquiry: 25 },
    typing: [2, 14],
    results: 15,
    tapResult: 21,
    scroll: [2, 12],
    tapButton: 16,
    sheetIn: 4,
    fill: [4, 11],
    tapSend: 13,
    zoom: 0.45,
  },
];

function buildRounds(): Round[] {
  let from = 0;
  return plans.map((plan) => {
    const { search, site, form, enquiry } = plan.lengths;
    const s = from;
    const si = s + search;
    const f = si + site;
    const e = f + form;
    from = e + enquiry;
    return {
      span: { from: s, to: from },
      search: { from: s, to: si },
      typing: { from: s + plan.typing[0], to: s + plan.typing[1] },
      resultsFrom: s + plan.results,
      tapResult: s + plan.tapResult,
      site: { from: si, to: f },
      scroll: { from: si + plan.scroll[0], to: si + plan.scroll[1] },
      tapButton: si + plan.tapButton,
      form: { from: f, to: e },
      sheetIn: { from: f, to: f + plan.sheetIn },
      fill: { from: f + plan.fill[0], to: f + plan.fill[1] },
      tapSend: f + plan.tapSend,
      enquiry: { from: e, to: from },
      flip: { from: e, to: e + FLIP_FRAMES },
      lands: e + FLIP_FRAMES,
      zoom: plan.zoom,
    };
  });
}

export const rounds: Round[] = buildRounds();

/** The phone falls away and enquiries from nine trades pile up, one every 7 frames. */
export const STACK: Span = { from: 420, to: 495 };
export const STACK_CARDS = 9;
export function stackCardLands(card: number): number {
  return STACK.from + 4 + card * 7;
}

/** "Your phone could be next." and the free demo button. */
export const CLOSE: Span = { from: 495, to: TOTAL_FRAMES };
export const CLOSE_STILL_FROM = TOTAL_FRAMES - 45;
export const CLOSE_CUES = {
  headline: { from: 495, to: 513 },
  button: { from: 505, to: 521 },
  address: { from: 512, to: 524 },
  pulse: { from: 530, to: 540 },
} satisfies Record<string, Span>;

export function beats(): Span[] {
  return [...rounds.map((round) => round.span), STACK, CLOSE];
}

/** The big line beside the phone. Rounds two and three only name the trade, then say it again. */
export type CaptionKey = "need" | "find" | "tap" | "ask" | "lights" | "again" | "andAgain" | "stack";
export function captions(): { key: CaptionKey; round?: number; span: Span }[] {
  const [one, two, three] = rounds;
  return [
    { key: "need", round: 0, span: { from: one.search.from, to: one.resultsFrom } },
    { key: "find", round: 0, span: { from: one.resultsFrom, to: one.site.from } },
    { key: "tap", round: 0, span: one.site },
    { key: "ask", round: 0, span: one.form },
    { key: "lights", round: 0, span: one.enquiry },
    { key: "need", round: 1, span: { from: two.search.from, to: two.enquiry.from } },
    { key: "again", round: 1, span: two.enquiry },
    { key: "need", round: 2, span: { from: three.search.from, to: three.enquiry.from } },
    { key: "andAgain", round: 2, span: three.enquiry },
    { key: "stack", span: STACK },
  ];
}

/** The frame shakes as each round's enquiry lands, and buzzes as each card lands on the pile. */
export function shakeSpans(): Span[] {
  return [
    ...rounds.map((round) => ({ from: round.lands, to: round.lands + SHAKE_FRAMES })),
    ...Array.from({ length: STACK_CARDS }, (_, card) => ({ from: stackCardLands(card), to: stackCardLands(card) + 2 })),
  ];
}

const SHAKE_OFFSETS = [
  { x: -16, y: 9 },
  { x: 11, y: -7 },
  { x: -5, y: 3 },
];

export function shakeAt(frame: number): { x: number; y: number } {
  const span = shakeSpans().find((s) => frame >= s.from && frame < s.to);
  if (!span) return { x: 0, y: 0 };
  const offset = SHAKE_OFFSETS[frame - span.from];
  // The pile's buzzes are smaller than a landing.
  return length(span) === SHAKE_FRAMES ? offset : { x: offset.x / 3, y: offset.y / 3 };
}

/** How many letters of a query show at a frame. */
export function typedLength(frame: number, typing: Span, query: string): number {
  if (frame < typing.from) return 0;
  if (frame >= typing.to) return query.length;
  return Math.ceil(((frame - typing.from + 1) / length(typing)) * query.length);
}
