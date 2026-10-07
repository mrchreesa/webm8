import type { ComponentType, CSSProperties } from "react";
import type { TradeKey } from "@/lib/trades";
import {
  BarberArt,
  CafeArt,
  DentalArt,
  ElectricalArt,
  HvacArt,
  LandscapingArt,
  MedspaArt,
  OtherArt,
  RestaurantArt,
  RoofingArt,
  SalonArt,
} from "./art";
import { siteFonts, type SiteFont } from "./fonts";

/**
 * How each drawn example site looks. The copy lives in lib/trades.ts; this
 * is only the design: one of four layouts, a typeface, a drawing and the
 * site's colours. Trades that show a real WebM8 site (cleaning, fitness and
 * moving) have no look.
 *
 * - poster: big condensed type on a strong ground, a tall drawing beside it.
 * - editorial: centred serif type under an arched frame.
 * - utility: a picture card, then a chunky headline and the trust points.
 * - soft: a pastel ground, a round picture and a sticker.
 */
export type SiteLayout = "poster" | "editorial" | "utility" | "soft";

type Colours = {
  /** The page's ground and its text. */
  ground: string;
  ink: string;
  /** The main button, and its text. */
  hot: string;
  hotInk: string;
  /** Hairlines (editorial), the picture card (utility) or the disc (soft). */
  extra?: string;
};

export type SiteLook = {
  layout: SiteLayout;
  font: SiteFont;
  Art: ComponentType;
  colours: Colours;
};

export const looks: Partial<Record<TradeKey, SiteLook>> = {
  hvac: { layout: "utility", font: "bricolage", Art: HvacArt, colours: { ground: "#ffffff", ink: "#0c1a3d", hot: "#2563eb", hotInk: "#ffffff", extra: "#1e3a8a" } },
  electrical: { layout: "utility", font: "bricolage", Art: ElectricalArt, colours: { ground: "#111827", ink: "#f9fafb", hot: "#facc15", hotInk: "#1f1a00", extra: "#0b1120" } },
  roofing: { layout: "utility", font: "bricolage", Art: RoofingArt, colours: { ground: "#fbeee6", ink: "#2a1006", hot: "#9a3412", hotInk: "#ffffff", extra: "#fdba74" } },
  other: { layout: "utility", font: "bricolage", Art: OtherArt, colours: { ground: "#ffffff", ink: "#0e2f56", hot: "#1f5fd6", hotInk: "#ffffff", extra: "#0e2f56" } },
  barber: { layout: "poster", font: "anton", Art: BarberArt, colours: { ground: "#0a0a0a", ink: "#f5f5f4", hot: "#f5f5f4", hotInk: "#0a0a0a" } },
  restaurant: { layout: "editorial", font: "fraunces", Art: RestaurantArt, colours: { ground: "#3f0a0a", ink: "#f8ece4", hot: "#fcd34d", hotInk: "#2b1d00", extra: "rgb(252 211 77 / 0.55)" } },
  salon: { layout: "editorial", font: "cormorant", Art: SalonArt, colours: { ground: "#fbe9f1", ink: "#2e0716", hot: "#9d174d", hotInk: "#ffffff", extra: "rgb(157 23 77 / 0.4)" } },
  medspa: { layout: "editorial", font: "cormorant", Art: MedspaArt, colours: { ground: "#f7eef4", ink: "#2c1a29", hot: "#8b5e83", hotInk: "#ffffff", extra: "rgb(139 94 131 / 0.45)" } },
  cafe: { layout: "soft", font: "fraunces", Art: CafeArt, colours: { ground: "#f6eee6", ink: "#2a190c", hot: "#6b4423", hotInk: "#ffffff", extra: "#fde68a" } },
  dental: { layout: "soft", font: "bricolage", Art: DentalArt, colours: { ground: "#e6f6fa", ink: "#0b2a33", hot: "#0e7490", hotInk: "#ffffff", extra: "#a5f3fc" } },
  landscaping: { layout: "soft", font: "fraunces", Art: LandscapingArt, colours: { ground: "#edf6e6", ink: "#13260f", hot: "#2f7a32", hotInk: "#ffffff", extra: "#d9f99d" } },
};

/** The custom properties site.module.css reads for one trade. */
export function lookStyle(look: SiteLook): CSSProperties {
  const c = look.colours;
  return {
    "--g": c.ground,
    "--g-ink": c.ink,
    "--hot": c.hot,
    "--hot-ink": c.hotInk,
    "--extra": c.extra ?? c.hot,
    "--font": siteFonts[look.font],
  } as CSSProperties;
}
