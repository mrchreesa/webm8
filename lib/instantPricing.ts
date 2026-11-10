/** Fixed regional offers. Never accept a browser-supplied amount or price ID. */
export type InstantMarket = "GB" | "US";
export const INSTANT_OFFERS = {
  GB: { market: "GB", currency: "gbp", amount: 39, minorUnits: 3900, price: "£39", zero: "£0" },
  US: { market: "US", currency: "usd", amount: 79, minorUnits: 7900, price: "$79", zero: "$0" },
} as const;
export function instantMarket(country: string | null | undefined): InstantMarket {
  return country?.trim().toUpperCase() === "US" ? "US" : "GB";
}
export function instantOffer(market: InstantMarket = "GB") { return INSTANT_OFFERS[market]; }
/** Vercel supplies this header from the visitor IP; do not infer billing from language. */
export function requestInstantMarket(headers: Pick<Headers, "get">): InstantMarket {
  return instantMarket(headers.get("x-vercel-ip-country"));
}
