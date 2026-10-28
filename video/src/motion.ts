import { spring } from "remotion";
import { FPS } from "./timeline.ts";

/**
 * A spring that overshoots and lands, 0 → 1, starting at `from` and settled
 * at exactly 1 after `frames`, so nothing creeps once a beat is over.
 */
export function punch(frame: number, from: number, frames: number, damping = 10): number {
  if (frame < from) return 0;
  if (frame >= from + frames) return 1;
  return spring({
    frame: frame - from,
    fps: FPS,
    durationInFrames: frames,
    config: { damping, stiffness: 180, mass: 0.7 },
  });
}

/** `a` at 0, `b` at 1, past either end when the spring overshoots. */
export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
