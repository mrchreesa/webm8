import { Barlow_Condensed, Marcellus, Yellowtail } from "next/font/google";
import { siteFonts } from "@/components/home/story/fonts";

/*
 * Display faces for the sketch's templates, beside the four the homepage
 * story already loads. None is preloaded: the browser fetches each one when
 * a template that uses it is built.
 */

const barlow = Barlow_Condensed({ weight: ["600", "700"], subsets: ["latin"], display: "swap", preload: false });
const marcellus = Marcellus({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const yellowtail = Yellowtail({ weight: "400", subsets: ["latin"], display: "swap", preload: false });

export const sketchFonts = {
  ...siteFonts,
  barlow: barlow.style.fontFamily,
  marcellus: marcellus.style.fontFamily,
  yellowtail: yellowtail.style.fontFamily,
};

export type SketchFont = keyof typeof sketchFonts;
