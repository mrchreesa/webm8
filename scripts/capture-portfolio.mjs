// Captures the portfolio screenshots in public/work/. Dev-only, run by hand.
//
//   npm i --no-save playwright && npx playwright install chromium
//   node scripts/capture-portfolio.mjs                 # every target
//   node scripts/capture-portfolio.mjs stitch-house    # just one
//   node scripts/capture-portfolio.mjs --phone         # only the homepage story's phone captures
//
// The phone capture (<slug>-phone.webp) is a tall shot of the top of the site
// for the homepage story, with the site's fixed bars hidden. It also prints
// the numbers lib/site.ts keeps beside it: the image size, the colour at the
// top of the page and the centre of the main button.
//
// The recruitment site is behind Vercel's login, so it is only captured when
// RECRUITMENT_URL (a Vercel share link) is set. Never commit that link.

import { chromium } from "playwright";
import sharp from "sharp";

const targets = [
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
  { slug: "aesthetic-veil", url: "https://aesthetic-navy.vercel.app/veil/", hide: ['nav[aria-label="Design directions"]'] },
  { slug: "aesthetic-nacre", url: "https://aesthetic-navy.vercel.app/nacre/", hide: ['nav[aria-label="Design directions"]'] },
  // Two concepts for one clothing brand, shown as separate projects; each page carries a pill linking to the other.
  // Atelier's hero photo reveals itself tile by tile; give it time to finish.
  { slug: "chibauchi-atelier", url: "https://clothes-accessories-store.vercel.app/design-a/", hide: [".demo-pill"], settle: 6000 },
  { slug: "chibauchi-studio", url: "https://clothes-accessories-store.vercel.app/design-b/", hide: [".demo-pill"] },
  ...(process.env.RECRUITMENT_URL ? [{ slug: "recruitment", url: process.env.RECRUITMENT_URL, hide: [] }] : []),
];

const views = [
  { name: "desktop", width: 1600, height: 900, scale: 1 },
  { name: "mobile", width: 420, height: 900, scale: 1 },
  // 390 wide like an iPhone; the story's phone scrolls through this much of the page.
  { name: "phone", width: 390, height: 844, scale: 2, length: 1400 },
];

const args = process.argv.slice(2);
const phoneOnly = args.includes("--phone");
const only = new Set(args.filter((arg) => !arg.startsWith("--")));
const browser = await chromium.launch();

for (const target of targets.filter((t) => only.size === 0 || only.has(t.slug))) {
  const wanted = views.filter((view) => {
    if (view.name === "phone") return Boolean(target.phone);
    return !phoneOnly && (!target.views || target.views.includes(view.name));
  });
  for (const view of wanted) {
    const page = await browser.newPage({
      viewport: { width: view.width, height: view.height },
      deviceScaleFactor: view.scale,
      isMobile: view.name !== "desktop",
      hasTouch: view.name !== "desktop",
    });
    await page.goto(target.url, { waitUntil: "networkidle", timeout: 60_000 });
    if (target.hide.length) {
      await page.addStyleTag({ content: `${target.hide.join(",")}{display:none!important}` });
    }
    if (target.reveal) {
      await page.addStyleTag({ content: `${target.reveal.join(",")}{filter:none!important;opacity:1!important}` });
    }
    await page.evaluate(() => document.fonts.ready);
    const file = `public/work/${target.slug}-${view.name}.webp`;

    if (view.name === "phone") {
      // Scroll down and back so sections that reveal on scroll are drawn.
      for (let y = 0; y <= view.length; y += 200) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(250);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(2500);
      const box = await page.locator(target.phone.button).first().boundingBox();
      const png = await page.screenshot({
        type: "png",
        fullPage: true,
        clip: { x: 0, y: 0, width: view.width, height: view.length },
      });
      const { data } = await sharp(png).extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
      const top = `#${[...data.subarray(0, 3)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
      const image = await sharp(png).webp({ quality: 78 }).toFile(file);
      console.log(`saved ${file}`, {
        width: image.width,
        height: image.height,
        top,
        button: box && { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) },
      });
    } else {
      await page.waitForTimeout(target.settle ?? 2500); // let entrance animations settle
      const png = await page.screenshot({ type: "png" });
      await sharp(png).webp({ quality: 80 }).toFile(file);
      console.log(`saved ${file}`);
    }
    await page.close();
  }
}

await browser.close();
