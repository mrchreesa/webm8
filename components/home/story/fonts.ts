import { Anton, Bricolage_Grotesque, Cormorant, Fraunces } from "next/font/google";

/*
 * Display faces for the example sites in the story's phone. None of them is
 * preloaded: the browser fetches each one when a trade that uses it is drawn.
 */

const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], display: "swap", preload: false });
const cormorant = Cormorant({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false });
const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false });

export type SiteFont = "anton" | "bricolage" | "cormorant" | "fraunces";

export const siteFonts: Record<SiteFont, string> = {
  anton: anton.style.fontFamily,
  bricolage: bricolage.style.fontFamily,
  cormorant: cormorant.style.fontFamily,
  fraunces: fraunces.style.fontFamily,
};
