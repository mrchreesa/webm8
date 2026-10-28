import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { pairs, projectTitle } from "./pairs.ts";

const publicDir = new URL("../../../public/", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("captures/captures.json", publicDir), "utf8"));

test("each pair is two different projects of the same industry", async () => {
  const { projects } = await import("../../../../lib/site.ts");
  for (const [id, pair] of Object.entries(pairs)) {
    assert.notEqual(pair.a.slug, pair.b.slug, id);
    const industry = (slug: string) => projects.find((p) => p.slug === slug)?.industry;
    assert.equal(industry(pair.a.slug), industry(pair.b.slug), `${id} compares two different kinds of business`);
  }
});

test("each side is described in its own project title's words, so A and B can't be swapped", () => {
  for (const [id, pair] of Object.entries(pairs)) {
    for (const side of [pair.a, pair.b]) {
      const title = projectTitle(side.slug).toLowerCase();
      const words = side.look.toLowerCase().split(/\s+/).filter((word) => word !== "and");
      for (const word of words) assert.ok(title.includes(word), `${id}: "${word}" is not in "${title}"`);
    }
  }
});

test("each side has a phone capture to show", () => {
  for (const pair of Object.values(pairs)) {
    for (const side of [pair.a, pair.b]) {
      const shot = manifest[side.slug]?.phone;
      assert.ok(shot && existsSync(new URL(shot.src, publicDir)), `${side.slug} has no phone capture`);
    }
  }
});
