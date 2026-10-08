/**
 * Where the A/B post's beats sit, in frames at 30 fps: the hook, design A,
 * design B, both side by side with the question, then the end card. Pure
 * numbers, held in place by timeline.test.ts.
 */
import { END_CARD_MOVES } from "../../kit/endCards.ts";
import { length, type Span } from "../../timeline.ts";

export { length, type Span };

export const AB_FRAMES = 480;

export const HOOK: Span = { from: 0, to: 60 };
/** The hook's two lines and the question land at these frames. */
export const HOOK_CUES = { first: 0, second: 16, question: 34 } as const;
export const SIDE_A: Span = { from: 60, to: 195 };
export const SIDE_B: Span = { from: 195, to: 330 };
export const VERSUS: Span = { from: 330, to: 420 };
export const END: Span = { from: 420, to: AB_FRAMES };
export const END_STILL_FROM = END.from + END_CARD_MOVES;

/** Within a side: the phone lands, the letter and the look follow, then the page scrolls. */
export function sideCues(side: Span) {
  return {
    phone: side.from,
    letter: side.from + 2,
    look: side.from + 8,
    scroll: { from: side.from + 24, to: side.to - 16 },
  };
}

/** In the versus beat: the phones fly in, then the question, then the prompt to comment. */
export const VERSUS_CUES = { phones: VERSUS.from, headline: VERSUS.from + 8, sub: VERSUS.from + 18 } as const;

export function beats(): Span[] {
  return [HOOK, SIDE_A, SIDE_B, VERSUS, END];
}
