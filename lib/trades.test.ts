import assert from "node:assert/strict";
import { test } from "node:test";
import {
  capitalise,
  defaultTrade,
  heroTradeOrder,
  initialOf,
  isPortfolioSite,
  nextHeroTrade,
  parseTrade,
  searchSuggestions,
  tradeGroups,
  tradeList,
  trades,
} from "./trades.ts";
import { projects } from "./site.ts";

function channel(value: number) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

function contrast(a: string, b: string) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

test("there are fifteen trades with unique keys and searches", () => {
  assert.equal(tradeList.length, 15);
  assert.equal(new Set(tradeList.map((t) => t.key)).size, 15);
  assert.equal(new Set(tradeList.map((t) => t.query)).size, 15);
  for (const trade of tradeList) assert.equal(trades[trade.key], trade);
});

test("every trade has complete, non-empty content", () => {
  for (const trade of tradeList) {
    for (const text of strings(trade)) assert.ok(text.trim().length > 0, `${trade.key} has an empty string`);
    assert.equal(trade.form.fields.length, 4, `${trade.key} needs four form fields`);
    assert.equal(trade.competitors.length, 2, `${trade.key} needs two competitors`);
    assert.ok(trade.reviewCount > 0);
    assert.ok(trade.exampleName.length <= 30, `${trade.key} example name must fit the phone`);
    if (isPortfolioSite(trade.site)) continue;
    assert.equal(trade.site.services.length, 3, `${trade.key} needs three services`);
    assert.match(trade.site.phone, /^\(312\) 555-01\d{2}$/, `${trade.key} phone must be fictional`);
  }
});

test("a trade showing a real site names its project, which has a phone capture", () => {
  const shown = tradeList.filter((trade) => isPortfolioSite(trade.site));
  assert.deepEqual(shown.map((trade) => trade.key).sort(), ["cleaning", "fitness", "moving", "plumbing"]);
  for (const trade of shown) {
    const slug = isPortfolioSite(trade.site) ? trade.site.project : "";
    const project = projects.find((p) => p.slug === slug);
    assert.ok(project, `${trade.key}: no project ${slug}`);
    assert.equal(trade.exampleName, project.name, `${trade.key} must use the business's own name`);
    const shot = project.screenshots.phone;
    assert.ok(shot, `${slug} needs a phone capture`);
    assert.match(shot.top, /^#[0-9a-f]{6}$/);
    assert.ok(shot.button.y - shot.scroll > (shot.header ?? 0) + 30, `${slug}: the button must stay on screen, below the header`);
    assert.ok(shot.scroll + 900 <= (shot.height / shot.width) * 390, `${slug}: the capture must cover the scroll`);
  }
});

test("no two real sites play back to back", () => {
  heroTradeOrder.forEach((key, index) => {
    const next = heroTradeOrder[(index + 1) % heroTradeOrder.length];
    assert.ok(!(isPortfolioSite(trades[key].site) && isPortfolioSite(trades[next].site)), `${key} then ${next}`);
  });
});

test("palettes are valid and readable", () => {
  const hex = /^#[0-9a-f]{6}$/;
  for (const { key, palette } of tradeList) {
    for (const colour of [palette.primary, palette.deep, palette.accent, palette.accentInk, palette.soft, palette.ink]) {
      assert.match(colour, hex, `${key} has a bad colour ${colour}`);
    }
    assert.ok(contrast("#ffffff", palette.primary) >= 4.5, `${key}: white on primary`);
    assert.ok(contrast("#ffffff", palette.deep) >= 4.5, `${key}: white on deep`);
    assert.ok(contrast(palette.accentInk, palette.accent) >= 4.5, `${key}: accentInk on accent`);
    assert.ok(contrast(palette.ink, "#ffffff") >= 4.5, `${key}: ink on white`);
  }
});

test("every trade appears in exactly one group, in a fixed order", () => {
  assert.deepEqual(
    tradeGroups.map((g) => g.group),
    ["Home services", "Moving", "Food and hospitality", "Health, beauty and wellness", "Something else"],
  );
  const keys = tradeGroups.flatMap((g) => g.keys);
  assert.equal(keys.length, 15);
  assert.equal(new Set(keys).size, 15);
});

test("the default trade is plumbing", () => {
  assert.equal(defaultTrade, "plumbing");
  assert.ok(trades[defaultTrade]);
});

test("parseTrade accepts every key, ignoring case and surrounding spaces", () => {
  for (const trade of tradeList) assert.equal(parseTrade(trade.key), trade.key);
  assert.equal(parseTrade("HVAC"), "hvac");
  assert.equal(parseTrade(" dental "), "dental");
});

test("parseTrade rejects unknown values and object built-ins", () => {
  for (const value of [null, undefined, "", " ", "plumber", "hvac2", "toString", "__proto__", "constructor", "hasOwnProperty"]) {
    assert.equal(parseTrade(value), null, `expected null for ${String(value)}`);
  }
});

test("initials skip a leading 'The' and anything that is not a letter or number", () => {
  assert.equal(initialOf("The Stitch House"), "S");
  assert.equal(initialOf("reyes plumbing"), "R");
  assert.equal(initialOf("🔧 Fix-it Pros"), "F");
  assert.equal(initialOf("1st Choice Movers"), "1");
  assert.equal(initialOf("🔧🔧"), "W");
  assert.equal(initialOf("The"), "T");
});

test("search suggestions lead with the trade's own search and never repeat it", () => {
  for (const trade of tradeList) {
    const list = searchSuggestions(trade);
    assert.equal(list.length, 5);
    assert.equal(list[0], trade.query);
    assert.equal(new Set(list).size, 5);
  }
});

test("capitalise", () => {
  assert.equal(capitalise("plumbing business"), "Plumbing business");
  assert.equal(capitalise(""), "");
});

test("the hero plays every trade but other once, starting with the default", () => {
  assert.equal(heroTradeOrder[0], defaultTrade);
  assert.equal(heroTradeOrder.length, 14);
  assert.equal(new Set(heroTradeOrder).size, 14);
  assert.ok(!heroTradeOrder.includes("other"));
  let key = defaultTrade;
  const seen = new Set<string>();
  for (let i = 0; i < heroTradeOrder.length; i++) {
    seen.add(key);
    key = nextHeroTrade(key);
  }
  assert.equal(key, defaultTrade);
  assert.equal(seen.size, 14);
  assert.equal(nextHeroTrade("other"), heroTradeOrder[0]);
});

test("every trade has a short chip name", () => {
  for (const trade of tradeList) assert.ok(trade.short.length > 0 && trade.short.length <= 16, trade.key);
});
