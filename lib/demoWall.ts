/**
 * The wall of real demos in the hero of /free-demo/ and /demo/
 * (components/demo/DemoWall.tsx): which demos it shows, how its columns are
 * made up, and how far the visitor has scrolled past it.
 */

/** Every real demo on the wall, with a short label for its tile. */
export const wallDemos: { slug: string; label: string }[] = [
  { slug: "stitch-house", label: "Tailor, London" },
  { slug: "fcg-painting", label: "Painter, Margate" },
  { slug: "aesthetic-nacre", label: "Aesthetic clinic" },
  { slug: "dps-gasworks", label: "Heating, Bedford" },
  { slug: "waffles-bubbles", label: "Desserts, Orpington" },
  { slug: "removals", label: "Moving" },
  { slug: "boniface-salon", label: "Hair salon, Kent" },
  { slug: "allen-fitness", label: "Activewear" },
  { slug: "ideal-baby", label: "Baby store, Miami" },
  { slug: "all-things-new", label: "Therapist, Florida" },
  { slug: "chibauchi-studio", label: "Clothing brand" },
];

export type WallColumn = {
  /** Laptop screenshots, or the taller phone ones in a narrower column. */
  shot: "desktop" | "mobile";
  drift: "up" | "down";
  /** How long one full drift takes. */
  seconds: number;
  /** How far the column rises, in pixels, as the hero scrolls away: different for each, so the wall comes apart in depth. */
  lift: number;
  slugs: string[];
};

/** Left to right. Every demo has a laptop tile somewhere; neighbours drift opposite ways. */
export const wallColumns: WallColumn[] = [
  { shot: "desktop", drift: "up", seconds: 64, lift: 420, slugs: ["stitch-house", "dps-gasworks", "boniface-salon", "all-things-new", "fcg-painting"] },
  { shot: "mobile", drift: "down", seconds: 80, lift: 160, slugs: ["waffles-bubbles", "allen-fitness", "chibauchi-studio", "aesthetic-nacre"] },
  { shot: "desktop", drift: "up", seconds: 72, lift: 520, slugs: ["ideal-baby", "removals", "aesthetic-nacre", "chibauchi-studio", "allen-fitness"] },
  { shot: "mobile", drift: "down", seconds: 88, lift: 220, slugs: ["fcg-painting", "all-things-new", "boniface-salon", "dps-gasworks"] },
  { shot: "desktop", drift: "up", seconds: 76, lift: 380, slugs: ["chibauchi-studio", "waffles-bubbles", "stitch-house", "removals", "ideal-baby"] },
];

/** 0 while the hero's top is on screen, rising to 1 once it has scrolled its own height away. */
export function heroScrollProgress(top: number, height: number): number {
  if (height <= 0) return 0;
  return Math.min(1, Math.max(0, -top / height));
}
