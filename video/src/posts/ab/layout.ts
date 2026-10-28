import { PHONE_RATIO } from "../../layout.ts";
import { SAFE, type Rect } from "../../kit/safeZone.ts";

/**
 * Where the A/B post puts things on the 9:16 frame. Words stay inside the
 * safe zone (layout.test.ts); the phones may run into the bottom edge, where
 * Instagram draws its caption.
 */
const phone = (x: number, y: number, width: number) => ({ x, y, width, height: Math.round(width * PHONE_RATIO) });
const width = SAFE.right - SAFE.left;

export const abLayout = {
  hook: {
    lines: { x: SAFE.left, y: SAFE.top + 170, width, height: 280 },
    question: { x: SAFE.left, y: SAFE.top + 480, width, height: 90 },
    lineSize: 124,
    questionSize: 60,
    /** Both phones peek up from below while the hook plays. */
    phones: [phone(110, 900, 400), phone(570, 900, 400)],
  },
  side: {
    letter: { x: SAFE.left, y: SAFE.top + 70, width: 150, height: 150 },
    look: { x: SAFE.left + 180, y: SAFE.top + 70, width: width - 180, height: 150 },
    lookSize: 64,
    phone: phone(250, 520, 580),
  },
  versus: {
    headline: { x: SAFE.left, y: SAFE.top + 60, width, height: 170 },
    sub: { x: SAFE.left, y: SAFE.top + 240, width, height: 60 },
    headlineSize: 170,
    subSize: 44,
    phones: [phone(95, 640, 420), phone(565, 640, 420)],
    letters: [
      { x: SAFE.left, y: 600, width: 110, height: 110 },
      { x: SAFE.right - 110, y: 600, width: 110, height: 110 },
    ],
  },
};

/** Every box that holds words, for the safe-zone test. */
export function textBoxes(): Record<string, Rect> {
  const { hook, side, versus } = abLayout;
  return {
    "hook lines": hook.lines,
    "hook question": hook.question,
    "side letter": side.letter,
    "side look": side.look,
    "versus headline": versus.headline,
    "versus sub": versus.sub,
    "versus letter A": versus.letters[0],
    "versus letter B": versus.letters[1],
  };
}
