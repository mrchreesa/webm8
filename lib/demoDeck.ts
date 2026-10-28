/**
 * Index and motion maths for the card deck on /demo/ and /free-demo/
 * (components/demo/DemoDeck.tsx).
 */

export function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

/**
 * Where a card sits relative to the front card: 0 is the front, 1 and -1 fan
 * out to the right and left, and larger distances sit further behind. It
 * takes the short way round, so the deck feels endless in both directions.
 * `active` may be a fraction, for a deck caught between two cards mid-drag.
 */
export function cardOffset(card: number, active: number, count: number): number {
  if (count <= 1) return 0;
  const ahead = wrapIndex(card - active, count);
  return ahead > count / 2 ? ahead - count : ahead;
}

/**
 * One step of a critically damped spring: where it is (`offset` from its rest
 * point) and how fast it is moving, `dt` seconds on. `stiffness` is its
 * natural frequency in radians per second. It is solved exactly, so every
 * frame rate gives the same motion, and it comes to rest without bouncing.
 */
export function springStep(offset: number, velocity: number, stiffness: number, dt: number): [number, number] {
  const decay = Math.exp(-stiffness * dt);
  const drift = velocity + stiffness * offset;
  return [(offset + drift * dt) * decay, (velocity - stiffness * drift * dt) * decay];
}

/**
 * For the 3D ring on the same decks: the turn, among all the turns that show
 * card `index` in front, closest to where the ring is now (`position`, in
 * cards, not wrapped). Gliding there always takes the short way round.
 */
export function nearestTurn(position: number, index: number, count: number): number {
  return index + Math.round((position - index) / count) * count;
}

/**
 * How far back a camera with vertical field of view `fovDeg` must stand for
 * a subject `width` by `height` to fill a view of `aspect` (width over height)
 * without being cropped either way.
 */
export function cameraDistance(fovDeg: number, aspect: number, width: number, height: number): number {
  const half = Math.tan((fovDeg / 2) * (Math.PI / 180));
  return Math.max(width / (2 * half * aspect), height / (2 * half));
}
