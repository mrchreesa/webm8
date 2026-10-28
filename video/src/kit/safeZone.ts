/**
 * The organic kit's frame: 9:16 Reels. Meta asks that text and logos stay out
 * of the top 14%, the bottom 35% and 6% of each side, where Instagram and
 * Facebook draw their own buttons and captions
 * (facebook.com/business/help/980593475366490). Pictures may run into those
 * edges; words may not.
 */

export const REEL = { width: 1080, height: 1920, fps: 30 } as const;

export const SAFE = {
  left: Math.round(REEL.width * 0.06),
  right: REEL.width - Math.round(REEL.width * 0.06),
  top: Math.round(REEL.height * 0.14),
  bottom: REEL.height - Math.round(REEL.height * 0.35),
} as const;

export type Rect = { x: number; y: number; width: number; height: number };

export function insideSafe(rect: Rect): boolean {
  return rect.x >= SAFE.left && rect.y >= SAFE.top && rect.x + rect.width <= SAFE.right && rect.y + rect.height <= SAFE.bottom;
}

/** The WebM8 mark in the top corner, from the first frame of every post. */
export const BRAND_BUG: Rect = { x: SAFE.left, y: SAFE.top + 6, width: 250, height: 56 };

/** The end card's words: the headline and the line under it. */
export const END_CARD = {
  mascot: { x: 390, y: SAFE.top + 60, width: 300, height: 300 },
  headline: { x: SAFE.left, y: SAFE.top + 400, width: SAFE.right - SAFE.left, height: 250 },
  sub: { x: SAFE.left, y: SAFE.top + 680, width: SAFE.right - SAFE.left, height: 70 },
} as const;
