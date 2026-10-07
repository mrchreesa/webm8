import { formatUsd, moverPlans } from "./movers.ts";

/**
 * The picture a link to the site shows when it is shared: Facebook, WhatsApp,
 * iMessage, LinkedIn, X, Slack. Each card is drawn by
 * components/og/shareImage.tsx and served, built once at build time, from
 * /og/<name>.jpg (app/og/[card]/route.tsx). createPageMetadata points a page
 * at its card.
 */

export type ShareVisual =
  /** A phone showing one project's tall capture, with a call coming in. */
  | { kind: "phone"; project: string }
  /** Three phones fanned out, as in the demo hero. */
  | { kind: "deck"; projects: [string, string, string] }
  /** A project on a computer, with the same site on a phone in front. */
  | { kind: "browser"; project: string }
  | { kind: "mascot" };

export type ShareCard = {
  /** Describes the picture for screen readers (og:image:alt). */
  alt: string;
  eyebrow: string;
  /** Words between asterisks are set in neon. */
  title: string;
  subtitle: string;
  visual: ShareVisual;
};

const fromPrice = formatUsd(Math.min(...moverPlans.map((plan) => plan.monthlyPrice)));

export const shareCards = {
  home: {
    alt: "WebM8: websites that make your phone ring. A plumber's website on a phone, with a new customer calling.",
    eyebrow: "Websites for local businesses",
    title: "Websites that make your phone *ring.*",
    subtitle: "Designed, built and looked after for local businesses in the US and UK.",
    visual: { kind: "phone", project: "dps-gasworks" },
  },
  work: {
    alt: "A tailor's website WebM8 designed, shown on a computer and a phone.",
    eyebrow: "Our work",
    title: "Demo sites we designed for *local businesses.*",
    subtitle: "Tailors, cleaners, removals, clinics and shops. On a computer and a phone.",
    visual: { kind: "browser", project: "stitch-house" },
  },
  pricing: {
    alt: "WebM8 pricing: every project is quoted to the business.",
    eyebrow: "Pricing",
    title: "Every project is quoted *to the business.*",
    subtitle: "Tell us what you need. A straight number within one business day.",
    visual: { kind: "mascot" },
  },
  "free-demo": {
    alt: "See your new website before you pay a thing: three demo websites WebM8 designed, on phones.",
    eyebrow: "Free demo · No obligation",
    title: "See your new website *before* you pay a thing.",
    subtitle: "Tell us about your business. We design your homepage, free.",
    visual: { kind: "deck", projects: ["chibauchi-atelier", "stitch-house", "solvers-cleaning"] },
  },
  movers: {
    alt: "A moving company's website WebM8 built, shown on a computer and a phone.",
    eyebrow: "For US moving companies",
    title: "Your hands are full. Your website can take the *details.*",
    subtitle: `Moving company websites, built and managed from ${fromPrice}/month.`,
    visual: { kind: "browser", project: "removals" },
  },
  about: {
    alt: "About WebM8: websites that help local businesses make more money.",
    eyebrow: "About WebM8",
    title: "Websites that help local businesses *make more money.*",
    subtitle: "We design, build and look after websites for businesses in the US and UK.",
    visual: { kind: "mascot" },
  },
  contact: {
    alt: "Contact WebM8: start a project. We reply within one business day.",
    eyebrow: "Contact",
    title: "Start a project. We reply within *one business day.*",
    subtitle: "A new website, a plan change or a question. Just ask.",
    visual: { kind: "mascot" },
  },
  privacy: {
    alt: "WebM8's privacy notice.",
    eyebrow: "Privacy",
    title: "A plain-English *privacy notice.*",
    subtitle: "How WebM8 collects, uses, stores and protects your information.",
    visual: { kind: "mascot" },
  },
} satisfies Record<string, ShareCard>;

export type ShareCardName = keyof typeof shareCards;

export const shareCardNames = Object.keys(shareCards) as ShareCardName[];

export function isShareCardName(value: string): value is ShareCardName {
  return Object.hasOwn(shareCards, value);
}

export const shareImageSize = { width: 1200, height: 630 } as const;

/**
 * A JPEG, not Satori's PNG: WhatsApp drops previews much over 300 KB, and a
 * card full of screenshots is several times that as a PNG.
 */
export const shareImageType = "image/jpeg";

/**
 * Where a card is served. It ends in .jpg so trailingSlash never redirects it:
 * crawlers such as WhatsApp's do not reliably follow a redirect for an image.
 */
export function shareImagePath(name: ShareCardName) {
  return `/og/${name}.jpg`;
}

/** Splits a title into words, marking those between asterisks as neon. */
export function titleWords(title: string) {
  let neon = false;
  return title.split(" ").map((raw) => {
    if (raw.startsWith("*")) neon = true;
    const word = { word: raw.replaceAll("*", ""), neon };
    if (raw.endsWith("*")) neon = false;
    return word;
  });
}
