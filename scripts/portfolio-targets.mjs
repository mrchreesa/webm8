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
  // The clinic's other direction carries the same switcher.
  { slug: "aesthetic-nacre", url: "https://aesthetic-navy.vercel.app/nacre/", hide: ['nav[aria-label="Design directions"]'] },
  // The clothing brand's other concept carries the same pill.
  { slug: "chibauchi-studio", url: "https://clothes-accessories-store.vercel.app/design-b/", hide: [".demo-pill"] },
  // Boniface's gold silk and All Things New's sunrise take a few seconds to draw in.
  { slug: "boniface-salon", url: "https://beauty-two-zeta.vercel.app/demo-a-gilded/", hide: [], settle: 6000 },
  { slug: "waffles-bubbles", url: "https://waffles-bubbles.vercel.app/a/", hide: [".dock"], settle: 4000 },
  { slug: "all-things-new", url: "https://wellness-ria.vercel.app/gulf-dawn/", hide: [], settle: 6000 },
  { slug: "fcg-painting", url: "https://painting-decorating.vercel.app/b/", hide: [".action-bar"], settle: 4000 },
  ...(process.env.RECRUITMENT_URL ? [{ slug: "recruitment", url: process.env.RECRUITMENT_URL, hide: [] }] : []),
];
