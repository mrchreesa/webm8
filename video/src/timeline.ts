/**
 * Where every beat of the showreel sits, in frames. Pure numbers, shared by
 * the scenes and held in place by timeline.test.ts: the beats fill 600 frames,
 * every name stays readable for 1.5 s, the shakes and flashes keep off the
 * sites, and the end card holds still for its last 1.5 s.
 */

/** A span of frames, `from` inclusive and `to` exclusive. */
export type Span = { from: number; to: number };

export const FPS = 30;
export const TOTAL_FRAMES = 600;
export const SITE_COUNT = 6;

export const HOOK: Span = { from: 0, to: 60 };
export const SITES: Span = { from: 60, to: 450 };
export const DECK: Span = { from: 450, to: 510 };
export const END: Span = { from: 510, to: 600 };

const HOOK_LINE_FRAMES = 20;
const SITE_FRAMES = 65;
const WHIP_FRAMES = 6;
const SHAKE_FRAMES = 3;
/** How long a site's name takes to rise into place. */
export const CAPTION_IN_FRAMES = 8;
/** The end card does not move from here to the last frame. */
export const END_STILL_FROM = TOTAL_FRAMES - 45;

export function length(span: Span): number {
  return span.to - span.from;
}

export function overlaps(a: Span, b: Span): boolean {
  return a.from < b.to && b.from < a.to;
}

export function beats(): Span[] {
  return [HOOK, SITES, DECK, END];
}

export function hookLineSpan(line: number): Span {
  const from = HOOK.from + line * HOOK_LINE_FRAMES;
  return { from, to: from + HOOK_LINE_FRAMES };
}

/** The 65 frames that belong to a site, boundary to boundary. */
export function siteSlot(index: number): Span {
  const from = SITES.from + index * SITE_FRAMES;
  return { from, to: from + SITE_FRAMES };
}

/** The frames a site is drawn in: its slot, plus half a whip either side where it has a neighbour. */
export function siteSpan(index: number): Span {
  const slot = siteSlot(index);
  const half = WHIP_FRAMES / 2;
  return {
    from: index > 0 ? slot.from - half : slot.from,
    to: index < SITE_COUNT - 1 ? slot.to + half : slot.to,
  };
}

/** The whip between site `i` and site `i + 1`, centred on their boundary. */
export function whipSpans(): Span[] {
  return Array.from({ length: SITE_COUNT - 1 }, (_, i) => {
    const boundary = siteSlot(i).to;
    return { from: boundary - WHIP_FRAMES / 2, to: boundary + WHIP_FRAMES / 2 };
  });
}

/** 1: the next site comes in from the right. -1: from the left. */
export function whipDirection(boundary: number): 1 | -1 {
  return boundary % 2 === 0 ? 1 : -1;
}

/** The frames a site's name is fully in place and not mid-whip. */
export function nameVisibleSpan(index: number): Span {
  const slot = siteSlot(index);
  const half = WHIP_FRAMES / 2;
  return {
    from: slot.from + Math.max(CAPTION_IN_FRAMES, index > 0 ? half : 0),
    to: index < SITE_COUNT - 1 ? slot.to - half : slot.to,
  };
}

/** Each hook line shakes the frame as it lands. */
export function shakeSpans(): Span[] {
  return [0, 1, 2].map((line) => {
    const { from } = hookLineSpan(line);
    return { from, to: from + SHAKE_FRAMES };
  });
}

/** Full-frame neon: the hook's middle line, and one frame as the end card cuts in. */
export function flashSpans(): Span[] {
  return [hookLineSpan(1), { from: END.from, to: END.from + 1 }];
}

/** The end card's moves. All of them finish by END_STILL_FROM. */
export const END_CUES = {
  flash: { from: 510, to: 511 },
  headline: { from: 511, to: 529 },
  mascot: { from: 517, to: 537 },
  button: { from: 524, to: 540 },
  address: { from: 530, to: 542 },
  pulse: { from: 540, to: 550 },
  blink: { from: 547, to: 553 },
} satisfies Record<string, Span>;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Cubic ease in and out, 0 → 1. */
export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * Where a site's layer sits during a whip, in frame widths (0 is centred,
 * 1 is one width to the right), and how hard to blur it (0 to 1). Each frame
 * is sampled at its middle, so a whip never shows a layer at rest.
 */
export function whipAt(frame: number, index: number): { x: number; blur: number } {
  const whips = whipSpans();
  let x = 0;
  let blur = 0;
  if (index > 0) {
    const whip = whips[index - 1];
    if (frame >= whip.from && frame < whip.to) {
      const t = (frame - whip.from + 0.5) / length(whip);
      x += whipDirection(index - 1) * (1 - easeInOut(t));
      blur = Math.max(blur, Math.sin(Math.PI * t));
    } else if (frame < whip.from) {
      x += whipDirection(index - 1);
    }
  }
  if (index < SITE_COUNT - 1) {
    const whip = whips[index];
    if (frame >= whip.from && frame < whip.to) {
      const t = (frame - whip.from + 0.5) / length(whip);
      x -= whipDirection(index) * easeInOut(t);
      blur = Math.max(blur, Math.sin(Math.PI * t));
    } else if (frame >= whip.to) {
      x -= whipDirection(index);
    }
  }
  return { x, blur: clamp01(blur) };
}

const SHAKE_OFFSETS = [
  { x: -18, y: 10 },
  { x: 12, y: -8 },
  { x: -6, y: 4 },
];

/** The camera's shake offset in px at a frame; zero outside the shake spans. */
export function shakeAt(frame: number): { x: number; y: number } {
  const span = shakeSpans().find((s) => frame >= s.from && frame < s.to);
  return span ? SHAKE_OFFSETS[frame - span.from] : { x: 0, y: 0 };
}
