import { PHONE_RATIO } from "../layout.ts";

type Caption = { x: number; y: number; width: number; height: number; size: number; align: "center" | "left" };

/** Where things sit in each format, in px. Text keeps `margin` from every edge. */
export type RingsLayout = {
  width: number;
  height: number;
  margin: number;
  phone: { x: number; y: number; width: number; height: number };
  /** The big line: above the phone in 4:5, beside it in 1:1. */
  caption: Caption;
  /** "Built to bring in enquiries." sits above the pile in both formats. */
  stackCaption: Caption;
  footnoteSize: number;
  /** The enquiry as it bursts out of the phone. */
  bigCard: { x: number; y: number; width: number };
  /** The pile of enquiry cards; each lands `cardRise` px higher than the one before. */
  pile: { centreX: number; centreY: number; cardWidth: number; cardRise: number };
  close: { headlineSize: number; buttonSize: number; addressSize: number };
};

export const ringsPortrait: RingsLayout = {
  width: 1080,
  height: 1350,
  margin: 64,
  phone: { x: 305, y: 318, width: 470, height: Math.round(470 * PHONE_RATIO) },
  caption: { x: 64, y: 40, width: 952, height: 260, size: 92, align: "center" },
  stackCaption: { x: 64, y: 40, width: 952, height: 260, size: 92, align: "center" },
  footnoteSize: 17,
  bigCard: { x: 90, y: 560, width: 900 },
  pile: { centreX: 540, centreY: 820, cardWidth: 820, cardRise: 40 },
  close: { headlineSize: 200, buttonSize: 46, addressSize: 32 },
};

export const ringsSquare: RingsLayout = {
  width: 1080,
  height: 1080,
  margin: 64,
  phone: { x: 630, y: 128, width: 396, height: Math.round(396 * PHONE_RATIO) },
  caption: { x: 64, y: 64, width: 540, height: 900, size: 84, align: "left" },
  stackCaption: { x: 64, y: 40, width: 952, height: 200, size: 84, align: "center" },
  footnoteSize: 16,
  bigCard: { x: 64, y: 650, width: 660 },
  pile: { centreX: 540, centreY: 640, cardWidth: 700, cardRise: 30 },
  close: { headlineSize: 156, buttonSize: 38, addressSize: 28 },
};

export function ringsLayoutFor(width: number, height: number): RingsLayout {
  return height > width ? ringsPortrait : ringsSquare;
}
