import type { CSSProperties } from "react";
import { DrawnTradeSite } from "@/components/home/story/TradeSite";
import { TradeIcon } from "@/components/home/story/TradeIcon";
import { lookStyle, looks, type SiteLook } from "@/components/home/story/looks";
import { cn } from "@/lib/cn";
import { initialOf, isPortfolioSite, trades, type DrawnSite, type Trade, type TradeKey } from "@/lib/trades";
import styles from "./demo.module.css";

/**
 * The visitor's quick sketch on /demo/: their trade's example site from the
 * homepage story, with their business name and town on it. It is a sketch,
 * never the demo, and is always labelled as one.
 *
 * Trades whose story shows a real WebM8 site (cleaning, fitness, moving) have
 * no drawn design, so they get a plain one here in the trade's own colours.
 */

const NAME_PLACEHOLDER = "Your business";

type FallbackCopy = Omit<DrawnSite, "phone">;

const fallbackCopy: Partial<Record<TradeKey, FallbackCopy>> = {
  cleaning: {
    headline: "Spotless, every time.",
    badge: "Free quotes today",
    sub: "Trusted local cleaners for homes, end of tenancy and offices.",
    cta: "Get a free quote",
    services: ["Regular cleaning", "Deep cleans", "End of tenancy"],
    review: { quote: "Spotless, on time and so easy to book.", name: "A happy customer" },
  },
  fitness: {
    headline: "Stronger starts here.",
    badge: "First session free",
    sub: "Coaching, classes and memberships from people who love it.",
    cta: "Book a free session",
    services: ["Personal training", "Classes", "Memberships"],
    review: { quote: "The friendliest gym I've ever joined.", name: "A happy member" },
  },
  moving: {
    headline: "Moving day, handled.",
    badge: "Free quotes in 24 hours",
    sub: "Careful, on-time moves with a crew that treats your things like theirs.",
    cta: "Get a free quote",
    services: ["Local moves", "Packing", "Storage"],
    review: { quote: "On time, careful and not a scratch on anything.", name: "A happy customer" },
  },
};

function iconArt(key: TradeKey) {
  return function IconArt() {
    return (
      <span className="grid h-full w-full place-items-center p-[9cqi] text-white/90">
        <TradeIcon trade={key} strokeWidth={1.4} />
      </span>
    );
  };
}

function fallbackFor(trade: Trade): { copy: DrawnSite; look: SiteLook } {
  const copy = fallbackCopy[trade.key] ?? {
    headline: `${trade.short}, done properly.`,
    badge: "Free quotes",
    sub: "A trusted local team, easy to reach and quick to reply.",
    cta: "Get in touch",
    services: ["Our services", "About us", "Reviews"] as [string, string, string],
    review: { quote: "Brilliant from start to finish.", name: "A happy customer" },
  };
  const { palette } = trade;
  return {
    copy: { ...copy, phone: "" }, // sketchFor sets the call line
    look: {
      layout: "utility",
      font: "bricolage",
      Art: iconArt(trade.key),
      colours: { ground: palette.soft, ink: palette.ink, hot: palette.primary, hotInk: "#ffffff", extra: palette.deep },
    },
  };
}

const tidy = (value: string) => value.replace(/\s+/g, " ").trim();

function shorten(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

export function sketchFor(key: TradeKey, business: string, area: string) {
  const base = trades[key];
  const look = looks[key];
  const drawn = !isPortfolioSite(base.site) && look ? { copy: base.site, look } : fallbackFor(base);
  const place = tidy(area);
  return {
    trade: { ...base, exampleName: tidy(business) || NAME_PLACEHOLDER },
    copy: {
      ...drawn.copy,
      badge: place ? `Serving ${shorten(place, 22)}` : drawn.copy.badge,
      // The poster layout prints "Call {phone}". A real business's sketch
      // never carries one of the story's fictional numbers.
      phone: "now",
    },
    look: drawn.look,
  };
}

/** The sketch, filling its card. Sizes are in cqi of the card's width. */
export function DemoSketch({ trade, business, area }: { trade: TradeKey; business: string; area: string }) {
  const sketch = sketchFor(trade, business, area);
  return (
    <div className="absolute inset-0 overflow-hidden [container-type:inline-size]">
      <DrawnTradeSite trade={sketch.trade} copy={sketch.copy} look={sketch.look} standalone />
    </div>
  );
}

/** The slim bar under the input on phones, while the keyboard hides the deck. */
export function DemoMiniSketch({
  trade,
  business,
  area = "",
  className,
}: {
  trade: TradeKey;
  business: string;
  area?: string;
  className?: string;
}) {
  const { look } = sketchFor(trade, business, "");
  const name = tidy(business) || NAME_PLACEHOLDER;
  const place = tidy(area);
  return (
    <div
      aria-hidden="true"
      className={cn("flex items-center gap-2.5 rounded-xl px-3 py-2", className)}
      style={{ ...lookStyle(look), background: "var(--g)", color: "var(--g-ink)" } as CSSProperties}
    >
      <span
        key={initialOf(name)}
        className={cn(styles.flip, "grid h-7 w-7 shrink-0 place-items-center rounded-md text-sm font-extrabold")}
        style={{ background: "var(--hot)", color: "var(--hot-ink)" }}
      >
        {initialOf(name)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[1.05rem] leading-tight font-bold tracking-tight" style={{ fontFamily: "var(--font)" }}>
          {name}
        </span>
        {place ? <span className="block truncate text-xs opacity-70">Serving {place}</span> : null}
      </span>
      <span className="ml-auto shrink-0 font-mono text-[0.6rem] tracking-[0.08em] uppercase opacity-60">Live sketch</span>
    </div>
  );
}
