// Renders the homepage hero's phone as the 3D scene draws it at the top of the
// story, before any scroll, into the pictures that stand in for it until the
// 3D arrives (and in the still story): public/home/hero-phone-wide.webp and
// hero-phone-narrow.webp. It also writes where they sit beside the phone's
// anchor to components/home/story3d/heroPoster.ts. Dev-only, run by hand with
// the site running:
//
//   npm i --no-save playwright && npx playwright install chromium
//   node scripts/render-hero-phone.mjs                         # http://localhost:3000
//   node scripts/render-hero-phone.mjs http://localhost:3001
//   CHROME=/path/to/chrome node scripts/render-hero-phone.mjs   # a browser you already have
//
// Run it again whenever the phone, its lighting, its pose at the top of the
// story (heroPhonePose) or Allen Fitness's phone capture changes, or the 3D
// will no longer take over unseen.

import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";
import { heroPhonePose, storyLayout } from "../lib/homeStory.ts";

const base = process.argv[2] ?? "http://localhost:3000";
// One screen for each of storyLayout's arrangements: the phone beside the words, and below them.
const views = [
  { name: "wide", width: 1440, height: 900 },
  { name: "narrow", width: 390, height: 844 },
];
const SCALE = 2;
const round = (value) => Math.round(value * 10000) / 10000;

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--ignore-gpu-blocklist"] });
const poster = {};
for (const view of views) {
  const page = await browser.newPage({ viewport: { width: view.width, height: view.height }, deviceScaleFactor: SCALE });
  await page.goto(`${base}/`, { waitUntil: "load" });
  // A key press starts the 3D at once; the pointer never moves, so the phone does not lean.
  await page.keyboard.press("Shift");
  await page.waitForSelector("[data-gl='ready']", { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.addStyleTag({
    content: `html, body, body * { background: transparent !important; box-shadow: none !important; }
      body * { visibility: hidden !important; }
      [data-analytics-section="Homepage story"] canvas { visibility: visible !important; }`,
  });
  await page.waitForTimeout(300);
  const shot = await page.screenshot({ omitBackground: true });
  await page.close();

  const { data, info } = await sharp(shot).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  const layout = storyLayout(view.width, view.height);
  const pose = heroPhonePose(0, layout);
  const anchorX = view.width / 2 + pose.x;
  const anchorY = view.height / 2 + pose.y;
  const left = -info.trimOffsetLeft / SCALE;
  const top = -info.trimOffsetTop / SCALE;
  const file = `public/home/hero-phone-${view.name}.webp`;
  await sharp(data).webp({ quality: 86, alphaQuality: 90 }).toFile(file);
  poster[view.name] = {
    src: `/home/hero-phone-${view.name}.webp`,
    width: info.width,
    height: info.height,
    left: round((left - anchorX) / layout.phoneH),
    top: round((top - anchorY) / layout.phoneH),
    w: round(info.width / SCALE / layout.phoneH),
    h: round(info.height / SCALE / layout.phoneH),
  };
  console.log(view.name, file, poster[view.name]);
}
await browser.close();

await writeFile(
  "components/home/story3d/heroPoster.ts",
  `// Written by scripts/render-hero-phone.mjs. Do not edit by hand: run the script again.
// The pictures of the hero phone and where they sit: left, top, w and h are in
// phone heights (storyLayout's phoneH), from the phone's anchor.
export const heroPoster = ${JSON.stringify(poster, null, 2)} as const;
`,
);
