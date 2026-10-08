// Renders a video's key frames to out/stills/, one PNG each, in both formats,
// to check a change without a full render. Run from video/.
//
//   npm run stills                        # the showreel's key frames
//   npm run stills -- rings               # "The phone rings"
//   npm run stills -- rings 95 128        # just these frames
//   npm run stills -- ab --guides          # an organic post, with the safe zone drawn in red

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const videos = {
  // Each hook line, each site mid-scene, a whip, the deck, and the end card moving and at rest.
  showreel: { ids: ["Showreel-4x5", "Showreel-1x1"], keyFrames: [8, 28, 48, 95, 125, 160, 225, 290, 355, 420, 485, 530, 599] },
  // Round one's search, results, site, request and enquiry; rounds two and three; the pile; the close.
  rings: { ids: ["PhoneRings-4x5", "PhoneRings-1x1"], keyFrames: [20, 55, 100, 108, 145, 175, 230, 268, 315, 345, 405, 440, 490, 599] },
  // The hook's lines and question, each side landing and scrolled, the versus beat, the end card moving and at rest.
  ab: { ids: ["AB-veil-nacre"], keyFrames: [2, 20, 50, 64, 150, 200, 290, 336, 400, 430, 479] },
};
const args = process.argv.slice(2);
const video = videos[args.find((arg) => arg in videos) ?? "showreel"];
const asked = args.map(Number).filter(Number.isFinite);
const frames = asked.length ? asked : video.keyFrames;
const inputProps = args.includes("--guides") ? { guides: true } : {};

await mkdir("out/stills", { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
for (const id of video.ids) {
  const composition = await selectComposition({ serveUrl, id, inputProps });
  for (const frame of frames) {
    const output = `out/stills/${id}-${String(frame).padStart(3, "0")}.png`;
    await renderStill({ composition, serveUrl, frame, output, inputProps });
    console.log(`saved ${output}`);
  }
}
