// Captures the portfolio screenshots in public/work/. Dev-only, run by hand.
//
//   npm i --no-save playwright && npx playwright install chromium
//   node scripts/capture-portfolio.mjs                 # every target
//   node scripts/capture-portfolio.mjs stitch-house    # just one
//
// The recruitment site is behind Vercel's login, so it is only captured when
// RECRUITMENT_URL (a Vercel share link) is set. Never commit that link.

import { chromium } from "playwright";
import sharp from "sharp";

const targets = [
  { slug: "stitch-house", url: "https://stitch-shop-one.vercel.app/heritage/", hide: [".compare-pill"] },
  { slug: "allen-fitness", url: "https://sports-ecom-nu.vercel.app/", hide: [".concept-switcher"] },
  { slug: "ideal-baby", url: "https://baby-shop-blue-ten.vercel.app/pop/", hide: [] },
  { slug: "solvers-cleaning", url: "https://sovlers-cleaning.vercel.app/demo-b/", hide: [] },
  ...(process.env.RECRUITMENT_URL ? [{ slug: "recruitment", url: process.env.RECRUITMENT_URL, hide: [] }] : []),
];

const views = [
  { name: "desktop", width: 1600, height: 900 },
  { name: "mobile", width: 420, height: 900 },
];

const only = new Set(process.argv.slice(2));
const browser = await chromium.launch();

for (const target of targets.filter((t) => only.size === 0 || only.has(t.slug))) {
  for (const view of views) {
    const page = await browser.newPage({
      viewport: { width: view.width, height: view.height },
      deviceScaleFactor: 1,
      isMobile: view.name === "mobile",
      hasTouch: view.name === "mobile",
    });
    await page.goto(target.url, { waitUntil: "networkidle", timeout: 60_000 });
    if (target.hide.length) {
      await page.addStyleTag({ content: `${target.hide.join(",")}{display:none!important}` });
    }
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2500); // let entrance animations settle
    const png = await page.screenshot({ type: "png" });
    const file = `public/work/${target.slug}-${view.name}.webp`;
    await sharp(png).webp({ quality: 80 }).toFile(file);
    console.log(`saved ${file}`);
    await page.close();
  }
}

await browser.close();
