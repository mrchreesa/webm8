/**
 * Where things sit in each format, in px. Timing, motion and copy are shared;
 * only these numbers differ between 4:5 and 1:1. Text keeps `margin` from
 * every edge.
 */

type Rect = { x: number; y: number; width: number; height: number };

export type Layout = {
  width: number;
  height: number;
  margin: number;
  headerSize: number;
  hookSize: number;
  /** The browser window, title bar included. */
  browser: Rect;
  /** The phone's body. */
  phone: Rect;
  /** The name and industry, held to the bottom margin. */
  caption: { x: number; bottom: number; maxWidth: number; nameSize: number; tagSize: number; inline: boolean };
  giantSize: number;
  /** Where the giant name's two rows are centred. */
  giantY: number;
  deck: { phoneWidth: number; centreY: number; spread: number; textY: number; textSize: number };
  end: { mascotSize: number; headlineSize: number; buttonSize: number; addressSize: number };
};

/** Phones are drawn at this height for their width (an iPhone's body). */
export const PHONE_RATIO = 2.06;

export const portrait: Layout = {
  width: 1080,
  height: 1350,
  margin: 64,
  headerSize: 28,
  hookSize: 200,
  browser: { x: 64, y: 140, width: 880, height: 640 },
  phone: { x: 700, y: 590, width: 320, height: Math.round(320 * PHONE_RATIO) },
  caption: { x: 64, bottom: 72, maxWidth: 600, nameSize: 96, tagSize: 22, inline: false },
  giantSize: 330,
  giantY: 960,
  deck: { phoneWidth: 230, centreY: 800, spread: 122, textY: 230, textSize: 96 },
  end: { mascotSize: 340, headlineSize: 190, buttonSize: 44, addressSize: 32 },
};

export const square: Layout = {
  width: 1080,
  height: 1080,
  margin: 64,
  headerSize: 26,
  hookSize: 170,
  browser: { x: 56, y: 140, width: 800, height: 540 },
  phone: { x: 776, y: 220, width: 256, height: Math.round(256 * PHONE_RATIO) },
  caption: { x: 64, bottom: 84, maxWidth: 952, nameSize: 76, tagSize: 20, inline: true },
  giantSize: 280,
  giantY: 800,
  deck: { phoneWidth: 180, centreY: 640, spread: 118, textY: 160, textSize: 80 },
  end: { mascotSize: 250, headlineSize: 150, buttonSize: 38, addressSize: 28 },
};

export function layoutFor(width: number, height: number): Layout {
  return height > width ? portrait : square;
}
