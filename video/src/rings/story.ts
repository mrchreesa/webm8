/**
 * What "The phone rings" shows. The three rounds are trades WebM8 has built a
 * real site for, so each plays that site's own tall phone capture and taps its
 * real main button. The searches, request forms and enquiries are the
 * homepage story's examples from lib/trades.ts, which is why the video carries
 * a "dramatisation" footnote.
 */
import { projects, type PhoneShot } from "../../../lib/site.ts";
import { isPortfolioSite, ratingOf, searchSuggestions, tradeList, type Trade, type TradeKey } from "../../../lib/trades.ts";

export const roundTrades = ["plumbing", "cleaning", "moving"] as const satisfies readonly TradeKey[];

/** The pile at the end: the three rounds' enquiries, then six more trades. */
export const pileTrades = [
  "plumbing",
  "cleaning",
  "moving",
  "hvac",
  "salon",
  "electrical",
  "dental",
  "landscaping",
  "roofing",
] as const satisfies readonly TradeKey[];

export type RoundStory = {
  trade: Trade;
  /** The project in lib/site.ts whose real site the round plays. */
  project: string;
  shot: PhoneShot;
  rating: string;
  suggestions: string[];
};

function tradeOf(key: TradeKey): Trade {
  const trade = tradeList.find((t) => t.key === key);
  if (!trade) throw new Error(`No trade "${key}" in lib/trades.ts`);
  return trade;
}

export function roundStories(): RoundStory[] {
  return roundTrades.map((key) => {
    const trade = tradeOf(key);
    if (!isPortfolioSite(trade.site)) throw new Error(`The ${key} trade has no real site in lib/trades.ts`);
    const slug = trade.site.project;
    const shot = projects.find((p) => p.slug === slug)?.screenshots.phone;
    if (!shot) throw new Error(`Project "${slug}" has no phone capture in lib/site.ts`);
    return { trade, project: slug, shot, rating: ratingOf(trade), suggestions: searchSuggestions(trade) };
  });
}

export type Enquiry = { key: TradeKey; business: string; title: string; body: string };

export function enquiryOf(key: TradeKey): Enquiry {
  const trade = tradeOf(key);
  return { key, business: trade.exampleName, ...trade.notification };
}

export function pile(): Enquiry[] {
  return pileTrades.map(enquiryOf);
}

export const copy = {
  find: "They find you.",
  tap: "They tap.",
  ask: "They ask.",
  lights: "Your phone lights up.",
  again: "Again.",
  andAgain: "And again.",
  stack: "Built to bring in enquiries.",
  closeHeadline: ["Your phone", "could be", "next."],
  button: "Get your free demo",
  address: "webm8agency.com/free-demo",
  footnote: "Dramatisation. The searches and enquiries are examples.",
} as const;
