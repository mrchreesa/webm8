// Renders the showreel's key frames to out/stills/, one PNG each, in both
// formats, to check a change without a full render. Run from video/.
//
//   npm run stills             # the default key frames
//   npm run stills -- 95 128   # just these frames

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdir } from "node:fs/promises";
import path from "node:path";

// Each hook line, each site mid-scene, a whip, the deck, and the end card moving and at rest.
const keyFrames = [8, 28, 48, 95, 125, 160, 225, 290, 355, 420, 485, 530, 599];
const asked = process.argv.slice(2).map(Number).filter(Number.isFinite);
const frames = asked.length ? asked : keyFrames;

await mkdir("out/stills", { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
for (const id of ["Showreel-4x5", "Showreel-1x1"]) {
  const composition = await selectComposition({ serveUrl, id });
  for (const frame of frames) {
    const output = `out/stills/${id}-${String(frame).padStart(3, "0")}.png`;
    await renderStill({ composition, serveUrl, frame, output });
    console.log(`saved ${output}`);
  }
}
