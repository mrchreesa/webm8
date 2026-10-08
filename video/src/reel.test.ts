import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { SITE_COUNT } from "./timeline.ts";
import { reelProjects, reelSlugs } from "./reel.ts";

const publicDir = new URL("../public/", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("captures/captures.json", publicDir), "utf8"));

test("the reel plays one project per site slot, none twice", () => {
  assert.equal(reelSlugs.length, SITE_COUNT);
  assert.equal(new Set(reelSlugs).size, reelSlugs.length);
});

test("every reel project exists in lib/site.ts with a name, an industry and a live host", () => {
  for (const project of reelProjects()) {
    assert.ok(project.name, `${project.slug} has no name`);
    assert.ok(project.industry, `${project.slug} has no industry`);
    assert.ok(project.host, `${project.slug} has no siteUrl`);
  }
});

test("the two clinic directions never play back to back", () => {
  const industries = reelProjects().map((project) => project.industry);
  for (let i = 1; i < industries.length; i++) assert.notEqual(industries[i], industries[i - 1]);
});

test("every reel project has a desktop and a phone capture on disk, at 2x", () => {
  for (const slug of reelSlugs) {
    for (const [view, width] of [
      ["desktop", 2560],
      ["phone", 780],
    ] as const) {
      const shot = manifest[slug]?.[view];
      assert.ok(shot, `${slug} has no ${view} capture; run npm run capture -- ${slug}`);
      assert.equal(shot.width, width);
      assert.ok(existsSync(new URL(shot.src, publicDir)), `${shot.src} is missing`);
    }
  }
});
