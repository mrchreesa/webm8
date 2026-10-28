import assert from "node:assert/strict";
import { test } from "node:test";
import { projects } from "./site.ts";

test("every project has a unique slug and its own screenshots", () => {
  assert.equal(new Set(projects.map((project) => project.slug)).size, projects.length);
  for (const { slug, screenshots } of projects) {
    assert.equal(screenshots.desktop, `/work/${slug}-desktop.webp`);
    assert.equal(screenshots.mobile, `/work/${slug}-mobile.webp`);
  }
});
