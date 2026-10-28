// Captures the showreel's screenshots in public/captures/. Run by hand, from video/.
//
//   npx playwright install chromium     # once
//   npm run capture                     # all six reel sites
//   npm run capture -- aesthetic-nacre  # just one
//
// Each site gets a tall desktop shot and a tall phone shot at 2x, which the
// reel scrolls inside its browser frame and phone. Their sizes go into
// public/captures/captures.json, which the reel reads.
//
// The sites, and what to hide or wait for on each, are the portfolio's own
// list in ../scripts/portfolio-targets.mjs.

import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";
import { targets } from "../../scripts/portfolio-targets.mjs";
import { reelSlugs } from "../src/reel.ts";

const views = [
  { name: "desktop", width: 1280, height: 800, scale: 2, length: 2400 },
  { name: "phone", width: 390, height: 844, scale: 2, length: 1600 },
];

const manifestFile = "public/captures/captures.json";
const manifest = JSON.parse(await readFile(manifestFile, "utf8").catch(() => "{}"));

const only = new Set(process.argv.slice(2));
const slugs = reelSlugs.filter((slug) => only.size === 0 || only.has(slug));
const browser = await chromium.launch();

for (const slug of slugs) {
  const target = targets.find((t) => t.slug === slug);
  if (!target) throw new Error(`No capture target for "${slug}" in scripts/portfolio-targets.mjs`);
  manifest[slug] ??= {};

  for (const view of views) {
    const page = await browser.newPage({
      viewport: { width: view.width, height: view.height },
      deviceScaleFactor: view.scale,
      isMobile: view.name === "phone",
      hasTouch: view.name === "phone",
    });
    await page.goto(target.url, { waitUntil: "networkidle", timeout: 60_000 });
    if (target.hide.length) {
      await page.addStyleTag({ content: `${target.hide.join(",")}{display:none!important}` });
    }
    if (target.reveal) {
      await page.addStyleTag({ content: `${target.reveal.join(",")}{filter:none!important;opacity:1!important}` });
    }
    await page.evaluate(() => document.fonts.ready);

    // Scroll down and back so sections that reveal on scroll are drawn.
    for (let y = 0; y <= view.length; y += 200) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(250);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(Math.max(target.settle ?? 0, 2500));

    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const png = await page.screenshot({
      type: "png",
      fullPage: true,
      clip: { x: 0, y: 0, width: view.width, height: Math.min(view.length, pageHeight) },
    });
    const file = `${slug}-${view.name}.webp`;
    const image = await sharp(png).webp({ quality: 82 }).toFile(`public/captures/${file}`);
    manifest[slug][view.name] = { src: `captures/${file}`, width: image.width, height: image.height };
    console.log(`saved public/captures/${file}`, `${image.width}×${image.height}`, `${Math.round(image.size / 1024)} KB`);
    await page.close();
  }
}

await browser.close();
await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
