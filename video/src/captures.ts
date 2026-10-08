import manifest from "../public/captures/captures.json";
import type { ReelSlug } from "./reel.ts";

export type Capture = { src: string; width: number; height: number };

/** scripts/capture.mjs shoots at 2x, so a capture is half its pixel width in CSS px. */
const CAPTURE_SCALE = 2;

/** How many display px a capture moves when its page scrolls by `cssPx`, drawn `displayWidth` wide. */
export function scrolledBy(capture: Capture, displayWidth: number, cssPx: number): number {
  return (cssPx * displayWidth * CAPTURE_SCALE) / capture.width;
}

/** The tall screenshots scripts/capture.mjs took of each reel site. */
export function capturesOf(slug: ReelSlug): { desktop: Capture; phone: Capture } {
  const shots = (manifest as Record<string, { desktop: Capture; phone: Capture }>)[slug];
  if (!shots) throw new Error(`No captures for "${slug}"; run npm run capture -- ${slug}`);
  return shots;
}
