import assert from "node:assert/strict";
import { test } from "node:test";
import { projects, workDeckStart } from "./site.ts";

test("the homepage deck opens on Allen Fitness, between The Stitch House and Nacre", () => {
  const index = projects.findIndex((project) => project.slug === workDeckStart);
  assert.equal(workDeckStart, "allen-fitness");
  assert.equal(projects[index - 1]?.slug, "stitch-house");
  assert.equal(projects[index + 1]?.slug, "aesthetic-nacre");
});

test("every project has a unique slug and its own screenshots", () => {
  assert.equal(new Set(projects.map((project) => project.slug)).size, projects.length);
  for (const { slug, screenshots } of projects) {
    assert.equal(screenshots.desktop, `/work/${slug}-desktop.webp`);
    assert.equal(screenshots.mobile, `/work/${slug}-mobile.webp`);
  }
});
