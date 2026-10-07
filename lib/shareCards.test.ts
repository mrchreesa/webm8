import assert from "node:assert/strict";
import { test } from "node:test";
import { shareCardNames, shareCards, shareImagePath, titleWords } from "./shareCards.ts";
import { projects } from "./site.ts";

test("titleWords sets the words between asterisks in neon", () => {
  assert.deepEqual(titleWords("See your new website *before* you pay"), [
    { word: "See", neon: false },
    { word: "your", neon: false },
    { word: "new", neon: false },
    { word: "website", neon: false },
    { word: "before", neon: true },
    { word: "you", neon: false },
    { word: "pay", neon: false },
  ]);
  assert.deepEqual(
    titleWords("Made for *local businesses.*").map((word) => word.neon),
    [false, false, true, true],
  );
});

test("every share image is served from a .jpg path, so trailingSlash never redirects it", () => {
  for (const name of shareCardNames) {
    assert.match(shareImagePath(name), /^\/og\/[a-z-]+\.jpg$/);
  }
});

test("every share card shows projects that exist, with the captures it needs", () => {
  const bySlug = new Map(projects.map((project) => [project.slug, project]));

  for (const name of shareCardNames) {
    const card = shareCards[name];
    assert.ok(card.alt.length > 0, `${name} has alt text`);

    const visual = card.visual;
    const slugs =
      visual.kind === "deck" ? visual.projects : visual.kind === "mascot" ? [] : [visual.project];
    for (const slug of slugs) {
      assert.ok(bySlug.has(slug), `${name} shows "${slug}", which is not in lib/site.ts`);
    }
    if (visual.kind === "phone") {
      assert.ok(bySlug.get(visual.project)?.screenshots.phone, `${name} needs a phone capture`);
    }
  }
});
