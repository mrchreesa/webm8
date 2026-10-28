/**
 * How an organic post ends. None of them sells hard: follow the series, send
 * it on, or the free demo in the bio.
 */
export const endCards = {
  follow: { headline: "Follow for more", sub: "Websites for local businesses" },
  send: { headline: "Send this to someone who needs it", sub: "Websites for local businesses" },
  demo: { headline: "Want one for your business?", sub: "Free website demo · link in bio" },
} as const;

export type EndCardVariant = keyof typeof endCards;

/** Every move finishes within this many frames of the card's first frame; after that it holds still. */
export const END_CARD_MOVES = 24;
