/** Index maths for the card deck on /demo/ and /free-demo/ (components/demo/DemoDeck.tsx). */

export function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

/**
 * Where a card sits relative to the front card: 0 is the front, 1 and -1 fan
 * out to the right and left, and larger distances sit further behind. It
 * takes the short way round, so the deck feels endless in both directions.
 */
export function cardOffset(card: number, active: number, count: number): number {
  if (count <= 1) return 0;
  const ahead = wrapIndex(card - active, count);
  return ahead > count / 2 ? ahead - count : ahead;
}
