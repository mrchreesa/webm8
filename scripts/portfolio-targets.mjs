// The live sites the portfolio screenshots are taken from. Shared by
// scripts/capture-portfolio.mjs and video/scripts/capture.mjs.
//
// hide: selectors removed before a capture. reveal: selectors forced visible.
// settle: how long to wait for entrance animations (default 2500 ms).
// phone: the homepage story's phone capture, and where its main button is.

export const targets = [
  { slug: "stitch-house", url: "https://stitch-shop-one.vercel.app/heritage/", hide: [".compare-pill"] },
  {
    slug: "allen-fitness",
    url: "https://sports-ecom-nu.vercel.app/",
    hide: [".concept-switcher"],
    phone: { button: "text=Find your fit" },
  },
  { slug: "ideal-baby", url: "https://baby-shop-blue-ten.vercel.app/pop/", hide: [] },
  {
    slug: "solvers-cleaning",
    url: "https://sovlers-cleaning.vercel.app/demo-b/",
    hide: [".dock"],
    // Its statement fades in word by word as you scroll; show it whole.
    reveal: [".statement__text .word"],
    phone: { button: "main >> text=Get a free quote" },
  },
  // Removals is only captured for the phone: its desktop and mobile shots predate this script.
  {
    slug: "removals",
    url: "https://removals.webm8agency.com/",
    hide: [".scroll-to-top"],
    views: ["phone"],
    phone: { button: "input >> nth=0" },
  },
  {
    slug: "dps-gasworks",
    url: "https://gaswork-dsp.vercel.app/",
    hide: [".call-bar"],
    phone: { button: "main >> text=Get a quote" },
  },
  // Two directions for one clinic, shown as separate projects; each page carries a switcher between them.
  {
    slug: "aesthetic-veil",
    url: "https://aesthetic-navy.vercel.app/veil/",
    hide: ['nav[aria-label="Design directions"]'],
    // Its manifesto sharpens word by word as you scroll; show it whole.
    reveal: ['[class*="__manifestoText"] span'],
  },
  { slug: "aesthetic-nacre", url: "https://aesthetic-navy.vercel.app/nacre/", hide: ['nav[aria-label="Design directions"]'] },
  // Two concepts for one clothing brand, shown as separate projects; each page carries a pill linking to the other.
  // Atelier's hero photo reveals itself tile by tile; give it time to finish.
  { slug: "chibauchi-atelier", url: "https://clothes-accessories-store.vercel.app/design-a/", hide: [".demo-pill"], settle: 6000 },
  { slug: "chibauchi-studio", url: "https://clothes-accessories-store.vercel.app/design-b/", hide: [".demo-pill"] },
  ...(process.env.RECRUITMENT_URL ? [{ slug: "recruitment", url: process.env.RECRUITMENT_URL, hide: [] }] : []),
];
