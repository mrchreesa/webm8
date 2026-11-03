import assert from "node:assert/strict";
import { test } from "node:test";
import { heroScrollProgress, wallColumns, wallDemos } from "./demoWall.ts";
import { projects } from "./site.ts";

test("every demo on the wall is a real project with both screenshots", () => {
  for (const { slug } of wallDemos) {
    const project = projects.find((item) => item.slug === slug);
    assert.ok(project, `${slug} is not in projects`);
    assert.ok(project.screenshots.desktop && project.screenshots.mobile, `${slug} lacks a screenshot`);
  }
});

test("the wall shows only its own demos", () => {
  const known = new Set(wallDemos.map((demo) => demo.slug));
  for (const column of wallColumns) {
    for (const slug of column.slugs) assert.ok(known.has(slug), `${slug} is on the wall but not in wallDemos`);
  }
});

test("every demo appears on the wall as a laptop screenshot", () => {
  const shown = new Set(wallColumns.filter((column) => column.shot === "desktop").flatMap((column) => column.slugs));
  for (const { slug } of wallDemos) assert.ok(shown.has(slug), `${slug} has no desktop tile`);
});

test("no column shows the same demo twice", () => {
  for (const column of wallColumns) assert.equal(new Set(column.slugs).size, column.slugs.length);
});

test("neighbouring columns drift in opposite directions", () => {
  for (let i = 1; i < wallColumns.length; i++) assert.notEqual(wallColumns[i].drift, wallColumns[i - 1].drift);
});

test("scroll progress runs from 0 at the top of the hero to 1 once it has gone", () => {
  assert.equal(heroScrollProgress(0, 800), 0);
  assert.equal(heroScrollProgress(-400, 800), 0.5);
  assert.equal(heroScrollProgress(-800, 800), 1);
  assert.equal(heroScrollProgress(-2000, 800), 1);
  assert.equal(heroScrollProgress(120, 800), 0);
  assert.equal(heroScrollProgress(-100, 0), 0);
});
