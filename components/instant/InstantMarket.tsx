"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { instantOffer, type InstantMarket } from "@/lib/instantPricing";

const MarketContext = createContext<{ market: InstantMarket; setMarket: (market: InstantMarket) => void } | null>(null);
export function InstantMarketProvider({ initialMarket, children }: { initialMarket: InstantMarket; children: ReactNode }) {
  const [market, setMarket] = useState(initialMarket);
  const value = useMemo(() => ({ market, setMarket }), [market]);
  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}
export function useInstantMarket() {
  const context = useContext(MarketContext);
  if (!context) throw new Error("Instant pricing requires its market provider");
  return { ...context, offer: instantOffer(context.market) };
}
