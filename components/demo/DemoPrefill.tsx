"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { LinkButton, type LinkButtonProps } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import { readDemoPrefill, writeDemoPrefill } from "@/lib/demoRequest";
import { defaultTrade, parseTrade, type TradeKey } from "@/lib/trades";

export type DemoPrefillValue = {
  tradeKey: TradeKey;
  business: string;
  /** True once the visitor picked a trade, or arrived with ?trade=. */
  chosen: boolean;
  selectTrade: (key: TradeKey) => void;
  setBusiness: (value: string) => void;
};

const DemoPrefillContext = createContext<DemoPrefillValue | null>(null);

/**
 * Shares the trade and business name a visitor picks on the homepage with the
 * rest of the page and with /demo/. The name is kept in sessionStorage and
 * never goes in a URL, because analytics records page URLs.
 */
export function DemoPrefillProvider({ children }: { children: ReactNode }) {
  const [tradeKey, setTradeKey] = useState<TradeKey>(defaultTrade);
  const [chosen, setChosen] = useState(false);
  const [business, setBusinessState] = useState("");

  useEffect(() => {
    const fromUrl = parseTrade(new URLSearchParams(window.location.search).get("trade"));
    const stored = readDemoPrefill();
    const trade = fromUrl ?? stored.trade;
    if (trade) {
      setTradeKey(trade);
      setChosen(true);
    }
    if (stored.business) setBusinessState(stored.business);
    if (fromUrl) trackEvent("home_trade_selected", { trade: fromUrl, source: "url" });
  }, []);

  // Skip only the very first run, before the stored values above have loaded,
  // so it never overwrites them. After that every change is saved, including
  // clearing the name.
  const loaded = useRef(false);
  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      return;
    }
    writeDemoPrefill({ trade: chosen ? tradeKey : null, business });
  }, [chosen, tradeKey, business]);

  const selectTrade = useCallback((key: TradeKey) => {
    setTradeKey(key);
    setChosen(true);
    trackEvent("home_trade_selected", { trade: key, source: "picker" });
  }, []);

  const value = useMemo<DemoPrefillValue>(
    () => ({ tradeKey, business, chosen, selectTrade, setBusiness: setBusinessState }),
    [tradeKey, business, chosen, selectTrade],
  );

  return <DemoPrefillContext.Provider value={value}>{children}</DemoPrefillContext.Provider>;
}

/** The homepage's choice, or null outside the homepage. */
export function useDemoPrefill(): DemoPrefillValue | null {
  return useContext(DemoPrefillContext);
}

export function demoHref(prefill: Pick<DemoPrefillValue, "tradeKey" | "chosen"> | null): string {
  return prefill?.chosen ? `/demo/?trade=${prefill.tradeKey}` : "/demo/";
}

export type DemoCtaPlacement = "header" | "hero" | "closing";

type DemoCtaButtonProps = Omit<LinkButtonProps, "href"> & { placement: DemoCtaPlacement };

export function DemoCtaButton({ placement, onClick, children, ...props }: DemoCtaButtonProps) {
  const prefill = useDemoPrefill();
  const pathname = usePathname();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    trackEvent("demo_cta_clicked", {
      placement,
      page: pathname ?? "/",
      trade: prefill?.chosen ? prefill.tradeKey : undefined,
    });
  }

  return (
    <LinkButton href={demoHref(prefill)} onClick={handleClick} {...props}>
      {children}
    </LinkButton>
  );
}
