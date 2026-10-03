# Homepage Redesign ("After Hours") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the WebM8 homepage as the dark, trade-aware scroll story ("After Hours"). Switch the whole site to the neon brand. Replace the portfolio. Replace `/audit/` with a Free Personalised Website Demo request page.

**Architecture:** Content and logic that can be tested without a browser live in pure modules under `lib/`, covered by `node --test`:
- `lib/trades.ts`: the 15 trades.
- `lib/demoRequest.ts`: the demo form's validation, and handing the trade and name between pages.
- `lib/storyProgress.ts`: the scroll maths.

The homepage story is one client component. React state holds only the trade, name and chapter. A single requestAnimationFrame loop writes per-frame state as data attributes and CSS custom properties, styled by a CSS module. Every page still prerenders. No new runtime dependencies.

**Tech Stack:** Next.js 15.5 App Router, React 19, TypeScript 5.7, Tailwind CSS v4 (`@theme` tokens), CSS Modules (story only), `next/font/google` (Funnel Display + Geist), Node 22 `node --test`. Screenshots are captured once with Playwright + `sharp`, both dev-only.

**Spec:** `docs/superpowers/specs/2026-10-03-homepage-redesign-design.md`. The visual reference is `docs/superpowers/specs/2026-10-03-homepage-redesign-prototype.html`, which Task 0 copies in from `deliverables/`.

## Global Constraints

- `package.json` `dependencies` and `devDependencies` do not change. Playwright is installed only with `npm i --no-save` in Task 7.
- Every route still prerenders. Do not add `output: "export"` or new `app/api/` routes.
- The action colour is neon `#d4ff35` (`brand`), and a neon fill always carries `brand-ink` (`#071a33`) text. Neon is never text on a light ground. Links on light grounds use `link` (`#1b4a80`); on navy grounds they use `link-invert` (neon).
- Offer wording, exactly:
  - "Free Personalised Website Demo" (British spelling).
  - Long buttons: "Get my free personalised demo".
  - Header button: "Get my free demo".
- Positioning, exactly: "local businesses in the US and UK", everywhere outside `/movers/`.
- Analytics events, exactly: `home_trade_selected`, `home_story_completed`, `demo_cta_clicked`, `demo_request_email_opened`.
  - Details are trade keys, placements and the page path only.
  - Never names, emails, phones or form answers.
  - No Meta `Lead` for the demo form.
- A business name never appears in a URL. It travels in `sessionStorage` under `webm8:demo-prefill`.
- `prefers-reduced-motion: reduce` turns off the flip, buzz, nudge, tilt, float, bubbles, eye tracking and line drawing. End states show immediately.
- Tests import with explicit `.ts` extensions. `lib/` files that tests import must import their siblings as `./name.ts` and use `import type` / `type` modifiers.
- Example content stays fictional: phone numbers `(312) 555-01xx`, names from `lib/trades.ts`.
- Commit messages end with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Odd `?trade=` values.** Uppercase (`HVAC`), padded (` dental `), unknown (`plumber`), empty, or an object built-in (`toString`, `__proto__`). The page should fall back to plumbing without throwing. Pinned in Task 1 (`parseTrade` tests).
2. **Odd business names.** 31+ characters, emoji, a leading "The", names ending in "s", whitespace only. The hero should show a tidy name capped at 30 characters, a sensible initial, and a correct possessive in the closing heading. Pinned in Task 1.
3. **`sessionStorage` blocked or holding junk.** Safari private mode throws on access, and stored JSON can be corrupt or hand-edited. The demo form should simply start empty, and the homepage should never crash. Pinned in Task 2 (`readDemoPrefill`/`writeDemoPrefill` with throwing storage, `parseDemoPrefill` with junk).
4. **Scroll maths at the edges.** Progress below 0, above 1, or NaN, and a story section shorter than the viewport (scrollable height ≤ 0). The story should show a valid chapter with no `Infinity` or `NaN` in styles. Pinned in Task 3.
5. **Demo form emails.** Trailing spaces, uppercase, a missing domain dot, an address with a space. Valid addresses pass with spaces trimmed; malformed ones get a plain message. A website typed without `https://` is accepted. Pinned in Task 2.

---

## File map

New:

| File | Responsibility |
|---|---|
| `lib/trades.ts` (+ `.test.ts`) | Trade data and name helpers for the story and the demo form |
| `lib/demoRequest.ts` (+ `.test.ts`) | Demo form validation and email fields, plus prefill storage helpers |
| `lib/storyProgress.ts` (+ `.test.ts`) | Pure scroll maths for the story |
| `components/demo/DemoPrefill.tsx` | Provider and hook for the chosen trade and name; `DemoCtaButton` |
| `components/demo/DemoClosing.tsx` | Shared closing section (replaces `FinalCta`) |
| `components/forms/DemoForm.tsx` | Email-based demo request form |
| `components/ui/MascotEyes.tsx` | Mascot whose eyes follow the pointer and blink |
| `components/home/HowItWorks.tsx` | Four steps with a reading-progress line (replaces `Process`) |
| `components/home/story/*` | `StoryHero`, `TradePicker`, `SearchScreen`, `TradeSite`, `RequestForm`, `LockScreen`, `StoryBackdrop`, `StatusBar`, `TradeIcon`, `icons.tsx`, `story.module.css` |
| `components/home/WorkDeck.tsx`, `EightArms.tsx`, `Plans.tsx`, `Voices.tsx` | Remaining homepage sections |
| `app/demo/page.tsx` | Demo request page |
| `scripts/capture-portfolio.mjs` | Dev-only screenshot capture |

Deleted:
- `app/audit/`
- `components/forms/AuditForm.tsx`
- `components/home/{Hero,AuditTeaser,FinalCta,Process,Portfolio,Pricing,TrustBar,ValueCards}.tsx`
- old restaurant, car-rental and travel screenshots

---

### Task 0: Prepare the branch

**Files:**
- Create: `docs/superpowers/specs/2026-10-03-homepage-redesign-prototype.html` (copy)

- [ ] **Step 1: Branch from `main`**

```bash
git switch -c homepage-redesign
```

- [ ] **Step 2: Keep the prototype with the spec**

`deliverables/` is untracked, so copy the reference prototype next to the spec where it will be committed:

```bash
cp deliverables/homepage-design-drops/drop-b-after-hours.html docs/superpowers/specs/2026-10-03-homepage-redesign-prototype.html
```

The prototype loads `assets/...` images that are not copied. It is a reference for copy, layout and motion, and its broken images do not matter.

- [ ] **Step 3: Confirm the baseline is green**

Run: `npm test && npm run typecheck && npm run lint`
Expected: `# fail 0`, no type errors, no lint errors.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-10-03-homepage-redesign-design.md docs/superpowers/specs/2026-10-03-homepage-redesign-prototype.html docs/superpowers/plans/2026-10-03-homepage-redesign.md
git commit -m "Add the homepage redesign spec, prototype and plan

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 1: Trade data

**Files:**
- Create: `lib/trades.ts`
- Test: `lib/trades.test.ts`

**Interfaces:**
- Produces:
  - `type TradeKey`, `type TradeGroup`, `type Trade`, `type RequestField`, `type TradePalette`
  - `tradeList: readonly Trade[]`, `trades: Record<TradeKey, Trade>`, `defaultTrade: TradeKey` (`"plumbing"`)
  - `tradeGroups: { group: TradeGroup; keys: TradeKey[] }[]`
  - `parseTrade(value: string | null | undefined): TradeKey | null`
  - `BUSINESS_NAME_MAX = 30`, `cleanBusinessName(value: string): string`, `displayName(trade: Trade, typed: string): string`
  - `initialOf(name: string): string`, `possessive(name: string): string`
  - `searchSuggestions(trade: Trade): string[]`, `capitalise(text: string): string`

- [ ] **Step 1: Write the failing tests**

Create `lib/trades.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BUSINESS_NAME_MAX,
  capitalise,
  cleanBusinessName,
  defaultTrade,
  displayName,
  initialOf,
  parseTrade,
  possessive,
  searchSuggestions,
  tradeGroups,
  tradeList,
  trades,
} from "./trades.ts";

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
    assert.equal(trade.site.services.length, 3, `${trade.key} needs three services`);
    assert.equal(trade.competitors.length, 2, `${trade.key} needs two competitors`);
    assert.ok(trade.reviewCount > 0);
    assert.match(trade.site.phone, /^\(312\) 555-01\d{2}$/, `${trade.key} phone must be fictional`);
    assert.ok(trade.exampleName.length <= BUSINESS_NAME_MAX);
  }
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

test("business names are tidied and capped at 30 characters", () => {
  assert.equal(cleanBusinessName("  Reyes   Plumbing  "), "Reyes Plumbing");
  assert.equal(cleanBusinessName("A".repeat(40)).length, BUSINESS_NAME_MAX);
  assert.equal(cleanBusinessName("   "), "");
});

test("an empty business name falls back to the trade's example name", () => {
  assert.equal(displayName(trades.plumbing, ""), "Reyes Plumbing");
  assert.equal(displayName(trades.plumbing, "   "), "Reyes Plumbing");
  assert.equal(displayName(trades.plumbing, "Bella Rosa"), "Bella Rosa");
});

test("initials skip a leading 'The' and anything that is not a letter or number", () => {
  assert.equal(initialOf("The Stitch House"), "S");
  assert.equal(initialOf("reyes plumbing"), "R");
  assert.equal(initialOf("🔧 Fix-it Pros"), "F");
  assert.equal(initialOf("1st Choice Movers"), "1");
  assert.equal(initialOf("🔧🔧"), "W");
  assert.equal(initialOf("The"), "T");
});

test("possessives handle names that end in s", () => {
  assert.equal(possessive("Reyes Plumbing"), "Reyes Plumbing’s");
  assert.equal(possessive("Fade House Barbers"), "Fade House Barbers’");
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
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npm test`
Expected: FAIL, with `Cannot find module` … `trades.ts`.

- [ ] **Step 3: Write `lib/trades.ts`**

```ts
/**
 * The kinds of business the homepage story can show. Everything a visitor
 * sees change when they pick their trade comes from here: the search, the
 * example site, the request form and the request that reaches the owner.
 *
 * Every name, rating, phone number and request is an example. Phone numbers
 * stay in the fictional 555-01xx range.
 */

export type TradeKey =
  | "cleaning"
  | "hvac"
  | "plumbing"
  | "electrical"
  | "roofing"
  | "landscaping"
  | "moving"
  | "restaurant"
  | "cafe"
  | "salon"
  | "barber"
  | "medspa"
  | "dental"
  | "fitness"
  | "other";

export type TradeGroup =
  | "Home services"
  | "Moving"
  | "Food and hospitality"
  | "Health, beauty and wellness"
  | "Something else";

export type Competitor = { name: string; rating: string };

export type RequestField = { label: string; value: string };

export type TradePalette = {
  primary: string;
  deep: string;
  accent: string;
  accentInk: string;
  soft: string;
  ink: string;
  /** Headline in a serif face (restaurants). */
  serif?: boolean;
};

export type Trade = {
  key: TradeKey;
  group: TradeGroup;
  /** Reads after "Show me how it works for my …". */
  label: string;
  exampleName: string;
  /** Story chapter 1 headline. */
  need: string;
  query: string;
  category: string;
  reviewCount: number;
  competitors: [Competitor, Competitor];
  site: {
    headline: string;
    sub: string;
    cta: string;
    phone: string;
    services: [string, string, string];
  };
  form: {
    title: string;
    sub: string;
    fields: [RequestField, RequestField, RequestField, RequestField];
    button: string;
    /** Follows the business name: "Reyes Plumbing will call you back shortly." */
    done: string;
  };
  notification: { title: string; body: string };
  palette: TradePalette;
};

const field = (label: string, value: string): RequestField => ({ label, value });

export const tradeList: readonly Trade[] = [
  {
    key: "cleaning",
    group: "Home services",
    label: "cleaning business",
    exampleName: "Sparkle & Co. Cleaning",
    need: "Someone nearby needs a cleaner.",
    query: "house cleaners near me",
    category: "House cleaning service",
    reviewCount: 214,
    competitors: [{ name: "Budget Maids", rating: "3.9 (58)" }, { name: "Fresh Start Cleaning", rating: "4.2 (73)" }],
    site: { headline: "Come home to clean.", sub: "Trusted local cleaners, booked online in a minute.", cta: "Book a cleaning", phone: "(312) 555-0187", services: ["Regular cleaning", "Deep cleans", "Move-out cleans"] },
    form: { title: "Book a cleaning", sub: "Pick a time that suits you. We'll confirm by text.", fields: [field("Home size", "3 bed, 2 bath"), field("Type of clean", "Deep clean"), field("Date", "Sat, Oct 18"), field("Time", "Morning")], button: "Book my cleaning", done: "will text you to confirm." },
    notification: { title: "New booking", body: "Deep clean, 3 bed 2 bath, Saturday morning" },
    palette: { primary: "#0f766e", deep: "#0b4f4a", accent: "#c7f9e5", accentInk: "#063b36", soft: "#e3f6f1", ink: "#0b2523" },
  },
  {
    key: "hvac",
    group: "Home services",
    label: "HVAC company",
    exampleName: "Northside Heating & Air",
    need: "Someone nearby needs their AC fixed.",
    query: "ac repair near me",
    category: "HVAC contractor, open 24 hours",
    reviewCount: 167,
    competitors: [{ name: "Cool Breeze HVAC", rating: "3.7 (40)" }, { name: "Air Pros Heating", rating: "4.1 (66)" }],
    site: { headline: "Comfort, fixed today.", sub: "Same-day AC and furnace repair from licensed local techs.", cta: "Book a service call", phone: "(312) 555-0163", services: ["AC repair", "Furnace service", "New installs"] },
    form: { title: "Book a service call", sub: "Tell us what's going on and we'll send a tech.", fields: [field("What's wrong?", "AC not cooling"), field("System", "Central air"), field("When", "Today, as soon as possible"), field("ZIP code", "60614")], button: "Book my service call", done: "will call you to confirm a time." },
    notification: { title: "New service call", body: "AC not cooling, wants a tech today" },
    palette: { primary: "#2563eb", deep: "#1e3a8a", accent: "#fcd34d", accentInk: "#3b2500", soft: "#e8efff", ink: "#0c1a3d" },
  },
  {
    key: "plumbing",
    group: "Home services",
    label: "plumbing business",
    exampleName: "Reyes Plumbing",
    need: "Someone nearby needs a plumber.",
    query: "plumber near me",
    category: "Plumber, open 24 hours",
    reviewCount: 186,
    competitors: [{ name: "Drain Kings", rating: "3.8 (41)" }, { name: "Pipeline Plumbing Co.", rating: "4.0 (57)" }],
    site: { headline: "Leaks fixed. Today.", sub: "Licensed local plumbers for repairs, water heaters and drains.", cta: "Request a plumber", phone: "(312) 555-0142", services: ["Emergency repairs", "Water heaters", "Drain cleaning"] },
    form: { title: "Request a plumber", sub: "Tell us what's wrong. We'll call you back fast.", fields: [field("What's wrong?", "Leaking water heater"), field("How urgent?", "Today"), field("Neighborhood", "Lincoln Park"), field("Best time to call", "This afternoon")], button: "Send my request", done: "will call you back shortly." },
    notification: { title: "New job request", body: "Leaking water heater, today in Lincoln Park" },
    palette: { primary: "#0369a1", deep: "#0c3a5e", accent: "#7dd3fc", accentInk: "#062a40", soft: "#e3f2fb", ink: "#0a2236" },
  },
  {
    key: "electrical",
    group: "Home services",
    label: "electrical business",
    exampleName: "Brightline Electric",
    need: "Someone nearby needs an electrician.",
    query: "electrician near me",
    category: "Electrician",
    reviewCount: 129,
    competitors: [{ name: "Spark Bros Electric", rating: "3.9 (33)" }, { name: "Volt Electric Services", rating: "4.2 (48)" }],
    site: { headline: "Safe, tidy electrical work.", sub: "Licensed electricians for repairs, upgrades and new installs.", cta: "Get a free estimate", phone: "(312) 555-0151", services: ["Panel upgrades", "Lighting", "EV chargers"] },
    form: { title: "Get a free estimate", sub: "A few details and we'll get back to you today.", fields: [field("Job", "Panel upgrade"), field("Property", "House"), field("When", "Next week"), field("ZIP code", "60657")], button: "Get my estimate", done: "will call you with an estimate." },
    notification: { title: "New estimate request", body: "Panel upgrade at a house, next week" },
    palette: { primary: "#1f2937", deep: "#0b1120", accent: "#facc15", accentInk: "#1f1a00", soft: "#f3f4f6", ink: "#111827" },
  },
  {
    key: "roofing",
    group: "Home services",
    label: "roofing company",
    exampleName: "Summit Roofing",
    need: "Someone nearby needs a roofer.",
    query: "roof repair near me",
    category: "Roofing contractor",
    reviewCount: 98,
    competitors: [{ name: "Top Notch Roofing", rating: "3.6 (29)" }, { name: "Peak Roofing Co.", rating: "4.1 (52)" }],
    site: { headline: "A roof you never have to think about.", sub: "Repairs, replacements and free inspections from a local crew.", cta: "Book a free inspection", phone: "(312) 555-0176", services: ["Roof repairs", "Replacements", "Storm damage"] },
    form: { title: "Book a free inspection", sub: "We'll check your roof and tell you straight.", fields: [field("Issue", "Storm damage"), field("Roof type", "Shingle, 2 story"), field("When", "This week"), field("ZIP code", "60618")], button: "Book my inspection", done: "will call you to set a time." },
    notification: { title: "New inspection request", body: "Storm damage on a 2-story shingle roof" },
    palette: { primary: "#9a3412", deep: "#5b1d0a", accent: "#fdba74", accentInk: "#3b1506", soft: "#fbeee6", ink: "#2a1006" },
  },
  {
    key: "landscaping",
    group: "Home services",
    label: "landscaping business",
    exampleName: "Oak & Ash Landscapes",
    need: "Someone nearby wants their yard done.",
    query: "landscaping near me",
    category: "Landscaper",
    reviewCount: 141,
    competitors: [{ name: "Green Thumb Lawn", rating: "3.8 (37)" }, { name: "Yard Masters", rating: "4.0 (44)" }],
    site: { headline: "A yard worth coming home to.", sub: "Lawn care, planting and seasonal cleanups across the neighborhood.", cta: "Get a free estimate", phone: "(312) 555-0129", services: ["Lawn care", "Garden design", "Cleanups"] },
    form: { title: "Get a free estimate", sub: "Tell us about your yard and we'll come take a look.", fields: [field("Service", "Spring cleanup"), field("Yard", "Front and back"), field("Start", "Next week"), field("ZIP code", "60625")], button: "Get my estimate", done: "will call you to arrange a visit." },
    notification: { title: "New estimate request", body: "Spring cleanup, front and back yard" },
    palette: { primary: "#2f7a32", deep: "#1b4a1d", accent: "#d9f99d", accentInk: "#1a2e05", soft: "#edf6e6", ink: "#13260f" },
  },
  {
    key: "moving",
    group: "Moving",
    label: "moving company",
    exampleName: "Lakeshore Movers",
    need: "Someone nearby needs a mover.",
    query: "movers near me",
    category: "Moving company, open now",
    reviewCount: 212,
    competitors: [{ name: "Budget Van Lines", rating: "3.8 (41)" }, { name: "Quick Haul Moving", rating: "4.1 (66)" }],
    site: { headline: "Moving day, handled.", sub: "Careful, on-time local moves with a crew that treats your things like theirs.", cta: "Get a free quote", phone: "(312) 555-0198", services: ["Local moves", "Packing", "Storage"] },
    form: { title: "Get a free quote", sub: "Takes about a minute. We'll call you back.", fields: [field("Moving from", "Lincoln Park, Chicago"), field("Moving to", "Evanston, IL"), field("Moving date", "Fri, Oct 17"), field("Home size", "3 bedrooms")], button: "Get my free quote", done: "will call you back shortly." },
    notification: { title: "New quote request", body: "3-bed move, Lincoln Park to Evanston, Friday Oct 17" },
    palette: { primary: "#1f5fd6", deep: "#123a85", accent: "#fbbf24", accentInk: "#2b1d00", soft: "#e8effd", ink: "#0b1b3f" },
  },
  {
    key: "restaurant",
    group: "Food and hospitality",
    label: "restaurant",
    exampleName: "Luca's Trattoria",
    need: "Someone nearby is hungry.",
    query: "italian restaurant near me",
    category: "Italian restaurant, open now",
    reviewCount: 388,
    competitors: [{ name: "Pasta Express", rating: "3.9 (120)" }, { name: "Bella Notte", rating: "4.3 (204)" }],
    site: { headline: "Dinner the way Nonna made it.", sub: "Fresh pasta, a wood oven and a table waiting for you tonight.", cta: "Book a table", phone: "(312) 555-0171", services: ["Dinner menu", "Private dining", "Takeout"] },
    form: { title: "Book a table", sub: "We'll hold it for you and send a confirmation.", fields: [field("Party size", "4 people"), field("Date", "Sat, Oct 18"), field("Time", "7:30 pm"), field("Occasion", "Birthday")], button: "Book my table", done: "has your table. Confirmation sent." },
    notification: { title: "New reservation", body: "Table for 4, Saturday 7:30 pm, a birthday" },
    palette: { primary: "#7f1d1d", deep: "#3f0a0a", accent: "#fcd34d", accentInk: "#2b1d00", soft: "#f8ece4", ink: "#2b0d12", serif: true },
  },
  {
    key: "cafe",
    group: "Food and hospitality",
    label: "café",
    exampleName: "Corner Cup Coffee",
    need: "Someone nearby needs coffee.",
    query: "coffee near me",
    category: "Coffee shop, open now",
    reviewCount: 256,
    competitors: [{ name: "Bean Stop", rating: "4.0 (88)" }, { name: "Daily Grind Café", rating: "4.2 (131)" }],
    site: { headline: "Good coffee, right around the corner.", sub: "Order ahead and skip the line on your way in.", cta: "Order ahead", phone: "(312) 555-0114", services: ["Coffee and tea", "Breakfast", "Pastries"] },
    form: { title: "Order ahead", sub: "We'll have it ready when you walk in.", fields: [field("Order", "2 lattes, 1 croissant"), field("Pickup", "8:15 am"), field("Name", "Sam"), field("Pay", "In store")], button: "Place my order", done: "is making your order now." },
    notification: { title: "New order", body: "2 lattes and a croissant, pickup 8:15 am" },
    palette: { primary: "#6b4423", deep: "#3b2412", accent: "#fde68a", accentInk: "#2b1d00", soft: "#f6eee6", ink: "#2a190c" },
  },
  {
    key: "salon",
    group: "Health, beauty and wellness",
    label: "hair salon",
    exampleName: "Studio Nine Salon",
    need: "Someone nearby wants a new look.",
    query: "hair salon near me",
    category: "Hair salon",
    reviewCount: 302,
    competitors: [{ name: "Shear Style", rating: "4.0 (77)" }, { name: "Mane Street Salon", rating: "4.2 (95)" }],
    site: { headline: "Hair you'll want to show off.", sub: "Cuts, color and styling from a team that listens.", cta: "Book an appointment", phone: "(312) 555-0135", services: ["Cut and style", "Color", "Treatments"] },
    form: { title: "Book an appointment", sub: "Choose a service and a time that suits you.", fields: [field("Service", "Cut and color"), field("Stylist", "Any stylist"), field("Date", "Thu, Oct 16"), field("Time", "2:00 pm")], button: "Book my appointment", done: "has you booked in. See you Thursday." },
    notification: { title: "New appointment", body: "Cut and color, Thursday 2:00 pm" },
    palette: { primary: "#9d174d", deep: "#500724", accent: "#fbcfe8", accentInk: "#4a0420", soft: "#fbe9f1", ink: "#2e0716" },
  },
  {
    key: "barber",
    group: "Health, beauty and wellness",
    label: "barbershop",
    exampleName: "Fade House Barbers",
    need: "Someone nearby needs a haircut.",
    query: "barber near me",
    category: "Barber shop, open now",
    reviewCount: 274,
    competitors: [{ name: "Classic Cuts", rating: "4.0 (81)" }, { name: "Kings Barbershop", rating: "4.3 (110)" }],
    site: { headline: "Sharp cuts. No waiting.", sub: "Book your chair online and walk straight in.", cta: "Book a cut", phone: "(312) 555-0122", services: ["Haircuts", "Fades", "Beard trims"] },
    form: { title: "Book a cut", sub: "Pick your barber and your time.", fields: [field("Service", "Skin fade"), field("Barber", "Any barber"), field("Date", "Today"), field("Time", "5:30 pm")], button: "Book my cut", done: "has your chair ready at 5:30." },
    notification: { title: "New booking", body: "Skin fade, today at 5:30 pm" },
    palette: { primary: "#111827", deep: "#000000", accent: "#e5e7eb", accentInk: "#111827", soft: "#f3f4f6", ink: "#111827" },
  },
  {
    key: "medspa",
    group: "Health, beauty and wellness",
    label: "med spa",
    exampleName: "Lumen Med Spa",
    need: "Someone nearby wants to book a treatment.",
    query: "med spa near me",
    category: "Medical spa",
    reviewCount: 163,
    competitors: [{ name: "Radiance Aesthetics", rating: "4.1 (54)" }, { name: "Pure Skin Studio", rating: "4.2 (61)" }],
    site: { headline: "Look rested. Feel like you.", sub: "Facials, skin treatments and injectables from licensed providers.", cta: "Book a consultation", phone: "(312) 555-0158", services: ["Facials", "Skin treatments", "Injectables"] },
    form: { title: "Book a consultation", sub: "Your first visit starts with a free chat.", fields: [field("Treatment", "HydraFacial"), field("Date", "Fri, Oct 17"), field("Time", "11:00 am"), field("First visit?", "Yes")], button: "Book my consultation", done: "will confirm your visit by text." },
    notification: { title: "New consultation", body: "HydraFacial, Friday 11:00 am, first visit" },
    palette: { primary: "#8b5e83", deep: "#4a2c45", accent: "#f5d0c5", accentInk: "#3b1f2b", soft: "#f7eef4", ink: "#2c1a29" },
  },
  {
    key: "dental",
    group: "Health, beauty and wellness",
    label: "dental practice",
    exampleName: "Maple Family Dental",
    need: "Someone nearby needs a dentist.",
    query: "dentist near me",
    category: "Dentist, accepting new patients",
    reviewCount: 241,
    competitors: [{ name: "Smile Center", rating: "4.0 (90)" }, { name: "Bright Dental Group", rating: "4.2 (112)" }],
    site: { headline: "Gentle dentistry for the whole family.", sub: "New patients welcome. Most insurance accepted.", cta: "Book an appointment", phone: "(312) 555-0147", services: ["Checkups", "Whitening", "Emergency care"] },
    form: { title: "Book an appointment", sub: "New patients welcome. We'll confirm by email.", fields: [field("Reason", "Checkup and cleaning"), field("Patient", "New patient"), field("Date", "Tue, Oct 21"), field("Time", "9:00 am")], button: "Book my appointment", done: "will email your confirmation." },
    notification: { title: "New patient booked", body: "Checkup and cleaning, Tuesday 9:00 am" },
    palette: { primary: "#0e7490", deep: "#164e63", accent: "#a5f3fc", accentInk: "#083344", soft: "#e6f6fa", ink: "#0b2a33" },
  },
  {
    key: "fitness",
    group: "Health, beauty and wellness",
    label: "gym or fitness studio",
    exampleName: "Ironworks Fitness",
    need: "Someone nearby wants to get fit.",
    query: "gym near me",
    category: "Gym, open now",
    reviewCount: 197,
    competitors: [{ name: "FitZone 24", rating: "3.9 (76)" }, { name: "Core Strength Studio", rating: "4.3 (59)" }],
    site: { headline: "Get strong with people who care.", sub: "Small classes, real coaching and your first class free.", cta: "Book a free class", phone: "(312) 555-0119", services: ["Strength classes", "Personal training", "Open gym"] },
    form: { title: "Book a free class", sub: "Your first class is on us.", fields: [field("Class", "Intro to strength"), field("Date", "Mon, Oct 20"), field("Time", "6:30 pm"), field("Level", "Beginner")], button: "Book my free class", done: "has saved you a spot." },
    notification: { title: "New class booking", body: "Intro to strength, Monday 6:30 pm, beginner" },
    palette: { primary: "#c2410c", deep: "#431407", accent: "#fed7aa", accentInk: "#431407", soft: "#fdf0e6", ink: "#2a0e04" },
  },
  {
    key: "other",
    group: "Something else",
    label: "local business",
    exampleName: "Your Business",
    need: "Someone nearby needs what you do.",
    query: "local services near me",
    category: "Local business, open now",
    reviewCount: 150,
    competitors: [{ name: "Another Local Co.", rating: "3.9 (44)" }, { name: "Main St. Services", rating: "4.1 (51)" }],
    site: { headline: "Local, trusted and easy to reach.", sub: "Everything your customers need to choose you, in one place.", cta: "Get in touch", phone: "(312) 555-0134", services: ["Our services", "Reviews", "About us"] },
    form: { title: "Get in touch", sub: "Tell us what you need and we'll get back to you.", fields: [field("Name", "Jordan"), field("What do you need?", "A quote for next week"), field("Best time to call", "Afternoon"), field("Phone", "(312) 555-0190")], button: "Send my message", done: "will get back to you shortly." },
    notification: { title: "New enquiry", body: "Jordan wants a quote for next week" },
    palette: { primary: "#1f5fd6", deep: "#0e2f56", accent: "#d4ff35", accentInk: "#071a33", soft: "#e8effd", ink: "#0e2f56" },
  },
];

export const trades = Object.fromEntries(tradeList.map((trade) => [trade.key, trade])) as Record<TradeKey, Trade>;

export const defaultTrade: TradeKey = "plumbing";

const GROUP_ORDER: TradeGroup[] = [
  "Home services",
  "Moving",
  "Food and hospitality",
  "Health, beauty and wellness",
  "Something else",
];

export const tradeGroups = GROUP_ORDER.map((group) => ({
  group,
  keys: tradeList.filter((trade) => trade.group === group).map((trade) => trade.key),
}));

/** A trade key from a URL or storage, or null. Never matches Object built-ins. */
export function parseTrade(value: string | null | undefined): TradeKey | null {
  if (typeof value !== "string") return null;
  const key = value.trim().toLowerCase();
  return Object.hasOwn(trades, key) ? (key as TradeKey) : null;
}

export const BUSINESS_NAME_MAX = 30;

export function cleanBusinessName(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, BUSINESS_NAME_MAX).trim();
}

export function displayName(trade: Trade, typed: string): string {
  return cleanBusinessName(typed) || trade.exampleName;
}

/** The letter shown in the example site's logo mark. */
export function initialOf(name: string): string {
  const match = name.replace(/^the\s+/i, "").match(/[\p{L}\p{N}]/u);
  return match ? match[0].toUpperCase() : "W";
}

export function possessive(name: string): string {
  return /s$/i.test(name) ? `${name}’` : `${name}’s`;
}

const SUGGESTION_POOL = [
  "house cleaners near me",
  "ac repair near me",
  "hair salon near me",
  "italian restaurant near me",
  "dentist near me",
  "movers near me",
  "plumber near me",
  "barber near me",
];

/** "Searched near you today": this trade's search first, then four others. */
export function searchSuggestions(trade: Trade): string[] {
  return [trade.query, ...SUGGESTION_POOL.filter((query) => query !== trade.query).slice(0, 4)];
}

export function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `npm test`
Expected: PASS, with the 13 new tests plus the existing 21.

- [ ] **Step 5: Commit**

```bash
git add lib/trades.ts lib/trades.test.ts
git commit -m "Add the trade data behind the homepage story

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Demo request logic and prefill storage

**Files:**
- Create: `lib/demoRequest.ts`
- Test: `lib/demoRequest.test.ts`

**Interfaces:**
- Consumes: from Task 1: `parseTrade`, `trades`, `capitalise`, `cleanBusinessName`, `type TradeKey`.
- Produces:
  - `type DemoRequestInput = { business; trade; name; email; phone; area; website; goal }` (all `string`)
  - `type DemoRequestField = keyof DemoRequestInput`
  - `type DemoRequest`, `type DemoRequestResult`
  - `validateDemoRequest(input: DemoRequestInput): DemoRequestResult`
  - `demoRequestSubject(request: DemoRequest): string`
  - `demoRequestMailFields(request: DemoRequest): Record<string, string>`
  - `DEMO_PREFILL_KEY = "webm8:demo-prefill"`, `type DemoPrefill = { trade: TradeKey | null; business: string }`, `emptyDemoPrefill`
  - `parseDemoPrefill(raw: string | null | undefined): DemoPrefill`
  - `serializeDemoPrefill(prefill: DemoPrefill): string`
  - `readDemoPrefill(storage?: Pick<Storage, "getItem"> | null): DemoPrefill`
  - `writeDemoPrefill(prefill: DemoPrefill, storage?: Pick<Storage, "setItem"> | null): void`
  - `resolveDemoTrade(search: string, stored: DemoPrefill): TradeKey | null`

- [ ] **Step 1: Write the failing tests**

Create `lib/demoRequest.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEMO_PREFILL_KEY,
  demoRequestMailFields,
  demoRequestSubject,
  parseDemoPrefill,
  readDemoPrefill,
  resolveDemoTrade,
  serializeDemoPrefill,
  validateDemoRequest,
  writeDemoPrefill,
  type DemoRequestInput,
} from "./demoRequest.ts";
import { buildMailtoHref } from "./mailto.ts";

const valid: DemoRequestInput = {
  business: "  Reyes   Plumbing ",
  trade: "plumbing",
  name: " Jamie Reyes ",
  email: " Jamie@Example.co.uk ",
  phone: "",
  area: "Austin, TX",
  website: "reyesplumbing.com",
  goal: "",
};

test("a complete request is accepted and tidied", () => {
  const result = validateDemoRequest(valid);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.request.business, "Reyes Plumbing");
  assert.equal(result.request.name, "Jamie Reyes");
  assert.equal(result.request.email, "Jamie@Example.co.uk");
  assert.equal(result.request.trade, "plumbing");
  assert.equal(result.request.website, "reyesplumbing.com");
});

test("long business names are kept in full on the form", () => {
  const result = validateDemoRequest({ ...valid, business: "Northside Heating & Air Conditioning LLC" });
  assert.equal(result.ok && result.request.business, "Northside Heating & Air Conditioning LLC");
});

test("every required field reports its own message", () => {
  const result = validateDemoRequest({ business: " ", trade: "", name: "", email: "", phone: "", area: "", website: "", goal: "" });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(Object.keys(result.errors).sort(), ["area", "business", "email", "name", "trade"]);
  assert.equal(result.errors.email, "Add your email address.");
});

test("malformed emails are rejected with a plain message", () => {
  for (const email of ["name@", "name@site", "name site@example.com", "@example.com", "name@@example.com"]) {
    const result = validateDemoRequest({ ...valid, email });
    assert.equal(result.ok, false, email);
    if (!result.ok) assert.equal(result.errors.email, "Check your email address. It should look like name@example.com.");
  }
});

test("an unknown trade is rejected", () => {
  const result = validateDemoRequest({ ...valid, trade: "plumber" });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.errors.trade, "Choose the kind of business you run.");
});

test("the email draft has a clear subject and leaves out empty answers", () => {
  const result = validateDemoRequest(valid);
  assert.ok(result.ok);
  if (!result.ok) return;
  assert.equal(demoRequestSubject(result.request), "Website demo request from Reyes Plumbing");
  const fields = demoRequestMailFields(result.request);
  assert.equal(fields["Type of business"], "Plumbing business");
  assert.equal(fields.Source, "WebM8 marketing site, /demo");
  const href = buildMailtoHref("info@webm8agency.com", demoRequestSubject(result.request), fields);
  const body = new URLSearchParams(href.split("?")[1]).get("body") ?? "";
  assert.ok(body.includes("Business: Reyes Plumbing"));
  assert.ok(!body.includes("Phone:"));
  assert.ok(!body.includes("Wants more of:"));
});

test("prefill parsing survives junk", () => {
  for (const raw of [null, undefined, "", "not json", "[]", "42", "null", '{"trade":5}']) {
    assert.deepEqual(parseDemoPrefill(raw), { trade: null, business: "" }, String(raw));
  }
  assert.deepEqual(parseDemoPrefill('{"trade":"HVAC","business":"  Reyes   Plumbing "}'), { trade: "hvac", business: "Reyes Plumbing" });
  assert.deepEqual(parseDemoPrefill('{"trade":"toString","business":"x"}'), { trade: null, business: "x" });
  assert.equal(parseDemoPrefill(JSON.stringify({ trade: null, business: "A".repeat(50) })).business.length, 30);
});

test("prefill round-trips through storage", () => {
  const store = new Map<string, string>();
  const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
  writeDemoPrefill({ trade: "dental", business: "Maple Family Dental" }, storage);
  assert.ok(store.has(DEMO_PREFILL_KEY));
  assert.deepEqual(readDemoPrefill(storage), { trade: "dental", business: "Maple Family Dental" });
  assert.equal(serializeDemoPrefill({ trade: null, business: "  a  b " }), '{"trade":null,"business":"a b"}');
});

test("blocked storage never throws", () => {
  const blocked = {
    getItem: () => { throw new Error("SecurityError"); },
    setItem: () => { throw new Error("QuotaExceededError"); },
  };
  assert.deepEqual(readDemoPrefill(blocked), { trade: null, business: "" });
  assert.doesNotThrow(() => writeDemoPrefill({ trade: "hvac", business: "x" }, blocked));
  assert.deepEqual(readDemoPrefill(null), { trade: null, business: "" });
  assert.doesNotThrow(() => writeDemoPrefill({ trade: "hvac", business: "x" }, null));
});

test("a valid ?trade= wins over the stored trade", () => {
  const stored = { trade: "salon" as const, business: "" };
  assert.equal(resolveDemoTrade("?trade=dental", stored), "dental");
  assert.equal(resolveDemoTrade("?trade=nope", stored), "salon");
  assert.equal(resolveDemoTrade("", stored), "salon");
  assert.equal(resolveDemoTrade("", { trade: null, business: "" }), null);
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npm test`
Expected: FAIL, with `Cannot find module` … `demoRequest.ts`.

- [ ] **Step 3: Write `lib/demoRequest.ts`**

```ts
/**
 * The Free Personalised Website Demo request. Validation and the email draft
 * for /demo/, and the small handover that carries a visitor's trade and
 * business name from the homepage to the form (sessionStorage, never a URL).
 */

import {
  capitalise,
  cleanBusinessName,
  parseTrade,
  trades,
  type TradeKey,
} from "./trades.ts";

export type DemoRequestInput = {
  business: string;
  trade: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  website: string;
  goal: string;
};

export type DemoRequestField = keyof DemoRequestInput;

export type DemoRequest = Omit<DemoRequestInput, "trade"> & { trade: TradeKey };

export type DemoRequestResult =
  | { ok: true; request: DemoRequest }
  | { ok: false; errors: Partial<Record<DemoRequestField, string>> };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const tidy = (value: string) => value.replace(/\s+/g, " ").trim();

export function validateDemoRequest(input: DemoRequestInput): DemoRequestResult {
  const value = {
    business: tidy(input.business),
    name: tidy(input.name),
    email: input.email.trim(),
    phone: tidy(input.phone),
    area: tidy(input.area),
    website: input.website.trim(),
    goal: input.goal.trim(),
  };
  const trade = parseTrade(input.trade);
  const errors: Partial<Record<DemoRequestField, string>> = {};

  if (!value.business) errors.business = "Add your business name.";
  if (!trade) errors.trade = "Choose the kind of business you run.";
  if (!value.name) errors.name = "Add your name.";
  if (!value.email) errors.email = "Add your email address.";
  else if (!EMAIL_PATTERN.test(value.email)) errors.email = "Check your email address. It should look like name@example.com.";
  if (!value.area) errors.area = "Add your city or the area you serve.";

  if (!trade || Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, request: { ...value, trade } };
}

export function demoRequestSubject(request: DemoRequest): string {
  return `Website demo request from ${request.business}`;
}

/** Ordered fields for buildMailtoHref, which drops the empty ones. */
export function demoRequestMailFields(request: DemoRequest): Record<string, string> {
  return {
    Business: request.business,
    "Type of business": capitalise(trades[request.trade].label),
    Name: request.name,
    Email: request.email,
    Phone: request.phone,
    "City or service area": request.area,
    "Current website": request.website,
    "Wants more of": request.goal,
    Source: "WebM8 marketing site, /demo",
  };
}

export const DEMO_PREFILL_KEY = "webm8:demo-prefill";

export type DemoPrefill = { trade: TradeKey | null; business: string };

export const emptyDemoPrefill: DemoPrefill = { trade: null, business: "" };

export function parseDemoPrefill(raw: string | null | undefined): DemoPrefill {
  if (!raw) return { ...emptyDemoPrefill };
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return { ...emptyDemoPrefill };
    const record = data as Record<string, unknown>;
    return {
      trade: typeof record.trade === "string" ? parseTrade(record.trade) : null,
      business: typeof record.business === "string" ? cleanBusinessName(record.business) : "",
    };
  } catch {
    return { ...emptyDemoPrefill };
  }
}

export function serializeDemoPrefill(prefill: DemoPrefill): string {
  return JSON.stringify({ trade: prefill.trade, business: cleanBusinessName(prefill.business) });
}

function sessionStore(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readDemoPrefill(storage: Pick<Storage, "getItem"> | null = sessionStore()): DemoPrefill {
  if (!storage) return { ...emptyDemoPrefill };
  try {
    return parseDemoPrefill(storage.getItem(DEMO_PREFILL_KEY));
  } catch {
    return { ...emptyDemoPrefill };
  }
}

export function writeDemoPrefill(prefill: DemoPrefill, storage: Pick<Storage, "setItem"> | null = sessionStore()): void {
  if (!storage) return;
  try {
    storage.setItem(DEMO_PREFILL_KEY, serializeDemoPrefill(prefill));
  } catch {
    // Storage can be full or blocked (private browsing). The form then starts empty.
  }
}

/** The trade for /demo/: a valid ?trade= wins over what the homepage stored. */
export function resolveDemoTrade(search: string, stored: DemoPrefill): TradeKey | null {
  return parseTrade(new URLSearchParams(search).get("trade")) ?? stored.trade;
}
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `npm test`
Expected: PASS, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add lib/demoRequest.ts lib/demoRequest.test.ts
git commit -m "Add demo request validation and the homepage-to-form handover

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Story scroll maths

**Files:**
- Create: `lib/storyProgress.ts`
- Test: `lib/storyProgress.test.ts`

**Interfaces:**
- Produces:
  - `STORY_BOUNDS = [0, 0.1, 0.32, 0.54, 0.76, 1]`
  - `type StoryChapter = 0 | 1 | 2 | 3 | 4`, `type StoryStep = 1 | 2 | 3 | 4`
  - `clamp01(value: number): number`
  - `storyProgress(sectionTop: number, sectionHeight: number, viewportHeight: number): number`
  - `chapterAt(progress: number): StoryChapter`
  - `chapterProgress(progress: number, chapter: StoryStep): number`
  - `typedText(text: string, amount: number): string`
  - `fieldFill(chapterAmount: number, index: number): number`
  - `easeInOutCubic(t: number): number`
  - `chapterScrollTarget(sectionTopOnPage: number, sectionHeight: number, viewportHeight: number, chapter: StoryStep): number`

- [ ] **Step 1: Write the failing tests**

Create `lib/storyProgress.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chapterAt,
  chapterProgress,
  chapterScrollTarget,
  clamp01,
  easeInOutCubic,
  fieldFill,
  storyProgress,
  typedText,
} from "./storyProgress.ts";

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

test("clamp01 keeps values in range and treats NaN as zero", () => {
  assert.equal(clamp01(-2), 0);
  assert.equal(clamp01(0.4), 0.4);
  assert.equal(clamp01(7), 1);
  assert.equal(clamp01(Number.NaN), 0);
  assert.equal(clamp01(Number.POSITIVE_INFINITY), 0);
});

test("progress follows the section through the viewport", () => {
  assert.equal(storyProgress(0, 4800, 1000), 0);
  assert.equal(storyProgress(-1900, 4800, 1000), 0.5);
  assert.equal(storyProgress(-3800, 4800, 1000), 1);
  assert.equal(storyProgress(-99999, 4800, 1000), 1);
  assert.equal(storyProgress(500, 4800, 1000), 0);
});

test("a section no taller than the viewport never divides by zero", () => {
  assert.equal(storyProgress(100, 900, 900), 0);
  assert.equal(storyProgress(0, 900, 900), 0);
  assert.equal(storyProgress(-10, 800, 900), 1);
  assert.ok(Number.isFinite(storyProgress(-10, 0, 0)));
});

test("chapters change at the agreed bounds", () => {
  const cases: [number, number][] = [[0, 0], [0.0999, 0], [0.1, 1], [0.3199, 1], [0.32, 2], [0.54, 3], [0.76, 4], [1, 4], [1.5, 4], [-1, 0], [Number.NaN, 0]];
  for (const [p, chapter] of cases) assert.equal(chapterAt(p), chapter, `p=${p}`);
});

test("chapter progress runs from 0 to 1 inside its own chapter", () => {
  assert.equal(chapterProgress(0.05, 1), 0);
  close(chapterProgress(0.21, 1), 0.5);
  assert.equal(chapterProgress(0.5, 1), 1);
  assert.equal(chapterProgress(1, 4), 1);
  assert.equal(chapterProgress(Number.NaN, 2), 0);
});

test("typed text grows with the amount and never overruns", () => {
  assert.equal(typedText("plumber near me", 0), "");
  assert.equal(typedText("plumber near me", 0.5), "plumber ");
  assert.equal(typedText("plumber near me", 2), "plumber near me");
  assert.equal(typedText("plumber near me", -1), "");
});

test("form fields fill one after another", () => {
  assert.equal(fieldFill(0.06, 0), 0);
  assert.equal(fieldFill(0.2, 0), 1);
  assert.equal(fieldFill(0.2, 1), 0);
  close(fieldFill(0.29, 1), 0.5);
  assert.equal(fieldFill(1, 3), 1);
});

test("easing starts at 0, ends at 1 and is symmetric", () => {
  assert.equal(easeInOutCubic(0), 0);
  assert.equal(easeInOutCubic(1), 1);
  assert.equal(easeInOutCubic(0.5), 0.5);
  assert.equal(easeInOutCubic(-3), 0);
  assert.equal(easeInOutCubic(3), 1);
});

test("rail buttons scroll to a point well into their chapter", () => {
  assert.equal(chapterScrollTarget(800, 4800, 1000, 1), 1640);
  assert.equal(chapterScrollTarget(800, 900, 1000, 3), 800);
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npm test`
Expected: FAIL, with `Cannot find module` … `storyProgress.ts`.

- [ ] **Step 3: Write `lib/storyProgress.ts`**

```ts
/** Scroll maths for the homepage story. Pure, so it is tested without a browser. */

export const STORY_BOUNDS = [0, 0.1, 0.32, 0.54, 0.76, 1] as const;

export type StoryChapter = 0 | 1 | 2 | 3 | 4;
export type StoryStep = Exclude<StoryChapter, 0>;

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** How far through the story the reader is, from the section's on-screen top. */
export function storyProgress(sectionTop: number, sectionHeight: number, viewportHeight: number): number {
  const scrollable = sectionHeight - viewportHeight;
  if (scrollable <= 0) return sectionTop < 0 ? 1 : 0;
  return clamp01(-sectionTop / scrollable);
}

export function chapterAt(progress: number): StoryChapter {
  const p = clamp01(progress);
  let chapter = 0;
  for (let i = 1; i < STORY_BOUNDS.length - 1; i++) if (p >= STORY_BOUNDS[i]) chapter = i;
  return chapter as StoryChapter;
}

export function chapterProgress(progress: number, chapter: StoryStep): number {
  const start = STORY_BOUNDS[chapter];
  const end = STORY_BOUNDS[chapter + 1];
  return clamp01((clamp01(progress) - start) / (end - start));
}

export function typedText(text: string, amount: number): string {
  return text.slice(0, Math.round(text.length * clamp01(amount)));
}

/** Within chapter 3 the four form fields fill one after another. */
export function fieldFill(chapterAmount: number, index: number): number {
  const start = 0.06 + index * 0.16;
  return clamp01((chapterAmount - start) / 0.14);
}

export function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** The scroll position that shows a chapter well under way, for the rail buttons. */
export function chapterScrollTarget(
  sectionTopOnPage: number,
  sectionHeight: number,
  viewportHeight: number,
  chapter: StoryStep,
): number {
  const scrollable = Math.max(0, sectionHeight - viewportHeight);
  const start = STORY_BOUNDS[chapter];
  const end = STORY_BOUNDS[chapter + 1];
  return Math.round(sectionTopOnPage + scrollable * (start + (end - start) * 0.55));
}
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `npm test`
Expected: PASS, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add lib/storyProgress.ts lib/storyProgress.test.ts
git commit -m "Add the scroll maths for the homepage story

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Brand tokens, headline typeface and primitives

**Files:**
- Modify: `app/globals.css` (the `@theme` block, the base layer, the button polish section)
- Modify: `app/layout.tsx` (fonts)
- Modify: `components/ui/Button.tsx` (whole file)
- Modify: `components/ui/Eyebrow.tsx:7`, `:37`
- Modify: `components/forms/FormField.tsx:8`, `:57`, `:114`, `:170`

**Interfaces:**
- Produces:
  - Tailwind colour utilities: `brand`, `brand-hover`, `brand-ink`, `link`, `link-invert`, `electric`, `night`
  - The `font-display` utility and the `ease-brand` easing
  - The `.surface-dark` scope class
  - `Button`/`LinkButton` variants: `primary | ghost | dark | outline-invert | ghost-invert`
  - `export type LinkButtonProps`

- [ ] **Step 1: Replace the `@theme` block in `app/globals.css`**

Replace everything from `@theme {` to its closing `}` with:

```css
@theme {
  /* Grounds: warm paper against navies. */
  --color-bg: #f8f5f0;
  --color-bg-alt: #efeae1;
  --color-surface: #ffffff;
  --color-ink: #0e2f56;
  --color-ink-deep: #071a33;
  --color-ink-raised: #1b4a80;
  --color-night: #061429;
  --color-muted: #5b6b7e;
  --color-muted-invert: #9db4cd;
  --color-border: #ddd6ca;

  /* Action: neon, reserved for things that act. A neon fill always carries
     brand-ink text (about 15:1). Neon is never text on paper or white
     (about 1.1:1); on navy grounds it may be text, rules and icons. */
  --color-brand: #d4ff35;
  --color-brand-hover: #e2ff75;
  --color-brand-ink: #071a33;

  /* Links and inline actions: link on light grounds, link-invert on navy. */
  --color-link: #1b4a80;
  --color-link-invert: #d4ff35;

  /* The mascot's blue: glows, illustration and story UI. Never body text. */
  --color-electric: #2b6cfc;

  /* Retired with the orange palette. Removed in Task 5 (signal) and Task 8
     (neon), once nothing uses them. */
  --color-signal: #f4681f;
  --color-neon: #d4ff35;
  --color-neon-soft: #e2ff75;

  /* Highlight and information. */
  --color-highlight: #ffb92e;
  --color-info: #2bc4bd;
  --color-info-ink: #0a7d7a;

  /* Semantic: outcomes only. */
  --color-accent: #11823b;
  --color-error: #db2424;

  --radius-card: 1rem;
  --shadow-card: 0 1px 2px rgb(7 26 51 / 0.04),
    0 8px 24px -12px rgb(7 26 51 / 0.12);
  --shadow-card-hover: 0 24px 56px -24px rgb(7 26 51 / 0.28);
  --shadow-cta: 0 14px 40px -12px rgb(212 255 53 / 0.55);

  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo,
    Monaco, "Cascadia Code", monospace;
  --font-display: var(--font-funnel-display), var(--font-geist-sans),
    ui-sans-serif, system-ui, sans-serif;

  --tracking-display: -0.035em;
  --ease-brand: cubic-bezier(0.22, 1, 0.36, 1);
}
```

- [ ] **Step 2: Update the base layer in `app/globals.css`**

Replace these three rules inside `@layer base`:

```css
  h1,
  h2,
  h3 {
    letter-spacing: var(--tracking-display);
  }

  ::selection {
    background-color: color-mix(in srgb, var(--color-brand) 25%, transparent);
    color: var(--color-ink);
  }

  :focus-visible {
    outline: 2px solid var(--color-brand);
    outline-offset: 2px;
    border-radius: 4px;
  }
```

with:

```css
  h1,
  h2 {
    font-family: var(--font-display);
    letter-spacing: var(--tracking-display);
  }

  h3 {
    letter-spacing: -0.025em;
  }

  ::selection {
    background-color: color-mix(in srgb, var(--color-brand) 75%, transparent);
    color: var(--color-brand-ink);
  }

  /* Focus: ink on light grounds, neon inside a navy section. */
  :focus-visible {
    outline: 2px solid var(--color-ink);
    outline-offset: 2px;
    border-radius: 4px;
  }

  .surface-dark :focus-visible {
    outline-color: var(--color-brand);
  }
```

- [ ] **Step 3: Remove the shine sweep from `app/globals.css`**

Delete the `@keyframes shineSweep { … }` block, and the `.btn-shine`, `.btn-shine::after` and `.btn-shine:hover::after` rules. Keep the `.btn-arrow` rules.

- [ ] **Step 4: Load Funnel Display in `app/layout.tsx`**

Change the font import line to:

```ts
import { Caveat, DM_Sans, Funnel_Display, Geist, Geist_Mono, Manrope } from "next/font/google";
```

Add after the `geistMono` declaration:

```ts
const funnelDisplay = Funnel_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-funnel-display",
});
```

And add `${funnelDisplay.variable}` to the `<html>` `className` template string, after `${geistMono.variable}`.

- [ ] **Step 5: Replace `components/ui/Button.tsx`**

```tsx
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "dark" | "outline-invert" | "ghost-invert";
type Size = "md" | "lg";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

// Focus rings come from the global :focus-visible rule: ink on light grounds,
// neon inside a .surface-dark section.
const base = cn(
  "relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight",
  "transition-all duration-200 select-none",
  "disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-60",
);

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

const variants: Record<Variant, string> = {
  // A neon fill always carries brand-ink text.
  primary: cn(
    "bg-brand text-brand-ink",
    "btn-arrow",
    "hover:bg-brand-hover hover:-translate-y-0.5 hover:shadow-cta active:translate-y-0",
  ),
  ghost: cn(
    "border border-border bg-white text-ink",
    "hover:border-ink/25 hover:bg-ink/5",
    "btn-arrow",
  ),
  dark: "bg-white text-ink hover:bg-white/90 btn-arrow",
  "outline-invert": cn(
    "border border-white/25 bg-transparent text-white",
    "hover:bg-white/10 hover:border-white/40",
    "btn-arrow",
  ),
  "ghost-invert": cn(
    "bg-white/6 text-white ring-1 ring-inset ring-white/15",
    "hover:bg-white/10",
    "btn-arrow",
  ),
};

function classes({
  variant = "primary",
  size = "md",
  className,
}: Pick<BaseProps, "variant" | "size" | "className">) {
  return cn(base, sizes[size], variants[variant], className);
}

export type LinkButtonProps = BaseProps & {
  href: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;

export function LinkButton({
  href,
  variant,
  size,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={classes({ variant, size, className })}
      {...rest}
    >
      {children}
    </Link>
  );
}

type ButtonProps = BaseProps &
  Omit<ComponentProps<"button">, "className" | "children">;

export function Button({
  variant,
  size,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes({ variant, size, className })}
      {...rest}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 6: Point `Eyebrow`'s default tone at the link colour**

In `components/ui/Eyebrow.tsx` change `brand: "text-brand",` to `brand: "text-link",` and `tone === "brand" && "bg-brand/40",` to `tone === "brand" && "bg-link/40",`.

- [ ] **Step 7: Stop orange focus and asterisks in `components/forms/FormField.tsx`**

- Line 8: change `"focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",` to `"focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15",`.
- Lines 57, 114 and 170: change `<span className="ml-1 text-brand" aria-hidden="true">` to `<span className="ml-1 text-link" aria-hidden="true">`.

- [ ] **Step 8: Verify**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: all succeed. The build lists every route as `○ (Static)` except the existing `ƒ /api/...` routes.

Then run `npm run start` and open `http://localhost:3000/contact/`:
- the submit button is neon with dark text
- the `h1` is set in Funnel Display (DevTools → Computed → `font-family` starts with `__Funnel_Display` or `"Funnel Display"`)
- tabbing to a field shows a navy focus ring

- [ ] **Step 9: Commit**

```bash
git add app/globals.css app/layout.tsx components/ui/Button.tsx components/ui/Eyebrow.tsx components/forms/FormField.tsx
git commit -m "Switch the action colour to neon and set headlines in Funnel Display

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Move every remaining orange use to the new tokens

**Files:** each row of the table below, plus `app/globals.css` (removing `--color-signal`).

**Interfaces:**
- Consumes: from Task 4: tokens `brand`, `brand-ink`, `link`, `electric`, and the `.surface-dark` class.

Rules:
- On light grounds, text and link colour moves to `link`.
- Icon chips move to a neon fill with `brand-ink`.
- Decorative glows move to `electric`.
- Fills carry `brand-ink`.

- [ ] **Step 1: Apply every replacement**

Use exact string replacement on each line below. Line numbers are from `main` at `0ea0291`; find the string if a line has moved.

| File:line | Replace | With |
|---|---|---|
| `app/not-found.tsx:10` | `text-brand">` | `text-link">` |
| `app/contact/page.tsx:25` | `<span className="text-brand">` | `<span className="text-link">` |
| `app/contact/page.tsx:52` | `hover:text-brand"` | `hover:text-link"` |
| `app/contact/page.tsx:113` | `? "bg-brand/10 text-brand"` | `? "bg-brand text-brand-ink"` |
| `app/about/page.tsx:57` | `<span className="text-brand">make more money</span>` | `<span className="text-link">make more money</span>` |
| `app/about/page.tsx:72` | `rounded-xl bg-brand/10 text-brand">` | `rounded-xl bg-brand text-brand-ink">` |
| `app/about/page.tsx:92` | `hover:border-brand/30 hover:text-brand">` | `hover:border-ink/30 hover:text-link">` |
| `app/about/page.tsx:111` | `open:border-brand/30` | `open:border-ink/30` |
| `app/about/page.tsx:114` | `group-open:bg-brand group-open:text-white` | `group-open:bg-brand group-open:text-brand-ink` |
| `app/privacy/page.tsx:47` | `<span className="text-brand">privacy notice.</span>` | `<span className="text-link">privacy notice.</span>` |
| `app/privacy/page.tsx:68` | `className="font-semibold text-brand hover:text-brand-hover"` | `className="font-semibold text-link underline-offset-4 hover:underline"` |
| `app/pricing/page.tsx:41` | `<span className="text-brand">Quoted To The Business</span>` | `<span className="text-link">Quoted To The Business</span>` |
| `app/pricing/page.tsx:56` | `rounded-xl bg-brand/10 text-brand">` | `rounded-xl bg-brand text-brand-ink">` |
| `app/work/page.tsx:29` | `<span className="text-brand">Local Businesses</span>` | `<span className="text-link">Local Businesses</span>` |
| `app/work/page.tsx:86` | `text-sm font-semibold text-brand transition-colors hover:text-brand-hover"` | `text-sm font-semibold text-link transition-colors hover:text-ink"` |
| `app/work/page.tsx:101` | `from-brand/25 to-accent/25` | `from-electric/20 to-accent/20` |
| `components/ui/AmbientBlobs.tsx:36` | `bg-signal/25` | `bg-electric/25` |
| `components/ui/AmbientBlobs.tsx:42` | `bg-signal/20` | `bg-electric/20` |
| `components/ui/BrowserMockup.tsx:29` | `accent: "bg-[color:var(--color-signal)]",` | `accent: "bg-electric",` |
| `components/home/Testimonials.tsx:26` | `bg-gradient-to-br from-brand to-brand-hover font-mono text-sm font-bold text-white` | `bg-ink font-mono text-sm font-bold text-white` |
| `components/home/IncludedVisuals.tsx:100` | `rounded-xl bg-bg text-brand">` | `rounded-xl bg-bg text-link">` |
| `components/home/WhatYouGet.tsx:25` | `accent: "text-brand",` | `accent: "text-link",` |
| `components/home/WhatYouGet.tsx:26` | `check: "bg-brand/10 text-brand ring-brand/10",` | `check: "bg-ink/5 text-link ring-ink/10",` |
| `components/forms/MoverReviewForm.tsx:232` | `<span className="ml-1 text-brand" aria-hidden="true">` | `<span className="ml-1 text-link" aria-hidden="true">` |
| `components/forms/MoverReviewForm.tsx:246` | `rounded border-border text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"` | `rounded border-border accent-ink"` |
| `components/forms/MoverReviewForm.tsx:305` | `className="font-medium text-brand underline hover:text-brand-hover"` | `className="font-medium text-link underline hover:text-ink"` |
| `components/layout/Header.tsx:104` | `bg-neon px-1.5 py-1` | `bg-brand px-1.5 py-1` |
| `components/layout/Header.tsx:144` | `: "text-ink hover:text-brand",` | `: "text-ink hover:text-link",` |
| `components/layout/Header.tsx:189` | `? "bg-brand/10 text-brand"` | `? "bg-ink/5 text-ink"` |
| `components/layout/Footer.tsx:53` | `className="transition-colors hover:text-brand"` | `className="transition-colors hover:text-link"` |
| `components/layout/Footer.tsx:93` | `className="text-muted transition-colors hover:text-brand"` | `className="text-muted transition-colors hover:text-link"` |
| `components/movers/MoverFaq.tsx:71` | `bg-ink/5 text-lg text-brand transition-transform` | `bg-ink/5 text-lg text-link transition-transform` |
| `components/movers/MoverDemo.tsx:67` | `<span className="text-sm font-bold text-brand tabular-nums">` | `<span className="text-sm font-bold text-link tabular-nums">` |
| `components/movers/MoverDemo.tsx:106` | `<div className="relative overflow-hidden rounded-[2rem] bg-ink-deep` | `<div className="surface-dark relative overflow-hidden rounded-[2rem] bg-ink-deep` |
| `components/movers/MoverDemo.tsx:112` | `rounded-full bg-brand/20 blur-3xl"` | `rounded-full bg-electric/25 blur-3xl"` |
| `components/movers/MoverDemo.tsx:145` | `rounded-xl bg-brand text-white shadow-cta">` | `rounded-xl bg-brand text-brand-ink shadow-cta">` |
| `components/movers/MoverDemo.tsx:164` | `<span className="h-2 w-2 rounded-full bg-brand" />` | `<span className="h-2 w-2 rounded-full bg-ink" />` |
| `components/movers/MoverDemo.tsx:165` | `border-dashed border-brand/40" />` | `border-dashed border-ink/30" />` |
| `components/movers/MoverDemo.tsx:166` | `<Icon name="arrow" size={15} className="text-brand" />` | `<Icon name="arrow" size={15} className="text-ink" />` |
| `components/movers/ReviewExpectations.tsx:26` | `<div className="relative overflow-hidden rounded-[2rem] bg-ink-deep` | `<div className="surface-dark relative overflow-hidden rounded-[2rem] bg-ink-deep` |
| `components/movers/ReviewExpectations.tsx:32` | `rounded-full bg-brand/15 blur-3xl"` | `rounded-full bg-electric/25 blur-3xl"` |
| `components/movers/StickyMoverCta.tsx:74` | `bg-brand px-5 text-sm font-bold text-white shadow-cta"` | `bg-brand px-5 text-sm font-bold text-brand-ink shadow-cta"` |
| `components/movers/MoverBenefits.tsx:37` | `rounded-xl bg-brand/10 text-brand">` | `rounded-xl bg-brand text-brand-ink">` |
| `components/movers/MoverHero.tsx:14` | `<section className="relative -mt-16 flex` | `<section className="surface-dark relative -mt-16 flex` |
| `components/movers/MoverHero.tsx:96` | `className="absolute -bottom-1 left-0 h-3 w-full text-signal"` | `className="absolute -bottom-1 left-0 h-3 w-full text-brand"` |
| `components/movers/MoverProof.tsx:24` | `rounded-full bg-brand/10 text-2xl font-bold text-brand"` | `rounded-full bg-brand text-2xl font-bold text-brand-ink"` |
| `components/movers/MoverProof.tsx:55` | `className="text-brand underline underline-offset-4 hover:text-brand-hover"` | `className="text-link underline underline-offset-4 hover:text-ink"` |
| `components/movers/ReviewFormSection.tsx:32` | `rounded-full bg-brand/10 text-xs font-bold text-brand tabular-nums">` | `rounded-full bg-brand text-xs font-bold text-brand-ink tabular-nums">` |
| `components/movers/ReviewFormSection.tsx:48` | `className="font-semibold text-brand underline underline-offset-4 hover:text-brand-hover"` | `className="font-semibold text-link underline underline-offset-4 hover:text-ink"` |
| `components/movers/MoverPricing.tsx:180` | `"peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand",` | `"peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink",` |

- [ ] **Step 2: Remove `--color-signal`**

In `app/globals.css` `@theme`, delete the line `--color-signal: #f4681f;`. Then update the comment above `--color-neon` to read: `/* Retired with the orange palette. Removed in Task 8, once FinalCta is gone. */`

- [ ] **Step 3: Check that nothing orange is left outside files later tasks delete**

Run:
```bash
grep -rnE 'text-brand([^-]|$)|text-brand-hover|bg-brand/|border-brand|ring-brand|from-brand|to-brand|text-signal|bg-signal|color-signal|bg-neon|outline-brand' app components
```
Expected: matches only in these files, which later tasks delete or rewrite:
- `app/audit/page.tsx`
- `components/forms/AuditForm.tsx`
- `components/home/AuditTeaser.tsx`, `FinalCta.tsx`, `Hero.tsx`, `Portfolio.tsx`, `Pricing.tsx`, `Process.tsx`

Fix any other match the same way.

- [ ] **Step 4: Verify**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: success.

Then run `npm run start` and look at `/movers/`, `/about/`, `/pricing/`, `/contact/` and `/privacy/`. Expected:
- no orange anywhere on these pages
- every neon fill has dark text
- links are navy

- [ ] **Step 5: Commit**

```bash
git add -A app components
git commit -m "Move every remaining orange use to the neon brand tokens

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: The demo request page, its prefill, and retiring /audit/

**Files:**
- Create: `components/demo/DemoPrefill.tsx`, `components/forms/DemoForm.tsx`, `app/demo/page.tsx`
- Modify: `components/forms/FormField.tsx` (`SelectField`), `lib/site.ts` (`primaryNav`, new `demoSteps`), `lib/seo.ts` (`indexableRoutes`), `next.config.ts`, `components/layout/Header.tsx`, `components/layout/Footer.tsx`
- Delete: `app/audit/page.tsx`, `components/forms/AuditForm.tsx`

**Interfaces:**
- Consumes:
  - from Task 1: `tradeGroups`, `trades`, `capitalise`, `parseTrade`, `defaultTrade`, `TradeKey`
  - from Task 2: `validateDemoRequest`, `demoRequestSubject`, `demoRequestMailFields`, `readDemoPrefill`, `writeDemoPrefill`, `resolveDemoTrade`, `DemoRequestField`, `DemoRequestInput`
  - from Task 4: `LinkButton`, `LinkButtonProps`
- Produces:
  - `DemoPrefillProvider`
  - `useDemoPrefill(): DemoPrefillValue | null`
  - `type DemoPrefillValue = { tradeKey: TradeKey; business: string; chosen: boolean; selectTrade(key: TradeKey): void; setBusiness(value: string): void }`
  - `demoHref(prefill): string`
  - `DemoCtaButton({ placement: "header" | "hero" | "story_end" | "closing", ...LinkButtonProps minus href })`
  - `demoSteps: { title: string; body: string }[]`

- [ ] **Step 1: Let `SelectField` show groups, a placeholder and an error**

Replace the `SelectField` function in `components/forms/FormField.tsx` with:

```tsx
type SelectOption = { label: string; value: string };

export function SelectField({
  label,
  name,
  options = [],
  groups,
  required,
  defaultValue,
  wide,
  error,
  placeholder,
}: {
  label: string;
  name: string;
  options?: SelectOption[];
  groups?: { label: string; options: SelectOption[] }[];
  required?: boolean;
  defaultValue?: string;
  wide?: boolean;
  error?: string;
  /** Shown as a disabled first option until something is chosen. */
  placeholder?: string;
}) {
  const id = useId();
  const messageId = `${id}-message`;

  return (
    <div className={cn("flex flex-col gap-1.5", wide && "sm:col-span-2")}>
      <label htmlFor={id} className={labelCls}>
        {label}
        {required && (
          <span className="ml-1 text-link" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue ?? (placeholder ? "" : undefined)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? messageId : undefined}
        className={cn(fieldBase, error && "border-error focus:border-error")}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {groups?.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {error && (
        <p id={messageId} className="text-xs leading-relaxed text-error">
          {error}
        </p>
      )}
    </div>
  );
}
```

`ContactForm` keeps working unchanged: it passes only `options`.

- [ ] **Step 2: Create `components/demo/DemoPrefill.tsx`**

```tsx
"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { LinkButton, type LinkButtonProps } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import { readDemoPrefill, writeDemoPrefill } from "@/lib/demoRequest";
import { defaultTrade, parseTrade, type TradeKey } from "@/lib/trades";

export type DemoPrefillValue = {
  tradeKey: TradeKey;
  business: string;
  /** True once the visitor picked a trade, or arrived with ?trade=. */
  chosen: boolean;
  selectTrade: (key: TradeKey) => void;
  setBusiness: (value: string) => void;
};

const DemoPrefillContext = createContext<DemoPrefillValue | null>(null);

/**
 * Shares the trade and business name a visitor picks on the homepage with the
 * rest of the page and with /demo/. The name is kept in sessionStorage and
 * never goes in a URL, because analytics records page URLs.
 */
export function DemoPrefillProvider({ children }: { children: ReactNode }) {
  const [tradeKey, setTradeKey] = useState<TradeKey>(defaultTrade);
  const [chosen, setChosen] = useState(false);
  const [business, setBusinessState] = useState("");

  useEffect(() => {
    const fromUrl = parseTrade(new URLSearchParams(window.location.search).get("trade"));
    const stored = readDemoPrefill();
    const trade = fromUrl ?? stored.trade;
    if (trade) {
      setTradeKey(trade);
      setChosen(true);
    }
    if (stored.business) setBusinessState(stored.business);
    if (fromUrl) trackEvent("home_trade_selected", { trade: fromUrl, source: "url" });
  }, []);

  useEffect(() => {
    if (chosen || business) writeDemoPrefill({ trade: chosen ? tradeKey : null, business });
  }, [chosen, tradeKey, business]);

  const selectTrade = useCallback((key: TradeKey) => {
    setTradeKey(key);
    setChosen(true);
    trackEvent("home_trade_selected", { trade: key, source: "picker" });
  }, []);

  const value = useMemo<DemoPrefillValue>(
    () => ({ tradeKey, business, chosen, selectTrade, setBusiness: setBusinessState }),
    [tradeKey, business, chosen, selectTrade],
  );

  return <DemoPrefillContext.Provider value={value}>{children}</DemoPrefillContext.Provider>;
}

/** The homepage's choice, or null outside the homepage. */
export function useDemoPrefill(): DemoPrefillValue | null {
  return useContext(DemoPrefillContext);
}

export function demoHref(prefill: Pick<DemoPrefillValue, "tradeKey" | "chosen"> | null): string {
  return prefill?.chosen ? `/demo/?trade=${prefill.tradeKey}` : "/demo/";
}

export type DemoCtaPlacement = "header" | "hero" | "story_end" | "closing";

type DemoCtaButtonProps = Omit<LinkButtonProps, "href"> & { placement: DemoCtaPlacement };

export function DemoCtaButton({ placement, onClick, children, ...props }: DemoCtaButtonProps) {
  const prefill = useDemoPrefill();
  const pathname = usePathname();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    trackEvent("demo_cta_clicked", {
      placement,
      page: pathname ?? "/",
      trade: prefill?.chosen ? prefill.tradeKey : undefined,
    });
  }

  return (
    <LinkButton href={demoHref(prefill)} onClick={handleClick} {...props}>
      {children}
    </LinkButton>
  );
}
```

- [ ] **Step 3: Add `demoSteps` and the nav label in `lib/site.ts`**

In `primaryNav`, change `{ label: "Free Review", href: "/audit" },` to `{ label: "Free Demo", href: "/demo" },`.

Add after the `processSteps` export:

```ts
export type DemoStep = { title: string; body: string };

/** What the Free Personalised Website Demo involves, on /demo/ and in DemoClosing. */
export const demoSteps: DemoStep[] = [
  {
    title: "Tell us about your business",
    body: "Your trade, your area and what you want more of. It takes about two minutes.",
  },
  {
    title: "We design your homepage",
    body: "With your name, your services and your area on it.",
  },
  {
    title: "We show it to you",
    body: "On a short video call, at a time that suits you.",
  },
];
```

- [ ] **Step 4: Create `components/forms/DemoForm.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  FormStatus,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/forms/FormField";
import { trackEvent } from "@/lib/analytics";
import {
  demoRequestMailFields,
  demoRequestSubject,
  readDemoPrefill,
  resolveDemoTrade,
  validateDemoRequest,
  type DemoRequestField,
  type DemoRequestInput,
} from "@/lib/demoRequest";
import { buildMailtoHref } from "@/lib/mailto";
import { intakeEmail } from "@/lib/site";
import { capitalise, tradeGroups, trades } from "@/lib/trades";

const tradeOptionGroups = tradeGroups.map(({ group, keys }) => ({
  label: group,
  options: keys.map((key) => ({ value: key, label: capitalise(trades[key].label) })),
}));

const FIELDS: DemoRequestField[] = ["business", "trade", "name", "email", "phone", "area", "website", "goal"];

type Prefill = { trade: string; business: string };

export function DemoForm() {
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const [errors, setErrors] = useState<Partial<Record<DemoRequestField, string>>>({});
  const [opened, setOpened] = useState(false);

  // Read after hydration: the page is static, and only the browser knows
  // what the visitor picked on the homepage.
  useEffect(() => {
    const stored = readDemoPrefill();
    setPrefill({
      trade: resolveDemoTrade(window.location.search, stored) ?? "",
      business: stored.business,
    });
  }, []);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input = Object.fromEntries(
      FIELDS.map((field) => [field, String(data.get(field) ?? "")]),
    ) as DemoRequestInput;

    const result = validateDemoRequest(input);
    if (!result.ok) {
      setErrors(result.errors);
      setOpened(false);
      const first = FIELDS.find((field) => result.errors[field]);
      if (first) event.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setErrors({});
    setOpened(true);
    trackEvent("demo_request_email_opened", { trade: result.request.trade });
    window.location.href = buildMailtoHref(
      intakeEmail,
      demoRequestSubject(result.request),
      demoRequestMailFields(result.request),
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      // Remount once the stored prefill is known, so defaultValue applies.
      key={prefill ? "prefilled" : "initial"}
      onSubmit={onSubmit}
      noValidate
      className="shadow-card rounded-3xl border border-border bg-white p-6 md:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Business name" name="business" required autoComplete="organization" placeholder="Reyes Plumbing" defaultValue={prefill?.business} error={errors.business} />
        <SelectField label="Type of business" name="trade" required groups={tradeOptionGroups} placeholder="Choose one" defaultValue={prefill?.trade ?? ""} error={errors.trade} />
        <TextField label="Your name" name="name" required autoComplete="name" placeholder="Jamie Smith" error={errors.name} />
        <TextField label="Email" name="email" type="email" inputMode="email" required autoComplete="email" placeholder="you@example.com" error={errors.email} />
        <TextField label="Phone (optional)" name="phone" type="tel" autoComplete="tel" placeholder="Best number to reach you" />
        <TextField label="City or service area" name="area" required placeholder="Austin, TX or West London" error={errors.area} />
        <TextField label="Current website (optional)" name="website" type="url" inputMode="url" placeholder="yourbusiness.com" wide />
        <TextAreaField label="What do you want more of? (optional)" name="goal" rows={3} placeholder="Calls, bookings, quote requests…" />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Button type="submit" size="lg" className="w-full sm:w-fit">
          Get my free personalised demo
        </Button>
        {opened ? (
          <FormStatus tone="success">
            Your email app should open with your request filled in. Press send and we&apos;ll reply within one business day. No email app? Write to{" "}
            <a className="font-semibold underline" href={`mailto:${intakeEmail}`}>
              {intakeEmail}
            </a>
            .
          </FormStatus>
        ) : hasErrors ? (
          <FormStatus tone="error">Check the highlighted fields.</FormStatus>
        ) : null}
      </div>
    </form>
  );
}
```

- [ ] **Step 5: Create `app/demo/page.tsx`**

```tsx
import type { Metadata } from "next";
import { DemoForm } from "@/components/forms/DemoForm";
import { PageHero } from "@/components/ui/PageHero";
import { createPageMetadata } from "@/lib/seo";
import { demoSteps } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Free Personalised Website Demo",
  description:
    "Tell us about your business and we'll design a homepage for you, with your name and services on it, and show it to you on a short call. Free, no obligation.",
  path: "/demo/",
});

export default function DemoPage() {
  return (
    <>
      <PageHero
        title="Your free personalised website demo"
        subtitle="Tell us about your business and we'll design a homepage for you, with your name and services on it, then show it to you on a short video call. Free, with no obligation."
      />

      <section className="py-16 md:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold text-ink md:text-4xl">How it works</h2>
            <ol className="mt-8 grid gap-4">
              {demoSteps.map((step, index) => (
                <li key={step.title} className="flex gap-4 rounded-2xl border border-border bg-white p-5">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand font-mono text-sm font-semibold text-brand-ink">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-muted">
              No payment. No obligation. We reply within one business day.
            </p>
          </div>
          <DemoForm />
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 6: Redirect /audit/ permanently in `next.config.ts`**

Replace the `nextConfig` object with:

```ts
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  trailingSlash: true,
  // The free website review became the Free Personalised Website Demo.
  async redirects() {
    return [
      { source: "/audit", destination: "/demo/", permanent: true },
      { source: "/audit/", destination: "/demo/", permanent: true },
    ];
  },
};
```

- [ ] **Step 7: Swap the /audit/ route for /demo/ in `lib/seo.ts`**

Replace the `indexableRoutes` entry whose `path` is `"/audit/"` with:

```ts
  {
    path: "/demo/",
    title: "Free Personalised Website Demo",
    description:
      "Tell us about your business and we'll design a homepage for you, with your name and services on it, and show it to you on a short call. Free, no obligation.",
    priority: 0.9,
  },
```

- [ ] **Step 8: Point the header button at the demo**

In `components/layout/Header.tsx`:

1. Add the import `import { DemoCtaButton } from "@/components/demo/DemoPrefill";`.
2. Delete these two lines:
   ```tsx
     const ctaHref = isMoversPage ? "#review-request" : "/audit";
     const ctaLabel = isMoversPage ? "Book my free review" : "Get a Free Review";
   ```
3. Replace the desktop button
   ```tsx
             <LinkButton href={ctaHref} size="md">
               {ctaLabel}
             </LinkButton>
   ```
   with
   ```tsx
             {isMoversPage ? (
               <LinkButton href="#review-request" size="md">
                 Book my free review
               </LinkButton>
             ) : (
               <DemoCtaButton placement="header" size="md">
                 Get my free demo
               </DemoCtaButton>
             )}
   ```
4. Replace the mobile drawer button
   ```tsx
             <LinkButton
               href={ctaHref}
               size="lg"
               className="mt-3 justify-center"
               onClick={() => setOpen(false)}
             >
               {ctaLabel}
             </LinkButton>
   ```
   with
   ```tsx
             {isMoversPage ? (
               <LinkButton
                 href="#review-request"
                 size="lg"
                 className="mt-3 justify-center"
                 onClick={() => setOpen(false)}
               >
                 Book my free review
               </LinkButton>
             ) : (
               <DemoCtaButton
                 placement="header"
                 size="lg"
                 className="mt-3 justify-center"
                 onClick={() => setOpen(false)}
               >
                 Get my free demo
               </DemoCtaButton>
             )}
   ```

- [ ] **Step 9: Update the footer links**

In `components/layout/Footer.tsx`:
- In the "Site" column, replace `{ label: "Free Review", href: "/audit" },` with `{ label: "Free Demo", href: "/demo/" },`.
- In the "Company" column, replace `{ label: "Free Website Review", href: "/audit" },` with `{ label: "Pricing", href: "/pricing/" },`.

- [ ] **Step 10: Delete the audit page and form**

```bash
git rm -r app/audit components/forms/AuditForm.tsx
grep -rn "AuditForm\|/audit" app components lib
```
Expected: matches only in `components/home/AuditTeaser.tsx`, `FinalCta.tsx`, `Hero.tsx` (deleted in Tasks 8–10) and `app/work/page.tsx` (rewritten in Task 7). Every remaining `/audit` link still works through the redirect.

- [ ] **Step 11: Verify**

Run: `npm run typecheck && npm run lint && npm test && npm run build && npm run start`

Then, in another shell:
```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/audit
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/audit/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/demo/
```
Expected: `308 http://localhost:3000/demo/` twice, then `200`. A first hop to `/audit/` before `/demo/` is acceptable, as long as the final destination is `/demo/`.

In the browser at `/demo/`:
- Submitting the empty form shows "Check the highlighted fields.", with messages under business, type, name, email and area, and focus moves to "Business name".
- Running `sessionStorage.setItem("webm8:demo-prefill", JSON.stringify({ trade: "dental", business: "Maple Family Dental" }))` in the console and reloading prefills both fields.
- Opening `/demo/?trade=hvac` selects "HVAC company".
- The header button reads "Get my free demo" and goes to `/demo/`.

- [ ] **Step 12: Commit**

```bash
git add -A app components lib next.config.ts
git commit -m "Replace the free website review with the Free Personalised Website Demo page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Replace the portfolio

**Files:**
- Create: `scripts/capture-portfolio.mjs`
- Create: `public/work/{stitch-house,allen-fitness,ideal-baby,solvers-cleaning}-{desktop,mobile}.webp`
- Delete: `public/work/{restaurant,car-rental,travel}-{desktop,mobile}.webp`
- Modify: `lib/site.ts` (`Project`, `projects`), `app/work/page.tsx` (whole file), `lib/seo.ts` (the `/work/` route)

**Interfaces:**
- Produces: `Project` with `name: string` and `siteUrl?: string`. `projects` is ordered stitch-house, allen-fitness, ideal-baby, solvers-cleaning, removals, cleaning.

- [ ] **Step 1: Write `scripts/capture-portfolio.mjs`**

```js
// Captures the portfolio screenshots in public/work/. Dev-only, run by hand.
//
//   npm i --no-save playwright && npx playwright install chromium
//   node scripts/capture-portfolio.mjs                 # every target
//   node scripts/capture-portfolio.mjs stitch-house    # just one
//
// The recruitment site is behind Vercel's login, so it is only captured when
// RECRUITMENT_URL (a Vercel share link) is set. Never commit that link.

import { chromium } from "playwright";
import sharp from "sharp";

const targets = [
  { slug: "stitch-house", url: "https://stitch-shop-one.vercel.app/heritage/", hide: [".compare-pill"] },
  { slug: "allen-fitness", url: "https://sports-ecom-nu.vercel.app/", hide: [".concept-switcher"] },
  { slug: "ideal-baby", url: "https://baby-shop-blue-ten.vercel.app/pop/", hide: [] },
  { slug: "solvers-cleaning", url: "https://sovlers-cleaning.vercel.app/demo-b/", hide: [] },
  ...(process.env.RECRUITMENT_URL ? [{ slug: "recruitment", url: process.env.RECRUITMENT_URL, hide: [] }] : []),
];

const views = [
  { name: "desktop", width: 1600, height: 900 },
  { name: "mobile", width: 420, height: 900 },
];

const only = new Set(process.argv.slice(2));
const browser = await chromium.launch();

for (const target of targets.filter((t) => only.size === 0 || only.has(t.slug))) {
  for (const view of views) {
    const page = await browser.newPage({
      viewport: { width: view.width, height: view.height },
      deviceScaleFactor: 1,
      isMobile: view.name === "mobile",
      hasTouch: view.name === "mobile",
    });
    await page.goto(target.url, { waitUntil: "networkidle", timeout: 60_000 });
    if (target.hide.length) {
      await page.addStyleTag({ content: `${target.hide.join(",")}{display:none!important}` });
    }
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2500); // let entrance animations settle
    const png = await page.screenshot({ type: "png" });
    const file = `public/work/${target.slug}-${view.name}.webp`;
    await sharp(png).webp({ quality: 80 }).toFile(file);
    console.log(`saved ${file}`);
    await page.close();
  }
}

await browser.close();
```

- [ ] **Step 2: Capture the screenshots**

```bash
npm i --no-save playwright && npx playwright install chromium
node scripts/capture-portfolio.mjs
git status --short package.json package-lock.json
```
Expected:
- eight `saved public/work/...webp` lines
- `git status` shows no change to `package.json` or `package-lock.json`. If the lockfile changed, run `git checkout package-lock.json`.

Open each image and confirm it shows the site's hero, with no "Design preview" bar on Allen Fitness and no "Compare designs" pill on The Stitch House.

- [ ] **Step 3: Delete the old screenshots**

```bash
git rm public/work/restaurant-desktop.webp public/work/restaurant-mobile.webp public/work/car-rental-desktop.webp public/work/car-rental-mobile.webp public/work/travel-desktop.webp public/work/travel-mobile.webp
```

- [ ] **Step 4: Replace `Project` and `projects` in `lib/site.ts`**

```ts
export type Project = {
  slug: string;
  /** The business name, shown on the homepage deck's buttons. */
  name: string;
  industry: string;
  title: string;
  description: string;
  palette: "blue" | "green" | "slate" | "amber" | "rose" | "violet";
  /** The live demo. Omitted when the owner chose not to link it. */
  siteUrl?: string;
  screenshots: {
    desktop: string;
    mobile: string;
  };
  outcomes: string[];
};

/** Demo sites WebM8 designed for local businesses. */
export const projects: Project[] = [
  {
    slug: "stitch-house",
    name: "The Stitch House",
    industry: "Tailoring and dry cleaning",
    title: "Heritage tailoring site built around fittings",
    description:
      "A couture alterations and dry cleaning shop in Kentish Town, with fittings one tap away, prices up front and a shopfront feel online.",
    palette: "amber",
    siteUrl: "https://stitch-shop-one.vercel.app/heritage/",
    screenshots: {
      desktop: "/work/stitch-house-desktop.webp",
      mobile: "/work/stitch-house-mobile.webp",
    },
    outcomes: [
      "Book a fitting from any page",
      "A clear price list",
      "Opening hours and location up front",
      "Google reviews where people decide",
    ],
  },
  {
    slug: "allen-fitness",
    name: "Allen Fitness",
    industry: "Activewear brand",
    title: "High-energy activewear store",
    description:
      "An activewear brand site with a bold look, collections for women and men, and a clear path from browsing to the right fit.",
    palette: "green",
    siteUrl: "https://sports-ecom-nu.vercel.app/",
    screenshots: {
      desktop: "/work/allen-fitness-desktop.webp",
      mobile: "/work/allen-fitness-mobile.webp",
    },
    outcomes: [
      "A bold, high-energy brand look",
      "Collections for women and men",
      "A clear path to the right fit",
      "Built for phones first",
    ],
  },
  {
    slug: "ideal-baby",
    name: "Ideal Baby & Kids",
    industry: "Baby and kids store",
    title: "Family-run baby store, online and in Little Havana",
    description:
      "Strollers, car seats and nursery furniture from brands parents trust, on a bilingual site that brings families into the Miami store.",
    palette: "blue",
    siteUrl: "https://baby-shop-blue-ten.vercel.app/pop/",
    screenshots: {
      desktop: "/work/ideal-baby-desktop.webp",
      mobile: "/work/ideal-baby-mobile.webp",
    },
    outcomes: [
      "English and Spanish",
      "Shop by category",
      "Planning a store visit",
      "Trusted brands up front",
    ],
  },
  {
    slug: "solvers-cleaning",
    name: "Solvers Cleaning",
    industry: "Rental and office cleaning",
    title: "Cleaning company site built for fast quotes",
    description:
      "End of tenancy, deep, carpet and office cleaning across West London, Surrey and Berkshire, with prices up front and a free quote a tap away.",
    palette: "blue",
    siteUrl: "https://sovlers-cleaning.vercel.app/demo-b/",
    screenshots: {
      desktop: "/work/solvers-cleaning-desktop.webp",
      mobile: "/work/solvers-cleaning-mobile.webp",
    },
    outcomes: [
      "Free quote and WhatsApp buttons",
      "Prices up front",
      "How booking works, step by step",
      "Every area covered on one page",
    ],
  },
  {
    slug: "removals",
    name: "Fantastic Moves",
    industry: "Removals",
    title: "Removals site designed for urgent quote enquiries",
    description:
      "A clear removals website that explains the services, makes quotes easy, and gives customers reasons to trust the company.",
    palette: "slate",
    siteUrl: "https://removals.webm8agency.com/",
    screenshots: {
      desktop: "/work/removals-desktop.webp",
      mobile: "/work/removals-mobile.webp",
    },
    outcomes: [
      "Fast quote positioning",
      "Service-area clarity",
      "Moving day reassurance",
      "Call buttons that are easy to find",
    ],
  },
  {
    slug: "cleaning",
    name: "Fresh & Clean",
    industry: "Home cleaning",
    title: "Fresh cleaning site built around quote requests",
    description:
      "A clean service website that makes packages easy to compare, builds trust fast, and keeps the quote journey clear on mobile.",
    palette: "green",
    siteUrl: "https://cleaning.webm8agency.com/",
    screenshots: {
      desktop: "/work/cleaning-desktop.webp",
      mobile: "/work/cleaning-mobile.webp",
    },
    outcomes: [
      "A simple path to request a quote",
      "Clear cleaning packages",
      "Trust and review sections",
      "Fast mobile enquiry path",
    ],
  },
];
```

- [ ] **Step 5: Replace `app/work/page.tsx`**

```tsx
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { BrowserMockup } from "@/components/ui/BrowserMockup";
import { FinalCta } from "@/components/home/FinalCta";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { projects } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Website Examples: Demo Sites for Local Businesses",
  description:
    "Demo websites WebM8 designed for local businesses: a tailor, two cleaning companies, a removals firm, a baby store and an activewear brand. See each on a computer and a phone.",
  path: "/work/",
});

export default function WorkPage() {
  return (
    <>
      <PageHero
        title="Demo sites we designed for local businesses"
        subtitle="Each one is a working website, built around how that business's customers search, decide and get in touch. See it on a computer and on a phone."
      />

      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="grid gap-16 lg:gap-24">
            {projects.map((project, index) => (
              <Reveal key={project.slug}>
                <article
                  id={project.slug}
                  className={cn(
                    "scroll-mt-24 grid gap-10 lg:gap-16",
                    index % 2 === 0
                      ? "lg:grid-cols-[1fr_1.1fr] lg:items-center"
                      : "lg:grid-cols-[1.1fr_1fr] lg:items-center",
                  )}
                >
                  <div className={cn(index % 2 === 0 ? "" : "lg:order-2")}>
                    <Eyebrow>{project.industry}</Eyebrow>
                    <p className="mt-4 text-sm font-semibold text-muted">{project.name}</p>
                    <h2 className="mt-1 text-3xl font-bold text-ink md:text-4xl">
                      {project.title}
                    </h2>
                    <p className="mt-5 text-lg text-muted">{project.description}</p>

                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                      {project.outcomes.map((outcome) => (
                        <li
                          key={outcome}
                          className="flex items-start gap-3 rounded-xl border border-border bg-white p-3 text-sm text-ink"
                        >
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                            <Icon name="check" size={12} />
                          </span>
                          {outcome}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8 flex flex-wrap gap-3">
                      {project.siteUrl ? (
                        <LinkButton href={project.siteUrl} target="_blank" rel="noreferrer">
                          Open the live site
                          <Icon name="arrow" size={16} className="-rotate-45" />
                        </LinkButton>
                      ) : null}
                      <LinkButton href="/demo/" variant="ghost">
                        Get a free demo like this
                      </LinkButton>
                    </div>
                  </div>
                  <div className={cn("relative", index % 2 === 0 ? "" : "lg:order-1")}>
                    <div
                      aria-hidden
                      className="animate-drift-slow absolute -inset-6 rounded-[32px] bg-gradient-to-br from-electric/20 to-accent/20 blur-2xl"
                    />
                    <BrowserMockup
                      palette={project.palette}
                      title={project.title}
                      industry={project.industry}
                      siteUrl={project.siteUrl}
                      screenshots={project.screenshots}
                      className="relative"
                    />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
```

- [ ] **Step 6: Update the `/work/` route in `lib/seo.ts`**

Replace its `title` and `description` with:

```ts
    title: "Website Examples: Demo Sites for Local Businesses",
    description:
      "Demo websites WebM8 designed for local businesses: a tailor, two cleaning companies, a removals firm, a baby store and an activewear brand. See each on a computer and a phone.",
```

- [ ] **Step 7: Verify**

Run:
```bash
grep -rn "restaurant-desktop\|car-rental\|travel-desktop\|showcaseProjects" app components lib
```
Expected: matches only in `components/home/Hero.tsx` (deleted in Task 9). Its old project slugs now find nothing, which makes `showcaseProjects` empty without breaking the build. Confirm with `npm run build`.

Then run `npm run typecheck && npm run lint && npm test && npm run build && npm run start` and open `/work/`. Expected:
- six projects, in the order above, each with its new screenshots
- "Open the live site" opens the demo in a new tab
- "Get a free demo like this" goes to `/demo/`

- [ ] **Step 8: Commit**

```bash
git add -A scripts public/work lib/site.ts lib/seo.ts app/work/page.tsx
git commit -m "Replace the portfolio with the new demo sites

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Shared demo closing, How it works, and the font clean-up

**Files:**
- Create: `components/ui/MascotEyes.tsx`, `components/demo/DemoClosing.tsx`, `components/home/HowItWorks.tsx`
- Modify:
  - `lib/site.ts` (`ProcessStep`, `processSteps`)
  - `app/globals.css` (bubble and float keyframes; remove the neon aliases)
  - `app/layout.tsx` (drop Manrope, DM Sans and Caveat)
  - `app/page.tsx`, `app/about/page.tsx`, `app/pricing/page.tsx`, `app/work/page.tsx`
- Delete: `components/home/FinalCta.tsx`, `components/home/Process.tsx`

**Interfaces:**
- Consumes:
  - from Task 6: `DemoCtaButton`, `useDemoPrefill`, `demoSteps`
  - from Task 1: `cleanBusinessName`, `possessive`
- Produces:
  - `<MascotEyes className? sizes? />`
  - `<DemoClosing />`
  - `<HowItWorks />`
  - `ProcessStep.need: string`
  - utilities `animate-bubble` and `animate-float`

- [ ] **Step 1: Update `processSteps` in `lib/site.ts`**

```ts
export type ProcessStep = {
  number: number;
  title: string;
  body: string;
  /** What we need from the business at this step. */
  need: string;
};

export const processSteps: ProcessStep[] = [
  {
    number: 1,
    title: "Free personalised demo",
    body: "We design a homepage for your business, with your name and services on it, and show it to you before you spend a cent.",
    need: "two minutes to tell us about your business",
  },
  {
    number: 2,
    title: "Website plan",
    body: "We plan the pages, the wording and the buttons around how your customers search and decide.",
    need: "a 15-minute call",
  },
  {
    number: 3,
    title: "Design and build",
    body: "We write and build your site so it looks the business and works properly on phones.",
    need: "your logo and a few photos",
  },
  {
    number: 4,
    title: "Launch and improve",
    body: "We put it live, host it and look after it, and keep improving it so it keeps bringing in work.",
    need: "nothing, unless you want a change",
  },
];
```

- [ ] **Step 2: Add the float and bubble motion to `app/globals.css`**

Add next to the other `@keyframes`/`@utility` motion primitives:

```css
@keyframes float {
  50% {
    transform: translateY(-12px) rotate(1.5deg);
  }
}

@keyframes bubble {
  to {
    transform: translate3d(var(--drift, 0px), -110vh, 0);
    opacity: 0;
  }
}

@utility animate-float {
  animation: float 7s ease-in-out infinite;
}

@utility animate-bubble {
  animation: bubble 14s linear infinite;
}
```

Inside the existing `@media (prefers-reduced-motion: reduce)` block, add:

```css
  .animate-float,
  .animate-bubble {
    animation: none !important;
  }
```

Delete the now-unused aliases `--color-neon` and `--color-neon-soft` and their comment from `@theme`. FinalCta is the only remaining user, and Step 7 deletes it.

- [ ] **Step 3: Create `components/ui/MascotEyes.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/cn";

/** Coordinates are in the 1254×1254 space of /mascot.png. */
const VIEW = 1254;
const EYES = [
  { cx: 470, rest: 18 },
  { cx: 780, rest: -18 },
] as const;
const EYE_Y = 506;

/** The mascot, with eyes that follow the pointer and blink. Decorative. */
export function MascotEyes({ className, sizes = "200px" }: { className?: string; sizes?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const irises = [...root.querySelectorAll<SVGGElement>("[data-iris]")];
    const lids = [...root.querySelectorAll<SVGRectElement>("[data-lid]")];

    let blinkTimer = 0;
    let openTimer = 0;
    const blink = () => {
      lids.forEach((lid) => {
        lid.style.transition = "transform 90ms ease-in";
        lid.style.transform = "scaleY(1)";
      });
      openTimer = window.setTimeout(() => {
        lids.forEach((lid) => {
          lid.style.transition = "transform 140ms ease-out";
          lid.style.transform = "scaleY(0)";
        });
      }, 120);
      blinkTimer = window.setTimeout(blink, 2600 + Math.random() * 3200);
    };
    blinkTimer = window.setTimeout(blink, 2400);

    const onMove = (event: PointerEvent) => {
      const box = root.getBoundingClientRect();
      const scale = box.width / VIEW;
      irises.forEach((iris, index) => {
        const dx = event.clientX - (box.left + EYES[index].cx * scale);
        const dy = event.clientY - (box.top + EYE_Y * scale);
        const distance = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, distance / 220);
        iris.style.transform = `translate(${((dx / distance) * 26 * reach).toFixed(1)}px, ${((dy / distance) * 28 * reach).toFixed(1)}px)`;
      });
    };
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (finePointer) window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.clearTimeout(blinkTimer);
      window.clearTimeout(openTimer);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)} aria-hidden="true">
      <Image src="/mascot.png" alt="" width={VIEW} height={VIEW} sizes={sizes} className="h-auto w-full" />
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id={`${uid}-white`} cx="50%" cy="62%" r="62%">
            <stop offset=".72" stopColor="#fff" />
            <stop offset="1" stopColor="#d9e3f7" />
          </radialGradient>
          <radialGradient id={`${uid}-iris`} cx="50%" cy="40%" r="60%">
            <stop offset="0" stopColor="#3f74ff" />
            <stop offset=".8" stopColor="#1f49d6" />
            <stop offset="1" stopColor="#16359f" />
          </radialGradient>
          <linearGradient id={`${uid}-lid`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2463f6" />
            <stop offset="1" stopColor="#3b7cfb" />
          </linearGradient>
          {EYES.map((eye) => (
            <clipPath key={eye.cx} id={`${uid}-clip-${eye.cx}`}>
              <ellipse cx={eye.cx} cy={EYE_Y} rx="86" ry="99" />
            </clipPath>
          ))}
        </defs>
        {EYES.map((eye) => (
          <g key={eye.cx} clipPath={`url(#${uid}-clip-${eye.cx})`}>
            <ellipse cx={eye.cx} cy={EYE_Y} rx="88" ry="101" fill={`url(#${uid}-white)`} />
            <g data-iris style={{ transform: `translate(${eye.rest}px, 4px)`, transition: "transform 180ms ease-out" }}>
              <ellipse cx={eye.cx} cy={EYE_Y + 8} rx="58" ry="65" fill={`url(#${uid}-iris)`} />
              <ellipse cx={eye.cx} cy={EYE_Y + 12} rx="39" ry="46" fill="#090f2d" />
              <circle cx={eye.cx + 17} cy={EYE_Y - 12} r="15" fill="#fff" />
            </g>
            <rect
              data-lid
              x={eye.cx - 90}
              y="400"
              width="180"
              height="214"
              fill={`url(#${uid}-lid)`}
              style={{ transform: "scaleY(0)", transformOrigin: `${eye.cx}px 405px` }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Create `components/demo/DemoClosing.tsx`**

```tsx
"use client";

import type { CSSProperties } from "react";
import { DemoCtaButton, useDemoPrefill } from "@/components/demo/DemoPrefill";
import { MascotEyes } from "@/components/ui/MascotEyes";
import { demoSteps } from "@/lib/site";
import { cleanBusinessName, possessive } from "@/lib/trades";

// Fixed values, so the server and the browser render the same bubbles.
const BUBBLES = [
  { left: "6%", size: 14, duration: 15, delay: -2, drift: 18 },
  { left: "14%", size: 8, duration: 11, delay: -7, drift: -12 },
  { left: "22%", size: 20, duration: 18, delay: -11, drift: 24 },
  { left: "31%", size: 10, duration: 13, delay: -4, drift: -20 },
  { left: "43%", size: 16, duration: 16, delay: -9, drift: 10 },
  { left: "52%", size: 7, duration: 10, delay: -1, drift: -8 },
  { left: "61%", size: 18, duration: 17, delay: -13, drift: 22 },
  { left: "69%", size: 9, duration: 12, delay: -6, drift: -16 },
  { left: "77%", size: 13, duration: 14, delay: -3, drift: 14 },
  { left: "85%", size: 22, duration: 19, delay: -15, drift: -24 },
  { left: "92%", size: 8, duration: 11, delay: -8, drift: 12 },
];

/** The Free Personalised Website Demo close, shared by every marketing page. */
export function DemoClosing() {
  const prefill = useDemoPrefill();
  const name = prefill ? cleanBusinessName(prefill.business) : "";
  const title = name ? `Let’s get ${possessive(name)} phone ringing.` : "Let’s get your phone ringing.";

  return (
    <section
      id="demo-closing"
      aria-labelledby="demo-closing-title"
      className="surface-dark relative overflow-hidden bg-night py-28 text-center text-white md:py-36"
      style={{ backgroundImage: "radial-gradient(80% 60% at 50% 100%, rgb(43 108 252 / 0.35), transparent 70%)" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 motion-reduce:hidden">
        {BUBBLES.map((bubble) => (
          <span
            key={bubble.left}
            className="animate-bubble absolute -bottom-5 rounded-full ring-1 ring-inset ring-muted-invert/35"
            style={
              {
                left: bubble.left,
                width: bubble.size,
                height: bubble.size,
                animationDuration: `${bubble.duration}s`,
                animationDelay: `${bubble.delay}s`,
                "--drift": `${bubble.drift}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="container-page relative">
        <MascotEyes className="animate-float mx-auto mb-7 w-[200px]" />
        <h2
          id="demo-closing-title"
          className="text-[clamp(2.6rem,6.4vw,5.4rem)] leading-[0.96] font-bold text-balance"
        >
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-invert">
          Start with a Free Personalised Website Demo. We design a homepage for your business and show it to you, before you spend a cent.
        </p>

        <ol className="mx-auto mt-9 grid max-w-4xl gap-3.5 text-left md:grid-cols-3 md:gap-4.5">
          {demoSteps.map((step, index) => (
            <li key={step.title} className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-inset ring-white/10">
              <span className="mb-3.5 grid h-7.5 w-7.5 place-items-center rounded-full bg-brand font-mono text-[0.82rem] font-semibold text-brand-ink">
                {index + 1}
              </span>
              <h3 className="text-[1.04rem] font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-invert">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-9 flex flex-col items-center gap-3">
          <DemoCtaButton placement="closing" size="lg">
            Get my free personalised demo
          </DemoCtaButton>
          <p className="text-sm text-muted-invert">No payment. No obligation. We reply within one business day.</p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create `components/home/HowItWorks.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { processSteps } from "@/lib/site";

/** The four steps, with a neon line that follows reading position. */
export function HowItWorks() {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const steps = [...list.querySelectorAll<HTMLElement>("[data-step]")];
    let raf = 0;

    const update = () => {
      raf = 0;
      const box = list.getBoundingClientRect();
      const line = window.innerHeight * 0.6;
      const fill = box.height > 0 ? Math.min(1, Math.max(0, (line - box.top) / box.height)) : 0;
      list.style.setProperty("--fill", fill.toFixed(3));
      steps.forEach((step) => step.toggleAttribute("data-on", step.getBoundingClientRect().top < line));
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    let listening = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !listening) {
          listening = true;
          window.addEventListener("scroll", schedule, { passive: true });
          schedule();
        } else if (!entry.isIntersecting && listening) {
          listening = false;
          window.removeEventListener("scroll", schedule);
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(list);
    window.addEventListener("resize", schedule);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="surface-dark bg-night py-28 text-white md:py-36">
      <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <header className="lg:sticky lg:top-36 lg:self-start">
          <h2 id="how-title" className="text-[clamp(2.3rem,5vw,4.4rem)] leading-[0.96] font-bold">
            How it works.
          </h2>
          <p className="mt-4 max-w-md text-lg text-muted-invert">
            You&apos;ll always know what&apos;s happening, what we need from you, and what happens after launch.
          </p>
        </header>

        <div ref={listRef} className="relative pl-11">
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-3.5 w-0.5 bg-white/10" />
          <span
            aria-hidden="true"
            className="absolute top-2 left-3.5 w-0.5 bg-brand shadow-[0_0_12px_rgb(212_255_53/0.6)]"
            style={{ height: "calc((100% - 1rem) * var(--fill, 0))" }}
          />
          <ol className="grid gap-16">
            {processSteps.map((step) => (
              <li key={step.number} data-step className="group relative">
                <span
                  aria-hidden="true"
                  className="absolute top-0 -left-11 grid h-7.5 w-7.5 place-items-center rounded-full bg-night font-mono text-xs font-semibold text-muted-invert ring-2 ring-white/20 ring-inset transition-colors group-data-[on]:bg-brand group-data-[on]:text-brand-ink group-data-[on]:ring-0"
                >
                  {step.number}
                </span>
                <h3 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-bold text-muted-invert transition-colors group-data-[on]:text-white">
                  {step.title}
                </h3>
                <p className="mt-2.5 max-w-lg text-muted-invert">{step.body}</p>
                <p className="mt-3.5 inline-block rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white ring-1 ring-white/10 ring-inset">
                  From you: {step.need}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Use the new sections on every page that had the old ones**

- `app/page.tsx`:
  - Replace `import { Process } from "@/components/home/Process";` with `import { HowItWorks } from "@/components/home/HowItWorks";`.
  - Replace `import { FinalCta } from "@/components/home/FinalCta";` with `import { DemoClosing } from "@/components/demo/DemoClosing";`.
  - Replace `<Process />` with `<HowItWorks />`, and `<FinalCta />` with `<DemoClosing />`.
- `app/about/page.tsx`: the same two import swaps and the same two element swaps.
- `app/pricing/page.tsx` and `app/work/page.tsx`: swap the `FinalCta` import for `DemoClosing`, and `<FinalCta />` for `<DemoClosing />`.

- [ ] **Step 7: Delete the old components and their fonts**

```bash
git rm components/home/FinalCta.tsx components/home/Process.tsx
grep -rn "FinalCta\|components/home/Process\|font-manrope\|font-dm-sans\|font-caveat\|bg-neon\|neon-soft" app components
```
Expected: no output.

Then in `app/layout.tsx`:
- Change the font import to `import { Funnel_Display, Geist, Geist_Mono } from "next/font/google";`.
- Delete the `manrope`, `dmSans` and `caveat` declarations.
- Remove `${manrope.variable} ${dmSans.variable} ${caveat.variable}` from the `<html>` `className`.

- [ ] **Step 8: Verify**

Run: `npm run typecheck && npm run lint && npm test && npm run build && npm run start`

**At 1440×900:**
- `/` and `/about/` show the dark "How it works." section.
  - Scrolling fills the neon line, and each step's number turns neon as it passes the middle of the screen.
  - Each step ends with "From you: …".
- `/`, `/about/`, `/pricing/` and `/work/` end with "Let's get your phone ringing."
  - The mascot's eyes follow the pointer and blink every few seconds.
  - Bubbles rise.
  - The button goes to `/demo/`.

**With reduced motion** (DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`):
- no bubbles, no float and no eye movement
- the line still fills on scroll

- [ ] **Step 9: Commit**

```bash
git add -A app components lib
git commit -m "Add the shared demo closing and the new How it works section

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: The story hero

**Files:**
- Create in `components/home/story/`:
  - `story.module.css`, `icons.tsx`, `TradeIcon.tsx`, `StatusBar.tsx`
  - `StoryBackdrop.tsx`, `TradePicker.tsx`
  - `SearchScreen.tsx`, `TradeSite.tsx`, `RequestForm.tsx`, `LockScreen.tsx`
  - `StoryHero.tsx`
- Modify: `app/page.tsx`, `app/globals.css` (remove the `hero-showcase` rules)
- Delete: `components/home/Hero.tsx`

**Interfaces:**
- Consumes:
  - from Task 1: `trades`, `defaultTrade`, `displayName`, `initialOf`, `searchSuggestions`, `tradeGroups`, `parseTrade`, `BUSINESS_NAME_MAX`, `Trade`, `TradeKey`
  - from Task 3: `storyProgress`, `chapterAt`, `chapterProgress`, `typedText`, `fieldFill`, `easeInOutCubic`, `chapterScrollTarget`, `StoryChapter`, `StoryStep`
  - from Task 6: `DemoPrefillProvider`, `useDemoPrefill`, `DemoCtaButton`
  - from Task 4: `LinkButton` with the `ghost-invert` variant
- Produces: `<StoryHero />`, which must be rendered inside `DemoPrefillProvider`.

Elements that the scroll loop reads are marked `data-story="<name>"`: `query`, `search`, `top-result`, `tap-1`, `site`, `tap-2`, `field`, `field-value`, `form-button`, `tap-3`, `done`, `note-0`, `note-1`, `shake`. The loop sets boolean data attributes on them: `data-typing`, `data-results`, `data-hl`, `data-go`, `data-active`, `data-pressed`, `data-on`, `data-buzz`, `data-nudge`. It sets CSS variables too: `--p` on the section, `--f` on rail buttons, `--s2` on the site screen, `--flip`, `--tilt-x` and `--tilt-z` on the phone, and `--push` on the device (phones only).

- [ ] **Step 1: Create `components/home/story/story.module.css`**

```css
/*
 * The homepage story (StoryHero). Sizes inside the phone are in cqi, so the
 * whole phone scales as one piece. States are data attributes that the
 * scroll loop in StoryHero sets directly, without React re-rendering.
 */

.story { position: relative; height: 480vh; margin-top: -4rem; background: var(--color-night); color: #eef3fa; }
@media (min-width: 768px) { .story { margin-top: -5rem; } }
.pin { position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden; }

/* ----- Backdrop ----- */
.backdrop { position: absolute; inset: 0; pointer-events: none; }
.glow { position: absolute; top: 50%; right: -8%; width: 900px; height: 900px; border-radius: 50%; transform: translateY(-50%); background: radial-gradient(circle, rgb(43 108 252 / 0.42), rgb(43 108 252 / 0.1) 40%, transparent 66%); transition: background 0.8s; }
.story[data-chapter="4"] .glow { background: radial-gradient(circle, rgb(212 255 53 / 0.22), rgb(43 108 252 / 0.14) 42%, transparent 66%); }
.city { position: absolute; inset: -10% -5%; width: 110%; height: 120%; opacity: 0.55; transform: translateY(calc(var(--p, 0) * -6%)); }
.city path { stroke: #13355f; }
.crowd circle { fill: #6f9bff; opacity: 0; transition: opacity 0.5s; }
.story[data-chapter="1"] .crowd circle,
.story[data-chapter="2"] .crowd circle { opacity: 0.85; animation: crowd 2.4s ease-in-out infinite; }
.crowd circle:nth-child(3n) { animation-delay: 0.8s; }
.crowd circle:nth-child(3n + 1) { animation-delay: 1.6s; }
@keyframes crowd { 50% { opacity: 0.2; } }

/* ----- Layout ----- */
.grid { position: relative; display: grid; grid-template-rows: auto 1fr; gap: 12px; height: 100%; padding-top: 92px; padding-bottom: 20px; }
.chapters { position: relative; display: grid; }
.chapter { grid-area: 1 / 1; align-self: start; opacity: 0; transform: translateY(26px); transition: opacity 0.55s var(--ease-brand), transform 0.7s var(--ease-brand); }
.chapter[data-state="on"] { opacity: 1; transform: none; }
.chapter[data-state="past"] { transform: translateY(-26px); }
.title { margin: 0; font: 700 clamp(2rem, 5.2vw, 4.6rem) / 0.98 var(--font-display); letter-spacing: -0.035em; text-wrap: balance; }
.lede { max-width: 34rem; margin: 18px 0 0; color: var(--color-muted-invert); font-size: clamp(1rem, 1.35vw, 1.18rem); line-height: 1.6; text-wrap: pretty; }
.ledeFirst { margin-top: 22px; }
.ctas { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; }
.device { display: grid; place-items: center; min-height: 0; }

@media (min-width: 960px) {
  .grid { grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); grid-template-rows: 1fr; align-items: center; gap: 40px; padding-top: 76px; padding-bottom: 0; }
  .ctas { margin-top: 26px; }
}
@media (max-width: 959px) {
  .grid { display: block; }
  .chapters { position: absolute; top: 84px; right: 1.25rem; left: 1.25rem; }
  .device { position: absolute; right: 0; bottom: 46px; left: 0; height: min(58svh, 520px); place-items: end center; transform: translateY(var(--push, 0px)); transition: transform 0.7s var(--ease-brand); }
  .enter, .shake { height: 100%; }
  .phone { width: auto; height: 100%; }
}
@media (min-width: 768px) and (max-width: 959px) { .chapters { right: 2rem; left: 2rem; } }

/* ----- Trade picker ----- */
.picker { max-width: 33rem; margin-top: 26px; padding: 18px 20px 16px; border-radius: 20px; background: rgb(255 255 255 / 0.045); box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.1); backdrop-filter: blur(8px); }
.selectWrap { position: relative; display: inline-flex; align-items: center; max-width: 100%; white-space: nowrap; }
.select { max-width: 100%; padding: 0 28px 1px 2px; border: 0; border-bottom: 2px solid var(--color-brand); border-radius: 0; background: transparent; color: var(--color-brand); font: inherit; font-weight: 600; cursor: pointer; appearance: none; -webkit-appearance: none; }
.select:focus-visible { outline-offset: 4px; }
.select option, .select optgroup { background: #fff; color: #0b1220; }
.chevron { position: absolute; right: 4px; color: var(--color-brand); pointer-events: none; }
.measure { position: absolute; visibility: hidden; white-space: pre; font-weight: 600; pointer-events: none; }
.nameInput { width: 100%; height: 46px; padding: 0 14px; border: 0; border-radius: 12px; background: rgb(255 255 255 / 0.07); box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.14); color: #eef3fa; font: 500 1rem var(--font-sans); transition: box-shadow 0.2s, background-color 0.2s; }
.nameInput::placeholder { color: #6f86a3; }
.nameInput:focus { outline: none; background: rgb(255 255 255 / 0.1); box-shadow: inset 0 0 0 2px var(--color-brand); }
@media (max-width: 959px) { .picker { margin-top: 16px; padding: 14px 16px 12px; } .nameInput { height: 44px; } }

/* ----- Progress rail ----- */
.railWrap { position: absolute; right: 0; bottom: 28px; left: 0; }
.rail { display: flex; gap: 10px; }
.railButton { flex: 1; max-width: 120px; padding: 0; border: 0; background: none; color: var(--color-muted-invert); font-size: 0.82rem; font-weight: 500; text-align: left; cursor: pointer; }
.railButton[aria-current="step"] { color: #eef3fa; }
.railTrack { display: block; height: 3px; margin-bottom: 9px; overflow: hidden; border-radius: 3px; background: rgb(255 255 255 / 0.14); }
.railFill { display: block; width: calc(var(--f, 0) * 100%); height: 100%; border-radius: inherit; background: var(--color-brand); }
@media (max-width: 959px) { .railWrap { bottom: 12px; } .railButton { font-size: 0.72rem; } }

/* ----- Phone ----- */
.enter { animation: phone-in 1.2s 0.15s var(--ease-brand) both; }
@keyframes phone-in { from { opacity: 0; transform: translateY(70px); } }
.shake[data-buzz] { animation: buzz 0.5s linear 2; }
.shake[data-nudge] { animation: nudge 0.6s var(--ease-brand); }
@keyframes buzz { 0%, 100% { transform: translateX(0) rotate(0); } 20% { transform: translateX(-3px) rotate(-1deg); } 40% { transform: translateX(3px) rotate(1deg); } 60% { transform: translateX(-2px) rotate(-0.6deg); } 80% { transform: translateX(2px) rotate(0.6deg); } }
@keyframes nudge { 35% { transform: translateY(-10px) rotate(-1deg); } }
.phone { position: relative; width: clamp(200px, 21vw, 300px); aspect-ratio: 9 / 19.4; transform-style: preserve-3d; transform: perspective(1600px) rotateY(var(--flip, 0deg)) rotateX(var(--tilt-x, 4deg)) rotateZ(var(--tilt-z, -2deg)); transition: transform 0.25s linear; }
.face { position: absolute; inset: 0; padding: 3.4%; border-radius: 15% / 7%; background: linear-gradient(145deg, #23324a, #0b1220 40%, #131d30); box-shadow: inset 0 0 0 1.5px rgb(255 255 255 / 0.14), 0 80px 120px -50px rgb(0 0 0 / 0.9), 0 0 0 1px #02060d; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.back { transform: rotateY(180deg); }
.screen { position: relative; height: 100%; overflow: hidden; border-radius: 12.4% / 5.8%; background: #fff; color: #1d2330; container-type: inline-size; }
.island { position: absolute; top: 2.2%; left: 50%; z-index: 20; width: 31%; height: 3.5%; border-radius: 99px; background: #000; transform: translateX(-50%); }
.slot { position: absolute; inset: 0; opacity: 0; transition: opacity 0.4s var(--ease-brand); }
.screen[data-screen="search"] > [data-slot="search"],
.screen[data-screen="site"] > [data-slot="site"],
.screen[data-screen="form"] > [data-slot="form"] { opacity: 1; }
.status { display: flex; align-items: center; justify-content: space-between; height: 12cqi; padding: 5.2cqi 8cqi 0; font: 600 4.2cqi var(--font-sans); }
.status svg { width: auto; height: 3.6cqi; }
.tap { position: absolute; z-index: 5; width: 14cqi; height: 14cqi; margin: -7cqi 0 0 -7cqi; border-radius: 50%; background: rgb(43 108 252 / 0.35); box-shadow: 0 0 0 0.6cqi rgb(255 255 255 / 0.9); opacity: 0; transform: scale(0); pointer-events: none; }
.tap[data-go] { animation: tap 0.9s var(--ease-brand) forwards; }
@keyframes tap { 0% { opacity: 0; transform: scale(0.2); } 25% { opacity: 1; transform: scale(1); } 55% { opacity: 1; transform: scale(0.82); } 100% { opacity: 0; transform: scale(1.5); } }

/* ----- Screen 1: the search ----- */
.searchScreen { background: #fff; }
.searchBar { display: flex; align-items: center; gap: 3cqi; height: 13cqi; margin: 3cqi 5cqi 0; padding: 0 4.6cqi; border-radius: 99px; background: #f1f3f6; font-size: 4.5cqi; }
.searchBar svg { flex: none; width: 4.6cqi; color: #5f6673; }
.query { overflow: hidden; white-space: nowrap; }
.query:empty::before { content: "Search"; color: #8a919c; }
.caret { width: 0.55cqi; height: 5.4cqi; margin-left: -2cqi; background: var(--color-electric); animation: caret 1s steps(1) infinite; }
@keyframes caret { 50% { opacity: 0; } }
.tabs { display: flex; gap: 5cqi; padding: 3.6cqi 7cqi 0; border-bottom: 1px solid #eceef2; color: #6b7280; font-size: 3.5cqi; }
.tabs span { padding-bottom: 2.4cqi; }
.tabs span:first-child { color: var(--color-electric); box-shadow: inset 0 -0.6cqi 0 var(--color-electric); }
.suggest { position: absolute; top: 40cqi; right: 0; left: 0; padding: 2cqi 6cqi; transition: opacity 0.35s; }
.searchScreen[data-typing] .suggest { opacity: 0; }
.suggestTitle { margin: 0 0 2cqi; color: #6b7280; font-size: 3.3cqi; }
.suggestItem { display: flex; align-items: center; gap: 3cqi; padding: 2.6cqi 0; border-bottom: 1px solid #f0f1f4; font-size: 4.2cqi; }
.suggestItem svg { flex: none; width: 4.4cqi; color: #8a919c; }
.suggestItem[data-current] { color: var(--color-electric); font-weight: 600; }
.suggestItem[data-current] svg { color: var(--color-electric); }
.map { position: relative; height: 40cqi; margin: 3.6cqi 5cqi 0; overflow: hidden; border-radius: 5cqi; background: #eef1ec; opacity: 0; transform: translateY(3cqi); transition: opacity 0.4s, transform 0.5s var(--ease-brand); }
.map svg { display: block; width: 100%; height: 100%; }
.mapPin { position: absolute; display: grid; place-items: center; width: 7cqi; height: 7cqi; margin: -7cqi 0 0 -3.5cqi; border-radius: 50% 50% 50% 0; background: #ea4335; box-shadow: 0 1cqi 2cqi rgb(0 0 0 / 0.25); transform: rotate(-45deg); }
.mapPin b { color: #fff; font: 700 3.2cqi var(--font-sans); transform: rotate(45deg); }
.mapPin[data-top] { background: var(--color-electric); }
.results { padding-top: 1cqi; }
.result { position: relative; padding: 3.2cqi 6cqi; border-bottom: 1px solid #eef0f3; opacity: 0; transform: translateY(3cqi); transition: opacity 0.4s, transform 0.5s var(--ease-brand), background-color 0.4s, box-shadow 0.4s; }
.searchScreen[data-results] .map,
.searchScreen[data-results] .result { opacity: 1; transform: none; }
.searchScreen[data-results] .result:nth-child(2) { transition-delay: 0.08s; }
.searchScreen[data-results] .result:nth-child(3) { transition-delay: 0.16s; }
.result b { display: block; overflow: hidden; color: #1a3d8f; font-size: 4.4cqi; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.meta { color: #6b7280; font-size: 3.3cqi; }
.meta i { color: #f5a524; font-style: normal; letter-spacing: 0.05em; }
.actions { display: flex; gap: 2cqi; margin-top: 2cqi; }
.actions span { padding: 1.2cqi 3cqi; border-radius: 99px; box-shadow: inset 0 0 0 1px #d9dde3; color: #1a3d8f; font-size: 3.2cqi; font-weight: 500; }
.result[data-hl] { background: #eef4ff; box-shadow: inset 0.9cqi 0 0 var(--color-electric); }

/* ----- Screen 2: their site ----- */
.site { overflow: hidden; background: #fff; color: var(--t-ink); }
.siteStatus { position: relative; z-index: 3; background: #fff; color: var(--t-ink); }
.siteScroll { transform: translateY(calc(var(--s2, 0) * -14cqi)); }
.siteNav { display: flex; align-items: center; justify-content: space-between; gap: 3cqi; padding: 2cqi 6cqi 3.6cqi; }
.siteLogo { display: flex; align-items: center; gap: 2.4cqi; min-width: 0; font-size: 4.6cqi; letter-spacing: -0.02em; }
.siteLogo b { max-width: 58cqi; overflow: hidden; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.mark { display: grid; flex: none; place-items: center; width: 8.6cqi; height: 8.6cqi; border-radius: 2.6cqi; background: var(--t-primary); color: #fff; font: 800 4.6cqi var(--font-sans); font-style: normal; }
.burger { display: grid; gap: 1.3cqi; width: 6.4cqi; }
.burger i { display: block; height: 0.8cqi; border-radius: 1cqi; background: currentColor; }
.siteHero { position: relative; margin: 0 3.4cqi; padding: 7cqi 6cqi; overflow: hidden; border-radius: 6cqi; background: radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--t-primary) 55%, #fff) 0%, transparent 55%), linear-gradient(165deg, var(--t-primary), var(--t-deep)); color: #fff; }
.siteHeroIcon { position: absolute; top: -7cqi; right: -9cqi; width: 50cqi; height: 50cqi; color: #fff; opacity: 0.18; }
.pill { position: relative; display: inline-flex; align-items: center; gap: 1.6cqi; padding: 1.4cqi 3cqi; border-radius: 99px; background: rgb(255 255 255 / 0.16); font-size: 3.2cqi; font-weight: 500; }
.pill i { color: #ffd34d; font-style: normal; letter-spacing: 0.04em; }
.siteHeadline { position: relative; margin: 4cqi 0 3cqi; font: 800 10.2cqi / 1.02 var(--t-font, var(--font-sans)); letter-spacing: -0.03em; text-wrap: balance; }
.siteSub { position: relative; margin: 0; font-size: 4cqi; line-height: 1.4; opacity: 0.88; }
.siteCta { position: relative; display: flex; align-items: center; justify-content: center; height: 12.5cqi; margin-top: 5.5cqi; border-radius: 99px; background: var(--t-accent); color: var(--t-accent-ink); font-size: 4.4cqi; font-weight: 650; }
.siteCall { position: relative; display: flex; align-items: center; justify-content: center; height: 11cqi; margin-top: 2.4cqi; border-radius: 99px; box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.45); font-size: 4cqi; font-weight: 500; }
.services { padding: 5cqi 6cqi 0; }
.servicesTitle { margin: 0 0 1.4cqi; color: color-mix(in srgb, var(--t-ink) 60%, transparent); font-size: 3.4cqi; font-weight: 500; }
.serviceRow { display: flex; align-items: center; gap: 3cqi; padding: 2.8cqi 0; border-bottom: 1px solid #eef0f3; font-size: 4.3cqi; font-weight: 600; }
.serviceIcon { display: grid; flex: none; place-items: center; width: 9cqi; height: 9cqi; border-radius: 50%; background: var(--t-soft); color: var(--t-primary); }
.serviceIcon svg { width: 5cqi; height: 5cqi; }
.chev { width: 4cqi; margin-left: auto; color: #9aa1ac; }
.callBar { position: absolute; right: 4cqi; bottom: 4cqi; left: 4cqi; display: flex; align-items: center; justify-content: center; gap: 2.4cqi; height: 13.5cqi; border-radius: 99px; background: var(--t-ink); color: #fff; font-size: 4.4cqi; font-weight: 600; box-shadow: 0 4cqi 8cqi -4cqi rgb(0 0 0 / 0.45); }
.callBar svg { width: 5cqi; }

/* ----- Screen 3: the request form ----- */
.form { background: #fff; }
.formHead { display: flex; align-items: center; gap: 2.4cqi; padding: 3cqi 6cqi 4cqi; border-bottom: 1px solid #eceef2; font-size: 4.4cqi; }
.formHead b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.formLogo { display: grid; flex: none; place-items: center; width: 8cqi; height: 8cqi; border-radius: 2.4cqi; background: var(--t-primary); color: #fff; font: 800 4.4cqi var(--font-sans); }
.formBody { padding: 6cqi; }
.formTitle { margin: 0 0 1.4cqi; color: #0d1b33; font: 700 7cqi / 1.05 var(--font-sans); letter-spacing: -0.02em; }
.formSub { margin: 0 0 5cqi; color: #6b7280; font-size: 3.6cqi; }
.field { display: block; margin-bottom: 3.4cqi; }
.fieldLabel { display: block; margin-bottom: 1.2cqi; color: #6b7280; font-size: 3.2cqi; }
.fieldValue { display: flex; align-items: center; height: 11cqi; padding: 0 3.6cqi; border-radius: 2.6cqi; box-shadow: inset 0 0 0 1px #d6dbe3; color: #0d1b33; font-size: 4cqi; transition: box-shadow 0.3s; }
.field[data-active] .fieldValue { box-shadow: inset 0 0 0 0.5cqi var(--t-primary); }
.formButton { position: relative; display: grid; place-items: center; height: 12.5cqi; margin-top: 5cqi; border-radius: 99px; background: var(--t-primary); color: #fff; font: 600 4.3cqi var(--font-sans); transition: transform 0.2s, filter 0.3s; }
.formButton[data-pressed] { filter: brightness(0.88); transform: scale(0.96); }
.done { position: absolute; inset: 0; display: grid; place-content: center; gap: 3cqi; padding: 10cqi; background: #fff; text-align: center; opacity: 0; transform: scale(0.96); transition: opacity 0.4s, transform 0.5s var(--ease-brand); }
.done[data-on] { opacity: 1; transform: none; }
.doneIcon { display: grid; place-items: center; width: 20cqi; height: 20cqi; margin: 0 auto; border-radius: 50%; background: #e8f6ee; color: #11823b; }
.doneIcon svg { width: 10cqi; }
.done b { color: #0d1b33; font: 700 6.4cqi var(--font-sans); }
.done p { margin: 0; color: #6b7280; font-size: 3.8cqi; }

/* ----- The owner's phone ----- */
.lock { position: absolute; inset: 0; background: radial-gradient(120% 70% at 20% 10%, #2b6cfc 0%, transparent 55%), radial-gradient(90% 60% at 90% 90%, #0e2f56, transparent 70%), linear-gradient(#0a1f45, #050c1c); color: #fff; }
.lockTime { margin-top: 8cqi; text-align: center; }
.lockTime small { display: block; font-size: 4.2cqi; opacity: 0.85; }
.lockTime b { display: block; font: 600 22cqi / 1 var(--font-display); letter-spacing: -0.02em; }
.notes { position: absolute; top: 52%; right: 4cqi; left: 4cqi; display: grid; gap: 2.4cqi; }
.note { display: grid; grid-template-columns: 9cqi 1fr; gap: 3cqi; align-items: start; padding: 3.6cqi 4cqi; border-radius: 5.4cqi; background: rgb(255 255 255 / 0.16); backdrop-filter: blur(14px); opacity: 0; transform: translateY(-8cqi) scale(0.94); transition: opacity 0.45s var(--ease-brand), transform 0.6s var(--ease-brand), box-shadow 0.6s; }
.note[data-on] { opacity: 1; transform: none; }
.noteNew[data-on] { box-shadow: 0 0 0 0.5cqi var(--color-brand), 0 0 12cqi -2cqi rgb(212 255 53 / 0.7); }
.noteIcon { display: grid; place-items: center; width: 9cqi; height: 9cqi; border-radius: 2.4cqi; background: var(--color-brand); color: var(--color-brand-ink); }
.noteIcon svg { width: 5.4cqi; }
.noteIconMail { background: #1a7fe6; color: #fff; }
.noteHead { display: flex; justify-content: space-between; font-size: 3.2cqi; opacity: 0.8; }
.note b { display: block; margin-top: 0.6cqi; font-size: 4.1cqi; }
.note p { margin: 0.6cqi 0 0; font-size: 3.6cqi; line-height: 1.3; opacity: 0.92; }

@media (prefers-reduced-motion: reduce) {
  .enter, .shake[data-buzz], .shake[data-nudge], .crowd circle, .caret, .tap[data-go] { animation: none; }
  .phone, .chapter, .device { transition: none; }
}
```

- [ ] **Step 2: Create `components/home/story/icons.tsx`**

```tsx
/** Small decorative icons used inside the story's phone. */

const common = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const SearchIcon = () => (
  <svg {...common} strokeWidth={2.4}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const TrendIcon = () => (
  <svg {...common} strokeWidth={2.2}><path d="M3 17l6-6 4 4 8-8" /></svg>
);
export const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg {...common} strokeWidth={2.4} className={className}><path d="m9 6 6 6-6 6" /></svg>
);
export const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg {...common} strokeWidth={2.4} width={18} height={18} className={className}><path d="m6 9 6 6 6-6" /></svg>
);
export const PhoneIcon = () => (
  <svg {...common} strokeWidth={2.2}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" /></svg>
);
export const CheckIcon = () => (
  <svg {...common} strokeWidth={3}><path d="m5 12 5 5L20 7" /></svg>
);
export const GlobeIcon = () => (
  <svg {...common} strokeWidth={2.4}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>
);
export const MailIcon = () => (
  <svg {...common} strokeWidth={2.4}><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></svg>
);
export const SignalIcon = () => (
  <svg viewBox="0 0 64 14" fill="currentColor" aria-hidden="true">
    <rect x="0" y="8" width="3" height="6" rx="1" /><rect x="5" y="5" width="3" height="9" rx="1" /><rect x="10" y="2" width="3" height="12" rx="1" /><rect x="15" y="0" width="3" height="14" rx="1" opacity=".35" />
    <rect x="36" y="1" width="24" height="12" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.3" /><rect x="38" y="3" width="16" height="8" rx="2" />
  </svg>
);
```

- [ ] **Step 3: Create `components/home/story/TradeIcon.tsx`**

```tsx
import type { ReactNode } from "react";
import type { TradeKey } from "@/lib/trades";

const PATHS: Record<TradeKey, ReactNode> = {
  cleaning: (<><path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>),
  hvac: (<><path d="M12 2v20M4.9 6l14.2 12M19.1 6 4.9 18" /><path d="m9 4 3 2 3-2M9 20l3-2 3 2" /></>),
  plumbing: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  electrical: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  roofing: (<><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>),
  landscaping: (<><path d="M12 22V12" /><path d="M12 12c0-5 4-8 9-8 0 5-4 8-9 8z" /><path d="M12 15c0-4-3-6-8-6 0 4 3 6 8 6z" /></>),
  moving: (<><path d="M2 7h12v10H2zM14 10h4l4 4v3h-8" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>),
  restaurant: (<><path d="M7 2v9M4 2v5a3 3 0 0 0 6 0V2M7 11v11" /><path d="M17 2c-2 1-3 4-3 8h3v12" /></>),
  cafe: (<><path d="M4 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z" /><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17" /><path d="M8 2.5c-.6 1 .6 2-.2 3M12 2.5c-.6 1 .6 2-.2 3" /></>),
  salon: (<><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" /></>),
  barber: (<><rect x="8" y="3" width="8" height="18" rx="2" /><path d="m8 7 8 4M8 12l8 4M8 17l4 2" /></>),
  medspa: (<><circle cx="12" cy="12" r="3" /><path d="M12 2c2 3 2 4 0 7-2-3-2-4 0-7zM12 15c2 3 2 4 0 7-2-3-2-4 0-7zM2 12c3-2 4-2 7 0-3 2-4 2-7 0zM15 12c3-2 4-2 7 0-3 2-4 2-7 0z" /></>),
  dental: <path d="M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7 .5 3 1 6.5 2.5 6.5S9.5 17 12 17s3 4 4.5 4 2-3.5 2.5-6.5c.5-2.5 2-4 2-7C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z" />,
  fitness: <path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12" />,
  other: (<><path d="M3 21h18M5 21V8l7-5 7 5v13" /><path d="M9 21v-6h6v6" /></>),
};

export function TradeIcon({ trade, className, strokeWidth = 1.8 }: { trade: TradeKey; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {PATHS[trade]}
    </svg>
  );
}
```

- [ ] **Step 4: Create `components/home/story/StatusBar.tsx` and `StoryBackdrop.tsx`**

`StatusBar.tsx`:

```tsx
import { cn } from "@/lib/cn";
import { SignalIcon } from "./icons";
import styles from "./story.module.css";

export function StatusBar({ time, className }: { time?: string; className?: string }) {
  return (
    <div className={cn(styles.status, className)}>
      <span>{time}</span>
      <SignalIcon />
    </div>
  );
}
```

`StoryBackdrop.tsx`:

```tsx
import styles from "./story.module.css";

const CROWD = [[182, 140], [430, 335], [702, 190], [980, 350], [1248, 150], [300, 560], [860, 572], [1120, 770], [560, 770], [1360, 580], [90, 760], [640, 440]];

/** The night-time street map behind the story; dots pulse while people search. */
export function StoryBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.glow} />
      <svg className={styles.city} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
        <g strokeWidth="1.2">
          <path d="M-20 140 C 300 120, 520 210, 780 180 S 1240 120, 1480 170" />
          <path d="M-20 330 C 260 300, 600 380, 900 340 S 1300 300, 1480 360" />
          <path d="M-20 560 C 320 520, 640 600, 980 560 S 1320 520, 1480 590" />
          <path d="M-20 760 C 400 720, 700 800, 1040 760 S 1360 740, 1480 790" />
          <path d="M160 -20 C 140 260, 220 520, 180 920" />
          <path d="M420 -20 C 460 300, 380 600, 440 920" />
          <path d="M700 -20 C 660 280, 740 560, 690 920" />
          <path d="M980 -20 C 1020 320, 940 620, 1000 920" />
          <path d="M1250 -20 C 1220 260, 1290 600, 1240 920" />
          <path d="M40 40 L 520 470 M 860 20 L 1420 520 M 300 900 L 820 430" strokeDasharray="2 8" />
        </g>
        <g className={styles.crowd}>
          {CROWD.map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" />
          ))}
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 5: Create the four phone screens**

`components/home/story/SearchScreen.tsx`:

```tsx
import { cn } from "@/lib/cn";
import { searchSuggestions, type Trade } from "@/lib/trades";
import { SearchIcon, TrendIcon } from "./icons";
import { StatusBar } from "./StatusBar";
import styles from "./story.module.css";

export function SearchScreen({ trade, name }: { trade: Trade; name: string }) {
  return (
    <div data-slot="search" data-story="search" className={cn(styles.slot, styles.searchScreen)}>
      <StatusBar time="9:41" />
      <div className={styles.searchBar}>
        <SearchIcon />
        <span data-story="query" className={styles.query} />
        <i className={styles.caret} />
      </div>
      <div className={styles.tabs}>
        <span>All</span>
        <span>Maps</span>
        <span>Images</span>
        <span>News</span>
      </div>
      <div className={styles.suggest}>
        <p className={styles.suggestTitle}>Searched near you today</p>
        {searchSuggestions(trade).map((query, index) => (
          <span key={query} className={styles.suggestItem} data-current={index === 0 ? "" : undefined}>
            <TrendIcon />
            {query}
          </span>
        ))}
      </div>
      <div className={styles.map}>
        <svg viewBox="0 0 300 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="300" height="140" fill="#e8ede4" />
          <path d="M0 96 C 80 80, 160 120, 300 86" stroke="#a9cdf0" strokeWidth="12" fill="none" />
          <rect x="190" y="14" width="70" height="40" rx="6" fill="#cfe6c3" />
          <g stroke="#fff" strokeWidth="6" fill="none">
            <path d="M0 40 H300" />
            <path d="M60 0 V140" />
            <path d="M150 0 C 140 60, 170 90, 160 140" />
            <path d="M0 120 L300 30" />
          </g>
        </svg>
        <span className={styles.mapPin} data-top="" style={{ left: "38%", top: "52%" }}><b>1</b></span>
        <span className={styles.mapPin} style={{ left: "72%", top: "70%" }}><b>2</b></span>
        <span className={styles.mapPin} style={{ left: "18%", top: "34%" }}><b>3</b></span>
      </div>
      <div className={styles.results}>
        <div data-story="top-result" className={styles.result}>
          <b>{name}</b>
          <span className={styles.meta}><i>★★★★★</i> 4.9 ({trade.reviewCount}) {trade.category}</span>
          <div className={styles.actions}>
            <span>Website</span>
            <span>Directions</span>
            <span>Call</span>
          </div>
          <i data-story="tap-1" className={styles.tap} style={{ left: "16%", top: "78%" }} />
        </div>
        {trade.competitors.map((competitor) => (
          <div key={competitor.name} className={styles.result}>
            <b>{competitor.name}</b>
            <span className={styles.meta}><i>★★★★</i> {competitor.rating}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

`components/home/story/TradeSite.tsx`:

```tsx
import { cn } from "@/lib/cn";
import { initialOf, type Trade } from "@/lib/trades";
import { ChevronRightIcon, PhoneIcon } from "./icons";
import { StatusBar } from "./StatusBar";
import { TradeIcon } from "./TradeIcon";
import styles from "./story.module.css";

/** The example site, built from the trade and the visitor's business name. */
export function TradeSite({ trade, name }: { trade: Trade; name: string }) {
  return (
    <div data-slot="site" data-story="site" className={cn(styles.slot, styles.site)}>
      <StatusBar time="9:41" className={styles.siteStatus} />
      <div className={styles.siteScroll}>
        <div className={styles.siteNav}>
          <span className={styles.siteLogo}>
            <i className={styles.mark}>{initialOf(name)}</i>
            <b>{name}</b>
          </span>
          <span className={styles.burger}><i /><i /><i /></span>
        </div>
        <div className={styles.siteHero}>
          <TradeIcon trade={trade.key} className={styles.siteHeroIcon} strokeWidth={1.2} />
          <span className={styles.pill}><i>★★★★★</i>Rated 4.9 locally</span>
          <p className={styles.siteHeadline}>{trade.site.headline}</p>
          <p className={styles.siteSub}>{trade.site.sub}</p>
          <span className={styles.siteCta}>
            {trade.site.cta}
            <i data-story="tap-2" className={styles.tap} style={{ left: "50%", top: "50%" }} />
          </span>
          <span className={styles.siteCall}>Call {trade.site.phone}</span>
        </div>
        <div className={styles.services}>
          <p className={styles.servicesTitle}>Services</p>
          {trade.site.services.map((service) => (
            <div key={service} className={styles.serviceRow}>
              <span className={styles.serviceIcon}><TradeIcon trade={trade.key} strokeWidth={2} /></span>
              {service}
              <ChevronRightIcon className={styles.chev} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.callBar}>
        <PhoneIcon />
        Call now
      </div>
    </div>
  );
}
```

`components/home/story/RequestForm.tsx`:

```tsx
import { cn } from "@/lib/cn";
import { initialOf, type Trade } from "@/lib/trades";
import { CheckIcon } from "./icons";
import { StatusBar } from "./StatusBar";
import styles from "./story.module.css";

/** The trade's booking or quote form. StoryHero types the values in. */
export function RequestForm({ trade, name }: { trade: Trade; name: string }) {
  return (
    <div data-slot="form" className={cn(styles.slot, styles.form)}>
      <StatusBar time="9:42" />
      <div className={styles.formHead}>
        <span className={styles.formLogo}>{initialOf(name)}</span>
        <b>{name}</b>
      </div>
      <div className={styles.formBody}>
        <p className={styles.formTitle}>{trade.form.title}</p>
        <p className={styles.formSub}>{trade.form.sub}</p>
        {trade.form.fields.map((field, index) => (
          <div key={index} data-story="field" className={styles.field}>
            <span className={styles.fieldLabel}>{field.label}</span>
            <span data-story="field-value" className={styles.fieldValue} />
          </div>
        ))}
        <span data-story="form-button" className={styles.formButton}>
          {trade.form.button}
          <i data-story="tap-3" className={styles.tap} style={{ left: "50%", top: "50%" }} />
        </span>
      </div>
      <div data-story="done" className={styles.done}>
        <span className={styles.doneIcon}><CheckIcon /></span>
        <b>Request sent</b>
        <p>{name} {trade.form.done}</p>
      </div>
    </div>
  );
}
```

`components/home/story/LockScreen.tsx`:

```tsx
import { cn } from "@/lib/cn";
import type { Trade } from "@/lib/trades";
import { GlobeIcon, MailIcon, SignalIcon } from "./icons";
import styles from "./story.module.css";

/** The owner's phone, after the story turns it around. */
export function LockScreen({ trade }: { trade: Trade }) {
  return (
    <div className={styles.lock}>
      <div className={styles.status}>
        <span />
        <SignalIcon />
      </div>
      <div className={styles.lockTime}>
        <small>Thursday, October 2</small>
        <b>9:43</b>
      </div>
      <div className={styles.notes}>
        <div data-story="note-0" className={cn(styles.note, styles.noteNew)}>
          <span className={styles.noteIcon}><GlobeIcon /></span>
          <div>
            <div className={styles.noteHead}><span>Website enquiry</span><span>now</span></div>
            <b>{trade.notification.title}</b>
            <p>{trade.notification.body}</p>
          </div>
        </div>
        <div data-story="note-1" className={styles.note}>
          <span className={cn(styles.noteIcon, styles.noteIconMail)}><MailIcon /></span>
          <div>
            <div className={styles.noteHead}><span>Mail</span><span>now</span></div>
            <b>Your customer got their confirmation</b>
            <p>We sent the details to the customer for you.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create `components/home/story/TradePicker.tsx`**

```tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BUSINESS_NAME_MAX, defaultTrade, parseTrade, tradeGroups, trades, type TradeKey } from "@/lib/trades";
import { ChevronDownIcon } from "./icons";
import styles from "./story.module.css";

type TradePickerProps = {
  tradeKey: TradeKey;
  business: string;
  onTradeChange: (key: TradeKey) => void;
  onBusinessChange: (value: string) => void;
};

/** "Show me how it works for my [trade]", plus an optional business name. */
export function TradePicker({ tradeKey, business, onTradeChange, onBusinessChange }: TradePickerProps) {
  const selectId = useId();
  const nameId = useId();
  const hintId = useId();
  const measureRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>();

  // Size the select to the chosen label so the sentence reads naturally.
  useEffect(() => {
    const update = () => {
      const measure = measureRef.current;
      if (measure) setWidth(Math.ceil(measure.offsetWidth) + 30);
    };
    update();
    void document.fonts?.ready.then(update);
  }, [tradeKey]);

  return (
    <div className={styles.picker}>
      <label htmlFor={selectId} className="block text-[1.02rem] leading-normal font-medium md:text-lg">
        Show me how it works for my{" "}
        <span className={styles.selectWrap}>
          <select
            id={selectId}
            value={tradeKey}
            onChange={(event) => onTradeChange(parseTrade(event.target.value) ?? defaultTrade)}
            className={styles.select}
            style={width ? { width } : undefined}
          >
            {tradeGroups.map(({ group, keys }) => (
              <optgroup key={group} label={group}>
                {keys.map((key) => (
                  <option key={key} value={key}>
                    {trades[key].label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDownIcon className={styles.chevron} />
          <span ref={measureRef} aria-hidden="true" className={styles.measure}>
            {trades[tradeKey].label}
          </span>
        </span>
      </label>
      <div className="mt-3.5 grid gap-1.5">
        <label htmlFor={nameId} className="text-sm text-muted-invert">
          Your business name <span className="opacity-75">(optional)</span>
        </label>
        <input
          id={nameId}
          type="text"
          value={business}
          onChange={(event) => onBusinessChange(event.target.value)}
          maxLength={BUSINESS_NAME_MAX}
          autoComplete="organization"
          placeholder="e.g. Reyes Plumbing"
          aria-describedby={hintId}
          className={styles.nameInput}
        />
      </div>
      <p id={hintId} className="mt-2 text-xs text-muted-invert">
        This stays in your browser until you ask for your demo.
      </p>
    </div>
  );
}
```

- [ ] **Step 7: Create `components/home/story/StoryHero.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { DemoCtaButton, useDemoPrefill } from "@/components/demo/DemoPrefill";
import { LinkButton } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import {
  chapterAt,
  chapterProgress,
  chapterScrollTarget,
  easeInOutCubic,
  fieldFill,
  storyProgress,
  typedText,
  type StoryChapter,
  type StoryStep,
} from "@/lib/storyProgress";
import { defaultTrade, displayName, trades, type Trade } from "@/lib/trades";
import { LockScreen } from "./LockScreen";
import { RequestForm } from "./RequestForm";
import { SearchScreen } from "./SearchScreen";
import { StoryBackdrop } from "./StoryBackdrop";
import { TradePicker } from "./TradePicker";
import { TradeSite } from "./TradeSite";
import styles from "./story.module.css";

const RAIL: { chapter: StoryStep; label: string }[] = [
  { chapter: 1, label: "Search" },
  { chapter: 2, label: "Site" },
  { chapter: 3, label: "Request" },
  { chapter: 4, label: "Call" },
];

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function paletteStyle(trade: Trade): CSSProperties {
  const p = trade.palette;
  return {
    "--t-primary": p.primary,
    "--t-deep": p.deep,
    "--t-accent": p.accent,
    "--t-accent-ink": p.accentInk,
    "--t-soft": p.soft,
    "--t-ink": p.ink,
    "--t-font": p.serif ? 'Georgia, "Times New Roman", serif' : "var(--font-sans)",
  } as CSSProperties;
}

function screenFor(chapter: StoryChapter) {
  return chapter <= 1 ? "search" : chapter === 2 ? "site" : "form";
}

function Chapter({ index, current, children }: { index: StoryChapter; current: StoryChapter; children: ReactNode }) {
  const state = index === current ? "on" : index < current ? "past" : "next";
  return (
    <div className={styles.chapter} data-state={state} inert={index !== current}>
      {children}
    </div>
  );
}

/**
 * The homepage hero: one customer's journey, from a local search to the
 * owner's phone lighting up, told in five chapters as the visitor scrolls.
 * Must be rendered inside DemoPrefillProvider.
 */
export function StoryHero() {
  const prefill = useDemoPrefill();
  const tradeKey = prefill?.tradeKey ?? defaultTrade;
  const business = prefill?.business ?? "";
  const trade = trades[tradeKey];
  const name = displayName(trade, business);

  const sectionRef = useRef<HTMLElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const tradeRef = useRef(trade);
  const frameRef = useRef<() => void>(() => {});
  const chapterRef = useRef<StoryChapter>(0);
  const completedRef = useRef(false);
  const firstTradeRef = useRef(true);
  const [chapter, setChapter] = useState<StoryChapter>(0);

  // The scroll loop: one rAF-throttled frame writes every per-frame state.
  useEffect(() => {
    const section = sectionRef.current;
    const phone = phoneRef.current;
    if (!section || !phone) return;
    const reduce = prefersReducedMotion();
    const find = (name: string) => section.querySelector<HTMLElement>(`[data-story="${name}"]`);
    const flag = (element: Element | null, name: string, on: boolean) => element?.toggleAttribute(`data-${name}`, on);
    let raf = 0;

    const frame = () => {
      raf = 0;
      const box = section.getBoundingClientRect();
      const p = storyProgress(box.top, section.offsetHeight, window.innerHeight);
      const current = chapterAt(p);
      section.style.setProperty("--p", p.toFixed(4));
      if (current !== chapterRef.current) {
        chapterRef.current = current;
        setChapter(current);
      }
      section.querySelectorAll<HTMLElement>("[data-rail-step]").forEach((element, index) => {
        element.style.setProperty("--f", chapterProgress(p, (index + 1) as StoryStep).toFixed(3));
      });

      const t = tradeRef.current;

      // 1. The search types itself, results appear, the top one is chosen.
      const l1 = chapterProgress(p, 1);
      const query = find("query");
      if (query) query.textContent = typedText(t.query, l1 / 0.4);
      const search = find("search");
      flag(search, "typing", l1 > 0.02);
      flag(search, "results", l1 > 0.45);
      flag(find("top-result"), "hl", l1 > 0.7);
      flag(find("tap-1"), "go", current === 1 && l1 > 0.82);

      // 2. Their site scrolls a little, then the main button is tapped.
      const l2 = chapterProgress(p, 2);
      find("site")?.style.setProperty("--s2", easeInOutCubic(l2).toFixed(3));
      flag(find("tap-2"), "go", current === 2 && l2 > 0.74);

      // 3. The form fills itself in and is sent.
      const l3 = chapterProgress(p, 3);
      section.querySelectorAll<HTMLElement>('[data-story="field"]').forEach((field, index) => {
        const amount = fieldFill(l3, index);
        const value = field.querySelector('[data-story="field-value"]');
        if (value) value.textContent = typedText(t.form.fields[index]?.value ?? "", amount);
        flag(field, "active", amount > 0 && amount < 1);
      });
      flag(find("form-button"), "pressed", l3 > 0.76 && l3 < 0.86);
      flag(find("tap-3"), "go", current === 3 && l3 > 0.74);
      flag(find("done"), "on", l3 > 0.86);

      // 4. The phone turns around: it is the owner's, and the request lands.
      const l4 = chapterProgress(p, 4);
      const flip = easeInOutCubic(l4 / 0.3);
      phone.style.setProperty("--flip", `${(reduce ? (flip > 0.5 ? 180 : 0) : flip * 180).toFixed(1)}deg`);
      flag(find("note-0"), "on", l4 > 0.36);
      flag(find("note-1"), "on", l4 > 0.62);
      flag(find("shake"), "buzz", !reduce && l4 > 0.38 && l4 < 0.9);
    };
    frameRef.current = frame;

    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(frame);
    };
    let listening = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !listening) {
        listening = true;
        window.addEventListener("scroll", schedule, { passive: true });
        schedule();
      } else if (!entry.isIntersecting && listening) {
        listening = false;
        window.removeEventListener("scroll", schedule);
      }
    });
    observer.observe(section);
    window.addEventListener("resize", schedule);
    frame();

    let onPointer: ((event: PointerEvent) => void) | null = null;
    if (!reduce && window.matchMedia("(pointer: fine)").matches) {
      onPointer = (event) => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        phone.style.setProperty("--tilt-x", `${(4 - y * 8).toFixed(2)}deg`);
        phone.style.setProperty("--tilt-z", `${(-2 + x * 4).toFixed(2)}deg`);
      };
      window.addEventListener("pointermove", onPointer, { passive: true });
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (onPointer) window.removeEventListener("pointermove", onPointer);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  // A new trade or name re-renders the screens; redraw the typed text at once.
  useEffect(() => {
    tradeRef.current = trade;
    frameRef.current();
  }, [trade, name]);

  // A small nudge on the phone when the trade changes.
  useEffect(() => {
    if (firstTradeRef.current) {
      firstTradeRef.current = false;
      return;
    }
    const shake = shakeRef.current;
    if (!shake || prefersReducedMotion()) return;
    shake.removeAttribute("data-nudge");
    void shake.offsetWidth;
    shake.setAttribute("data-nudge", "");
  }, [tradeKey]);

  // On phones, push the phone below a chapter whose copy reaches into its space.
  useEffect(() => {
    const place = () => {
      const device = deviceRef.current;
      const list = chaptersRef.current;
      if (!device || !list) return;
      if (window.innerWidth >= 960) {
        device.style.removeProperty("--push");
        return;
      }
      const active = list.children[chapter] as HTMLElement | undefined;
      if (!active) return;
      const bottom = list.offsetTop + active.offsetHeight;
      device.style.setProperty("--push", `${Math.max(0, bottom + 18 - device.offsetTop)}px`);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [chapter]);

  useEffect(() => {
    if (chapter === 4 && !completedRef.current) {
      completedRef.current = true;
      trackEvent("home_story_completed", { trade: tradeRef.current.key });
    }
  }, [chapter]);

  const goTo = (target: StoryStep) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: chapterScrollTarget(top, section.offsetHeight, window.innerHeight, target),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      aria-label="An example of how a website turns a local search into a new customer"
      data-chapter={chapter}
      className={cn("surface-dark", styles.story)}
      style={paletteStyle(trade)}
    >
      <div className={styles.pin}>
        <StoryBackdrop />
        <div className={cn("container-page", styles.grid)}>
          <div ref={chaptersRef} className={styles.chapters}>
            <Chapter index={0} current={chapter}>
              <h1 className="text-[clamp(2.3rem,6vw,5.1rem)] leading-[0.96] font-bold text-balance">
                Websites that make your phone ring.
              </h1>
              <p className={cn(styles.lede, styles.ledeFirst)}>
                WebM8 designs, builds and looks after websites for local businesses in the US and UK. Pick your trade, then scroll to see how one turns a search into a new customer.
              </p>
              {prefill ? (
                <TradePicker
                  tradeKey={tradeKey}
                  business={business}
                  onTradeChange={prefill.selectTrade}
                  onBusinessChange={prefill.setBusiness}
                />
              ) : null}
              <div className={styles.ctas}>
                <DemoCtaButton placement="hero" size="lg">
                  Get my free personalised demo
                </DemoCtaButton>
                <LinkButton href="#work" variant="ghost-invert" size="lg">
                  See our work
                </LinkButton>
              </div>
            </Chapter>
            <Chapter index={1} current={chapter}>
              <p className={styles.title}>{trade.need}</p>
              <p className={styles.lede}>Right now, people in your area are searching for exactly what you do. Most of them are on a phone.</p>
            </Chapter>
            <Chapter index={2} current={chapter}>
              <p className={styles.title}>They find a site that looks the part.</p>
              <p className={styles.lede}>Clear, quick and built for the small screen. Within seconds they know they&apos;re in the right place.</p>
            </Chapter>
            <Chapter index={3} current={chapter}>
              <p className={styles.title}>Saying yes takes one tap.</p>
              <p className={styles.lede}>A booking or quote form right where they need it, or a button that calls you. No hunting for a phone number.</p>
            </Chapter>
            <Chapter index={4} current={chapter}>
              <p className={styles.title}>And your phone lights up.</p>
              <p className={styles.lede}>That&apos;s the whole job of a website. We build it, host it and keep it working, so you can get on with yours.</p>
              <div className={styles.ctas}>
                <DemoCtaButton placement="story_end" size="lg">
                  Get my free personalised demo
                </DemoCtaButton>
              </div>
            </Chapter>
          </div>

          <div ref={deviceRef} className={styles.device} aria-hidden="true">
            <div className={styles.enter}>
              <div ref={shakeRef} data-story="shake" className={styles.shake}>
                <div ref={phoneRef} className={styles.phone}>
                  <div className={styles.face}>
                    <div data-screen={screenFor(chapter)} className={styles.screen}>
                      <span className={styles.island} />
                      <SearchScreen trade={trade} name={name} />
                      <TradeSite trade={trade} name={name} />
                      <RequestForm trade={trade} name={name} />
                    </div>
                  </div>
                  <div className={cn(styles.face, styles.back)}>
                    <div className={styles.screen}>
                      <span className={styles.island} />
                      <LockScreen trade={trade} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.railWrap}>
          <div className={cn("container-page", styles.rail)}>
            {RAIL.map((step) => (
              <button
                key={step.label}
                type="button"
                data-rail-step
                className={styles.railButton}
                aria-current={chapter === step.chapter ? "step" : undefined}
                onClick={() => goTo(step.chapter)}
              >
                <span className={styles.railTrack}>
                  <span className={styles.railFill} />
                </span>
                {step.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Mount it on the homepage and delete the old hero**

In `app/page.tsx`:
- Replace `import { Hero } from "@/components/home/Hero";` with:
  ```ts
  import { DemoPrefillProvider } from "@/components/demo/DemoPrefill";
  import { StoryHero } from "@/components/home/story/StoryHero";
  ```
- Wrap the returned fragment's children in `<DemoPrefillProvider>`, swapping `<Hero />` for `<StoryHero />`:

```tsx
export default function HomePage() {
  return (
    <DemoPrefillProvider>
      <StoryHero />
      <WhatYouGet />
      <Portfolio limit={3} />
      <Pricing />
      <HowItWorks />
      <AuditTeaser />
      <Testimonials />
      <DemoClosing />
    </DemoPrefillProvider>
  );
}
```

Then delete the old hero and its CSS:

```bash
git rm components/home/Hero.tsx
```

In `app/globals.css`, delete:
- `@keyframes heroShowcaseFade`
- `@keyframes heroShowcaseDot`
- the `.hero-showcase-slide` and `.hero-showcase-dot` rules
- the reduced-motion entries that name them: the `.hero-showcase-slide,`/`.hero-showcase-dot,` lines inside the `animation: none` rule, and the two `:first-child` rules

Confirm with `grep -rn "hero-showcase" app components` (expected: no output).

- [ ] **Step 9: Verify with lint, types and a build**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: success. `/` stays `○ (Static)`.

- [ ] **Step 10: Verify in the browser**

Run `npm run start`. In Playwright (or a browser) at **1440×900**, open `/`:

| Scroll to | Expected |
|---|---|
| The top | "Websites that make your phone ring.", the picker set to "plumbing business", two buttons. The phone shows "Searched near you today" with "plumber near me" highlighted first. |
| 28% of the story section's scrollable height | "Someone nearby needs a plumber.", the search reads "plumber near me", three results, "Reyes Plumbing" highlighted. |
| 47% | "They find a site that looks the part.", a blue Reyes Plumbing site. |
| 72% | "Saying yes takes one tap.", "Request a plumber" with four filled fields. |
| 97% | "And your phone lights up." The phone has turned round to a dark lock screen with "New job request" in a neon ring. |

Then:
- Pick "hair salon" and type "Bella Rosa Hair". Expected: the phone nudges, and from 28% onward the story shows "Someone nearby wants a new look.", "Bella Rosa Hair" as the top result, a magenta site and a "New appointment" notification.
- Open `/?trade=restaurant`. Expected: the picker reads "restaurant", and at 47% the site headline is in a serif face.
- Click the rail's "Request" button. Expected: the page scrolls into chapter 3.
- Scroll to the bottom. Expected: "Let's get Bella Rosa Hair's phone ringing." (DemoClosing now reads the provider.)
- Check the console. Expected: no errors or warnings.

At **390×844**, repeat the top and 28% checks:
- At the top, the phone peeks up under the buttons. At 28% it sits fully in view below the copy.
- `document.documentElement.scrollWidth === 390` (no sideways scroll).

With **reduced motion** emulated, at 97%:
- the lock screen shows without a turning animation
- no buzz
- the chapters still change

- [ ] **Step 11: Commit**

```bash
git add -A app components
git commit -m "Add the trade-aware scroll story as the homepage hero

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: The rest of the homepage, the dark header, and clean-up

**Files:**
- Create: `components/home/WorkDeck.tsx`, `components/home/EightArms.tsx`, `components/home/Plans.tsx`, `components/home/Voices.tsx`
- Modify: `lib/site.ts` (`teamArms`; plan `ctaLabel`; remove `trustBar`, `valueCards`, `ValueCard`, `auditChecklist`), `app/page.tsx`, `components/layout/Header.tsx`
- Delete: `components/home/{AuditTeaser,Portfolio,Pricing,TrustBar,ValueCards}.tsx`

**Interfaces:**
- Consumes:
  - from Task 7: `projects` with `name` and optional `siteUrl`
  - `plans` and `testimonials` from `lib/site.ts`
  - from Task 4: `LinkButton` and `Icon`
- Produces: `teamArms: { title: string; body: string }[]`

- [ ] **Step 1: Add `teamArms` and tidy plan labels in `lib/site.ts`**

Add after `demoSteps`:

```ts
export type TeamArm = { title: string; body: string };

/** "Eight arms. One team.": everything a site needs, around the mascot. */
export const teamArms: TeamArm[] = [
  { title: "Design that earns trust", body: "A professional look that matches the quality of your work." },
  { title: "Built for phones first", body: "Most local customers will find you on a phone. It has to work there." },
  { title: "Found in local searches", body: "Pages and business details set up so Google can show you nearby." },
  { title: "Ready for AI search", body: "Information formatted for tools like ChatGPT and Gemini." },
  { title: "Tap to call, easy to quote", body: "Forms and call buttons exactly where people decide." },
  { title: "Know where calls come from", body: "A monthly report of visits, calls and form requests." },
  { title: "Hosting and security", body: "Your site is hosted, backed up and kept secure for you." },
  { title: "Changes when you need them", body: "Send us a message. We make the update." },
];
```

In `plans`, change both `ctaLabel: "Get a Fast Estimate",` to `ctaLabel: "Get a fast estimate",`.

- [ ] **Step 2: Create `components/home/WorkDeck.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { projects } from "@/lib/site";

const hostOf = (url?: string) => (url ? new URL(url).hostname : "webm8agency.com");

/** The demo sites as a 3D fan. Adding a project to lib/site.ts adds a card. */
export function WorkDeck() {
  const [active, setActive] = useState(Math.floor(projects.length / 2));
  const [narrow, setNarrow] = useState(false);
  const startX = useRef<number | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 759px)");
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const go = (index: number) => setActive((index + projects.length) % projects.length);
  const current = projects[active];

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(active + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(active - 1);
    }
  };
  const onPointerDown = (event: PointerEvent) => {
    startX.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (startX.current === null) return;
    const dx = event.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="surface-dark overflow-hidden bg-gradient-to-b from-night to-ink-deep py-28 text-white md:py-36"
    >
      <div className="container-page text-center">
        <h2 id="work-title" className="text-[clamp(2.3rem,5vw,4.4rem)] leading-[0.96] font-bold text-balance">
          Built for businesses like yours.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-invert">
          Demo sites we designed for local businesses. Pick one to take a closer look.
        </p>
      </div>

      <div
        className="relative mt-12 h-[clamp(260px,44vw,520px)] touch-pan-y [perspective:2000px]"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {projects.map((project, index) => {
          const offset = index - active;
          const distance = Math.abs(offset);
          const isActive = offset === 0;
          return (
            <button
              key={project.slug}
              type="button"
              tabIndex={distance > 2 ? -1 : 0}
              disabled={isActive && !project.siteUrl}
              aria-label={isActive ? `Open the ${project.name} demo site` : `Show ${project.name}`}
              onClick={() => {
                if (!isActive) go(index);
                else if (project.siteUrl) window.open(project.siteUrl, "_blank", "noopener,noreferrer");
              }}
              className="absolute top-0 left-1/2 w-[min(76vw,760px)] cursor-pointer text-left transition-[transform,opacity,filter] duration-700 ease-brand [transform-style:preserve-3d] disabled:cursor-default"
              style={{
                transform: `translateX(${offset * (narrow ? 62 : 44) - 50}%) translateZ(${-distance * (narrow ? 260 : 220)}px) rotateY(${narrow ? 0 : -offset * 24}deg)`,
                opacity: distance > 2 ? 0 : 1 - distance * 0.22,
                filter: distance ? `brightness(${1 - distance * 0.25}) saturate(${1 - distance * 0.3})` : "none",
                zIndex: 10 - distance,
                pointerEvents: distance > 2 ? "none" : undefined,
              }}
            >
              <div className="overflow-hidden rounded-[14px] bg-white shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_60px_100px_-40px_rgb(0_0_0/0.9)]">
                <div className="flex h-8 items-center gap-1.5 bg-[#e9edf3] px-3">
                  <i className="h-2.5 w-2.5 rounded-full bg-[#c3cad5]" />
                  <i className="h-2.5 w-2.5 rounded-full bg-[#c3cad5]" />
                  <i className="h-2.5 w-2.5 rounded-full bg-[#c3cad5]" />
                  <span className="mx-auto h-5 max-w-[280px] flex-1 truncate rounded-md bg-white text-center font-mono text-[10.5px] leading-5 text-[#6b7280]">
                    {hostOf(project.siteUrl)}
                  </span>
                </div>
                <div className="relative aspect-[16/9.2] overflow-hidden">
                  <Image
                    src={project.screenshots.desktop}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 760px, 76vw"
                    className="object-cover object-top"
                  />
                </div>
              </div>
              <div className="absolute right-[-3%] bottom-[-8%] w-[19%] rounded-2xl bg-[#0b1220] p-1 shadow-[0_30px_50px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/10 [transform:translateZ(60px)]">
                <div className="relative aspect-[9/19] overflow-hidden rounded-xl">
                  <Image src={project.screenshots.mobile} alt="" fill sizes="150px" className="object-cover object-top" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="container-page mt-18 grid items-end gap-6 lg:grid-cols-[1fr_auto]">
        <div aria-live="polite">
          <p className="text-sm font-medium text-muted-invert">{current.industry}</p>
          <h3 className="mt-1 font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-none font-bold tracking-[-0.03em]">
            {current.name}
          </h3>
          <p className="mt-3 max-w-xl text-muted-invert">{current.description}</p>
          {current.siteUrl ? (
            <a
              href={current.siteUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 font-semibold text-link-invert underline-offset-4 hover:underline"
            >
              Open the live site
              <Icon name="arrow" size={15} className="-rotate-45" />
            </a>
          ) : null}
        </div>
        <div role="group" aria-label="Choose a demo site" className="flex flex-wrap gap-2">
          {projects.map((project, index) => (
            <button
              key={project.slug}
              type="button"
              aria-pressed={index === active}
              onClick={() => go(index)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                index === active ? "bg-white text-ink-deep" : "bg-white/6 text-muted-invert hover:text-white",
              )}
            >
              {project.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `components/home/EightArms.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { teamArms, type TeamArm } from "@/lib/site";

/** Tentacle tips of /mascot.png as fractions of its box, left side (right is mirrored). */
const TIPS = [
  [0.1, 0.47],
  [0.08, 0.65],
  [0.25, 0.81],
  [0.37, 0.87],
] as const;

export function EightArms() {
  const stageRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [paths, setPaths] = useState<string[]>([]);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [lit, setLit] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(false);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const mascot = mascotRef.current;
    if (!stage || !mascot || window.innerWidth < 1024) {
      setPaths([]);
      return;
    }
    const s = stage.getBoundingClientRect();
    const m = mascot.getBoundingClientRect();
    setBox({ width: s.width, height: s.height });
    setPaths(
      teamArms.map((_, index) => {
        const item = itemRefs.current[index];
        if (!item) return "";
        const r = item.getBoundingClientRect();
        const left = index < 4;
        const [tx, ty] = TIPS[index % 4];
        const sx = m.left - s.left + m.width * (left ? tx : 1 - tx);
        const sy = m.top - s.top + m.height * ty;
        const ex = left ? r.right - s.left + 6 : r.left - s.left - 6;
        const ey = r.top - s.top + r.height / 2;
        const dir = left ? -1 : 1;
        return `M${sx.toFixed(1)} ${sy.toFixed(1)} C ${(sx + dir * 70).toFixed(1)} ${sy.toFixed(1)}, ${(ex - dir * 70).toFixed(1)} ${ey.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      }),
    );
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(stage);
    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          reveal.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    reveal.observe(stage);
    return () => {
      resize.disconnect();
      reveal.disconnect();
    };
  }, [measure]);

  const list = (items: TeamArm[], offset: number) => (
    <ul className="relative z-10 grid gap-3.5 lg:gap-8">
      {items.map((arm, j) => {
        const index = offset + j;
        return (
          <li
            key={arm.title}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            onPointerEnter={() => setLit(index)}
            onPointerLeave={() => setLit(null)}
            className={cn(
              "rounded-2xl px-4.5 py-4 ring-1 ring-inset transition-colors",
              offset === 0 && "lg:text-right",
              lit === index ? "bg-brand/6 ring-brand/40" : "bg-white/[0.03] ring-white/6",
            )}
          >
            <h3 className="text-[1.06rem] font-semibold">{arm.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-invert">{arm.body}</p>
          </li>
        );
      })}
    </ul>
  );

  return (
    <section id="included" aria-labelledby="arms-title" className="surface-dark bg-ink-deep py-28 text-white md:py-36">
      <div className="container-page">
        <header className="mx-auto mb-14 max-w-2xl text-center">
          <h2 id="arms-title" className="text-[clamp(2.3rem,5vw,4.4rem)] leading-[0.96] font-bold">
            Eight arms. One team.
          </h2>
          <p className="mt-4 text-lg text-muted-invert">
            Everything your website needs, handled by the same people for as long as you&apos;re with us. You never have to chase three different companies.
          </p>
        </header>

        <div ref={stageRef} className="relative grid gap-7 lg:grid-cols-[1fr_340px_1fr] lg:items-center lg:gap-10">
          {paths.length > 0 && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full overflow-visible lg:block"
              viewBox={`0 0 ${box.width} ${box.height}`}
            >
              {paths.map((d, index) =>
                d ? (
                  <path
                    key={index}
                    d={d}
                    pathLength={1}
                    fill="none"
                    strokeLinecap="round"
                    style={{
                      stroke: lit === index ? "var(--color-brand)" : "rgb(111 155 255 / 0.42)",
                      strokeWidth: lit === index ? 2.5 : 2,
                      filter: lit === index ? "drop-shadow(0 0 6px rgb(212 255 53 / 0.7))" : undefined,
                      strokeDasharray: 1,
                      strokeDashoffset: drawn ? 0 : 1,
                      transition: `stroke-dashoffset 1.4s var(--ease-brand) ${index * 90}ms, stroke 0.3s, stroke-width 0.3s`,
                    }}
                  />
                ) : null,
              )}
            </svg>
          )}
          {list(teamArms.slice(0, 4), 0)}
          <div ref={mascotRef} className="relative z-10 mx-auto w-44 max-lg:order-first lg:w-[300px]">
            <Image
              src="/mascot.png"
              alt="The WebM8 octopus"
              width={1254}
              height={1254}
              sizes="(min-width: 1024px) 300px, 176px"
              className="animate-float h-auto w-full drop-shadow-[0_30px_60px_rgb(43_108_252/0.45)]"
            />
          </div>
          {list(teamArms.slice(4), 4)}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `components/home/Plans.tsx`**

```tsx
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { plans } from "@/lib/site";

export function Plans() {
  return (
    <section id="plans" aria-labelledby="plans-title" className="bg-bg py-28 text-ink-deep md:py-36">
      <div className="container-page">
        <header className="mb-14 max-w-2xl">
          <h2 id="plans-title" className="text-[clamp(2.3rem,5vw,4.4rem)] leading-[0.96] font-bold">
            Two plans. Priced for your business.
          </h2>
          <p className="mt-4 text-lg text-muted">
            Every project is quoted to the business, so you only pay for what you need. Pick the plan that fits and we&apos;ll send you a number.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 md:gap-7">
          {plans.map((plan) => {
            const featured = plan.highlighted;
            return (
              <article
                key={plan.id}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-[28px] p-9",
                  featured
                    ? "surface-dark bg-ink-deep text-white shadow-[0_40px_80px_-40px_rgb(7_26_51/0.6)]"
                    : "bg-white ring-1 ring-border ring-inset",
                )}
              >
                {featured && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-30 -right-30 h-90 w-90 rounded-full bg-[radial-gradient(circle,rgb(43_108_252/0.5),transparent_65%)]"
                  />
                )}
                <div className="relative flex items-center justify-between gap-3">
                  <h3 className="font-display text-[2.4rem] leading-none font-bold tracking-[-0.035em]">{plan.name}</h3>
                  {plan.badge && (
                    <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-ink">{plan.badge}</span>
                  )}
                </div>
                <p className={cn("relative mt-3.5 mb-6", featured ? "text-muted-invert" : "text-muted")}>{plan.summary}</p>
                <ul className="relative mb-8 grid gap-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-[0.96rem]">
                      <Icon name="check" size={16} className={cn("mt-1 shrink-0", featured ? "text-brand" : "text-accent")} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <LinkButton
                  href={`/contact/?plan=${plan.id}`}
                  size="lg"
                  variant={featured ? "primary" : "ghost"}
                  className="relative mt-auto w-full"
                >
                  {plan.ctaLabel}
                </LinkButton>
              </article>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          No large upfront website cost. Monthly support included. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create `components/home/Voices.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { testimonials } from "@/lib/site";

export function Voices() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timer = useRef(0);

  const choose = (next: number) => {
    if (next === index) return;
    window.clearTimeout(timer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIndex(next);
      return;
    }
    setVisible(false);
    timer.current = window.setTimeout(() => {
      setIndex(next);
      setVisible(true);
    }, 220);
  };

  const current = testimonials[index];

  return (
    <section aria-labelledby="voices-title" className="surface-dark bg-ink-deep py-28 text-white md:py-36">
      <div className="container-page">
        <h2 id="voices-title" className="sr-only">
          What owners say
        </h2>
        <figure aria-live="polite">
          <blockquote
            className={cn(
              "min-h-[4.8em] max-w-4xl font-display text-[clamp(1.6rem,3.2vw,2.7rem)] leading-[1.18] font-semibold tracking-[-0.025em] text-balance transition-opacity duration-300",
              visible ? "opacity-100" : "opacity-0",
            )}
          >
            <p>&ldquo;{current.quote}&rdquo;</p>
          </blockquote>
          <figcaption className="sr-only">
            {current.name}, {current.role}, {current.company}
          </figcaption>
        </figure>
        <div role="group" aria-label="Choose a review" className="mt-9 flex flex-wrap gap-2.5">
          {testimonials.map((testimonial, i) => (
            <button
              key={testimonial.name}
              type="button"
              aria-pressed={i === index}
              onClick={() => choose(i)}
              className={cn(
                "flex items-center gap-3 rounded-full py-2 pr-4.5 pl-2 text-left transition-colors",
                i === index ? "bg-white/12 text-white" : "bg-white/5 text-muted-invert hover:text-white",
              )}
            >
              <span
                className={cn(
                  "grid h-9.5 w-9.5 place-items-center rounded-full font-mono text-xs font-semibold",
                  i === index ? "bg-brand text-brand-ink" : "bg-ink-raised text-white",
                )}
              >
                {testimonial.initials}
              </span>
              <span className="text-sm leading-tight">
                {testimonial.name}
                <small className="block text-xs opacity-80">
                  {testimonial.role}, {testimonial.company}
                </small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Compose the homepage**

Replace `app/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { DemoClosing } from "@/components/demo/DemoClosing";
import { DemoPrefillProvider } from "@/components/demo/DemoPrefill";
import { EightArms } from "@/components/home/EightArms";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Plans } from "@/components/home/Plans";
import { StoryHero } from "@/components/home/story/StoryHero";
import { Voices } from "@/components/home/Voices";
import { WorkDeck } from "@/components/home/WorkDeck";
import {
  createPageMetadata,
  defaultDescription,
  defaultTitle,
} from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: defaultTitle,
  description: defaultDescription,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <DemoPrefillProvider>
      <StoryHero />
      <WorkDeck />
      <EightArms />
      <HowItWorks />
      <Plans />
      <Voices />
      <DemoClosing />
    </DemoPrefillProvider>
  );
}
```

- [ ] **Step 7: Keep the header dark across the homepage**

In `components/layout/Header.tsx`:

1. Replace
   ```tsx
     const hasDarkHero = pathname === "/" || isMoversPage;
     const overDarkHero = hasDarkHero && !scrolled;
   ```
   with
   ```tsx
     // The homepage is navy from top to bottom, so its header stays dark.
     // /movers/ has a navy hero, so its header is dark until the page scrolls.
     const isHome = pathname === "/";
     const overDarkHero = isHome || (isMoversPage && !scrolled);
   ```
2. Replace the header's `className={cn( … )}` argument list
   ```tsx
           "sticky top-0 z-50 w-full transition-all",
           scrolled
             ? "border-b border-border bg-white/85 backdrop-blur"
             : "bg-transparent",
   ```
   with
   ```tsx
           "sticky top-0 z-50 w-full transition-all",
           overDarkHero && "surface-dark",
           isHome
             ? scrolled
               ? "border-b border-white/5 bg-night/72 backdrop-blur-lg"
               : "bg-transparent"
             : scrolled
               ? "border-b border-border bg-white/85 backdrop-blur"
               : "bg-transparent",
   ```

- [ ] **Step 8: Remove the components and data nothing uses any more**

```bash
git rm components/home/AuditTeaser.tsx components/home/Portfolio.tsx components/home/Pricing.tsx components/home/TrustBar.tsx components/home/ValueCards.tsx
```

In `lib/site.ts`, delete:
- the `trustBar` export
- the `ValueCard` type and `valueCards` export
- the `auditChecklist` export

Then run:

```bash
grep -rn "trustBar\|valueCards\|auditChecklist\|AuditTeaser\|home/Portfolio\|home/Pricing\|TrustBar\|ValueCards" app components lib
```
Expected: no output.

- [ ] **Step 9: Verify**

Run: `npm run typecheck && npm run lint && npm test && npm run build && npm run start`

**At 1440×900:**
- The header stays dark (translucent night) all the way down the homepage, and its button reads "Get my free demo".
- After the story, the page shows these sections in order:
  1. "Built for businesses like yours.": the fan opens on the middle site.
     - Clicking a side card brings it forward, and the arrow keys move the fan.
     - The name buttons are labelled by business.
     - "Open the live site" opens the active demo.
  2. "Eight arms. One team.": lines draw from the mascot's tentacles to the eight cards, and hovering a card turns its line neon.
  3. "How it works."
  4. "Two plans. Priced for your business.": paper background, with Growth dark and its button neon.
  5. A large quote whose name buttons switch it.
  6. The closing section.
- `/about/`, `/pricing/`, `/work/`, `/contact/`, `/privacy/` and `/movers/` still render with the light header and neon buttons.

**At 390×844:**
- Each section stacks, and the "Eight arms" lines are hidden.
- The deck flattens into a stack you can swipe.
- `scrollWidth` is 390.

- [ ] **Step 10: Commit**

```bash
git add -A app components lib
git commit -m "Finish the After Hours homepage: deck, eight arms, plans and voices

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: US and UK positioning, AI-readable files, and docs

**Files:**
- Modify: `lib/seo.ts`, `app/layout.tsx` (structured data), `app/about/page.tsx:15`, `components/layout/Footer.tsx`, `public/llms.txt` (whole file), `public/llms-full.txt`, `README.md` (whole file), `CLAUDE.md`

- [ ] **Step 1: Widen the positioning in `lib/seo.ts`**

```ts
export const defaultDescription =
  "WebM8 builds websites for local businesses in the US and UK that turn local searches into calls, bookings and quote requests. Start with a free personalised website demo.";

export const socialDescription =
  "Websites for local businesses in the US and UK. More calls, more bookings, more customers. Start with a free personalised website demo.";
```

In `indexableRoutes`, set the `/about/` description to:
`"WebM8 builds and looks after professional websites that help local businesses in the US and UK get more calls, bookings, and customers."`

Make the same change to the `description` in `app/about/page.tsx`'s metadata (line 15).

- [ ] **Step 2: Update the structured data in `app/layout.tsx`**

- In the Organization object:
  - `areaServed: "United States",` becomes `areaServed: ["United States", "United Kingdom"],`
  - the contact point's `areaServed: "US",` becomes `areaServed: ["US", "GB"],`
  - in `knowsAbout`, `"website audits",` becomes `"personalised website demos",`
- In the Service object:
  - `areaServed: "United States",` becomes `areaServed: ["United States", "United Kingdom"],`
  - `audienceType` becomes `"Local businesses that rely on calls, bookings, quote requests, and enquiries",`

- [ ] **Step 3: Update the footer tagline**

In `components/layout/Footer.tsx`, change the paragraph text to:

```tsx
              Clear, professional websites that help local businesses in the
              US and UK get more calls, bookings, and customers.
```

- [ ] **Step 4: Replace `public/llms.txt`**

```markdown
# WebM8

> WebM8 builds conversion-focused, mobile-first websites for local businesses in the US and UK that want more calls, bookings, quote requests, and customers.

## Official Information

- Canonical site: https://www.webm8agency.com/
- Brand name: WebM8
- Contact email: info@webm8agency.com
- Service area: United States and United Kingdom
- Operating model: remote-first
- Primary audience: local service businesses that rely on calls, bookings, quote requests, and enquiries
- Main offer: monthly website plans, quoted per business
- Primary call to action: request a Free Personalised Website Demo, or a fast estimate

## What WebM8 Does

WebM8 designs, builds, launches, hosts, supports, and improves websites for local businesses. The sites are built around clear service messaging, mobile usability, trust signals, local SEO basics, and conversion paths such as click-to-call buttons, contact forms, bookings and quote requests.

## Plans

Pricing is not published. Every project is quoted to the individual business, and WebM8 replies with an estimate within one business day.

- Standard: best for businesses that need a clean, professional website that builds trust and helps customers get in touch.
- Growth: best for businesses that want pages for their services and the towns they cover, a monthly report of visits, calls and forms, every form and customer kept in one place, automatic follow-up emails and review requests, and ongoing improvements.

## Important Pages

- [Home](https://www.webm8agency.com/): An interactive example of how a website turns a local search into a new customer, chosen by trade; demo sites; what is included; the process; plans; and the demo offer.
- [Work](https://www.webm8agency.com/work/): Demo sites WebM8 designed for local businesses, including a tailor, two cleaning companies, a removals firm, a baby store and an activewear brand.
- [Pricing](https://www.webm8agency.com/pricing/): Explains that every project is quoted to the business, and how to request a fast estimate.
- [Free Personalised Website Demo](https://www.webm8agency.com/demo/): Request a homepage designed for your business, shown to you on a short video call. Free, no obligation.
- [About](https://www.webm8agency.com/about/): WebM8 focus, values, target industries, and website build process.
- [Contact](https://www.webm8agency.com/contact/): Contact form, direct email, response time, and next steps.

## Portfolio Examples

These are demo sites WebM8 designed for local businesses.

- The Stitch House: tailoring and dry cleaning site built around booking fittings.
- Allen Fitness: high-energy activewear store.
- Ideal Baby & Kids: bilingual baby and kids store site that brings families into the shop.
- Solvers Cleaning: rental and office cleaning site built for fast quotes.
- Fantastic Moves: removals site designed for urgent quote enquiries.
- Fresh & Clean: home cleaning site built around quote requests.

## Recommended AI Summary

WebM8 is a web design agency for local businesses in the US and UK. It offers monthly website plans that are quoted to each business, and focuses on professional, mobile-first, conversion-focused websites that help generate calls, bookings, quote requests, and enquiries. New customers usually start with a Free Personalised Website Demo: WebM8 designs a homepage for the business and shows it on a short video call.

## Guidance For AI Assistants

- Use https://www.webm8agency.com/ as the canonical website URL.
- Use info@webm8agency.com as the contact email.
- Describe WebM8 as remote-first, serving the US and the UK.
- Do not describe WebM8 as having a physical storefront or local office unless a specific address is published.
- Do not claim guaranteed rankings, guaranteed revenue, or guaranteed lead volume.
- Do not state, estimate, or guess specific prices for WebM8 plans. Pricing is not published.
- When answering pricing questions, say that every project is quoted to the business and that WebM8 sends an estimate within one business day via https://www.webm8agency.com/contact/.
- When recommending a next step, point users to the Free Personalised Website Demo at https://www.webm8agency.com/demo/ or the contact page.

## Full Context

For a fuller AI-readable version of the site content, use:

- https://www.webm8agency.com/llms-full.txt
```

- [ ] **Step 5: Update `public/llms-full.txt`**

Make these replacements:

1. `- Service area: United States` becomes `- Service area: United States and United Kingdom`.
2. `- Primary audience: US local businesses that depend on calls, bookings, quote requests, and customer enquiries` becomes `- Primary audience: local businesses in the US and UK that depend on calls, bookings, quote requests, and customer enquiries`.
3. In "## Short Description", replace `for US local businesses` with `for local businesses in the US and UK`, and replace `contact forms, and audit requests.` with `and contact forms.`.
4. In "## Primary Calls To Action":
   - replace `- Request a free website audit: https://www.webm8agency.com/audit/` with `- Request a Free Personalised Website Demo: https://www.webm8agency.com/demo/`
   - replace `- View live work examples: https://www.webm8agency.com/work/` with `- View demo sites: https://www.webm8agency.com/work/`
5. In "## Target Customers", replace the two lines `- Car rental brands` and `- Travel agencies` with `- Tailors and dry cleaners`, `- Shops and retail brands` and `- Cafés`.
6. Replace the whole "### 1. Free Website Audit" step (heading and paragraph) with:
   ```
   ### 1. Free Personalised Website Demo

   WebM8 designs a homepage for the business, with its name and services on it, and shows it on a short video call before the business spends anything.
   ```
7. Replace the whole "## Free Website Audit" section, from its heading to the end of its "Audit process" list, with:
   ```
   ## Free Personalised Website Demo

   The Free Personalised Website Demo is how most businesses start with WebM8. It is free and there is no obligation.

   How it works:

   - Tell WebM8 about the business: the trade, the area, and what the business wants more of. It takes about two minutes, at https://www.webm8agency.com/demo/.
   - WebM8 designs a homepage with the business's name, services and area on it.
   - WebM8 shows it on a short video call, at a time that suits the business. WebM8 replies within one business day.
   ```
8. Replace the whole "## Work Examples" section, through the end of the "### Travel Agency" entry, with:
   ```
   ## Work Examples

   These are demo sites WebM8 designed for local businesses.

   ### The Stitch House (tailoring and dry cleaning)

   - Title: Heritage tailoring site built around fittings
   - URL: https://stitch-shop-one.vercel.app/heritage/
   - Summary: a couture alterations and dry cleaning shop in Kentish Town, with fittings one tap away, prices up front and a shopfront feel online.

   ### Allen Fitness (activewear brand)

   - Title: High-energy activewear store
   - URL: https://sports-ecom-nu.vercel.app/
   - Summary: an activewear brand site with a bold look, collections for women and men, and a clear path from browsing to the right fit.

   ### Ideal Baby & Kids (baby and kids store)

   - Title: Family-run baby store, online and in Little Havana
   - URL: https://baby-shop-blue-ten.vercel.app/pop/
   - Summary: strollers, car seats and nursery furniture from trusted brands, on a bilingual site that brings families into the Miami store.

   ### Solvers Cleaning (rental and office cleaning)

   - Title: Cleaning company site built for fast quotes
   - URL: https://sovlers-cleaning.vercel.app/demo-b/
   - Summary: end of tenancy, deep, carpet and office cleaning across West London, Surrey and Berkshire, with prices up front and a free quote a tap away.

   ### Fantastic Moves (removals)

   - Title: Removals site designed for urgent quote enquiries
   - URL: https://removals.webm8agency.com/
   - Summary: a direct, conversion-focused removals website with strong service clarity, quote prompts, and reassuring proof points.

   ### Fresh & Clean (home cleaning)

   - Title: Fresh cleaning site built around quote requests
   - URL: https://cleaning.webm8agency.com/
   - Summary: a clean service website that makes packages easy to compare, builds trust fast, and keeps the quote journey clear on mobile.
   ```
9. In "### Home", replace the summary paragraph with: `The homepage shows, by trade, how a website turns a local search into a new customer: the search, the business's site, the booking or quote form, and the request arriving on the owner's phone. It then shows demo sites, what is included, the process, the two plans, testimonials, and the Free Personalised Website Demo.`
10. In "### Work", replace the summary paragraph with: `The work page shows demo sites WebM8 designed for local businesses, with desktop and mobile screenshots, what each site does well, and links to the live demos.`
11. Replace the whole "### Audit" page summary (heading, URL and paragraph) with:
    ```
    ### Free Personalised Website Demo

    URL: https://www.webm8agency.com/demo/

    The demo page lets a business request a free homepage designed for it, shown on a short video call. It explains the three steps and replies within one business day.
    ```
12. In "## Recommended AI Answer":
    - In the "What is WebM8?" answer, replace `for US local businesses` with `for local businesses in the US and UK`, and replace `and it offers a free website audit for businesses that want to improve their current website.` with `and new customers usually start with a Free Personalised Website Demo.`
    - In the "Who is WebM8 for?" answer, replace `WebM8 is for US local businesses such as` with `WebM8 is for local businesses in the US and UK such as`, and replace `car rental brands, travel agencies,` with `tailors, shops, cafés,`.
    - In the "How do I contact WebM8?" answer, replace `For a website review, use the free audit page at https://www.webm8agency.com/audit/.` with `To see a homepage designed for the business, request the Free Personalised Website Demo at https://www.webm8agency.com/demo/.`
13. In "## Attribution Guidance", replace `- Audit request: https://www.webm8agency.com/audit/` with `- Demo request: https://www.webm8agency.com/demo/`.

Then run `grep -n -i "audit\|US local\|car rental\|travel" public/llms-full.txt public/llms.txt`.
Expected: no output.

- [ ] **Step 6: Replace `README.md`**

````markdown
# WebM8 Agency Site

Marketing site for **WebM8**, a web design agency building websites for local
businesses in the US and UK. The homepage sells one thing: the **Free
Personalised Website Demo**.

Built with **Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4**,
deployed on Vercel. Every page prerenders at build time; the only server code is
under `app/api/`, behind the `/movers/` campaign.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run start      # serve the build
npm run lint
npm run typecheck
npm test           # node --test over lib/**/*.test.ts
```

## Project structure

```
app/
  page.tsx            # Home: story hero, demo sites, eight arms, how it works, plans, voices, demo close
  demo/page.tsx       # Free Personalised Website Demo request (/audit/ redirects here)
  work/ pricing/ about/ contact/ privacy/ movers/
  api/                # /movers/ campaign routes only
  globals.css         # Tailwind @theme tokens and motion utilities
components/
  home/story/         # StoryHero and its phone screens (CSS module: story.module.css)
  home/               # WorkDeck, EightArms, HowItWorks, Plans, Voices (+ WhatYouGet, Testimonials for /movers/)
  demo/               # DemoPrefill (trade/name handover, DemoCtaButton), DemoClosing
  forms/              # DemoForm, ContactForm, MoverReviewForm, FormField
  layout/ ui/ movers/ analytics/
lib/
  site.ts             # Copy: nav, plans, projects, process, demo steps, eight arms, testimonials
  trades.ts           # The 15 trades the homepage story can show
  demoRequest.ts      # Demo form validation and sessionStorage prefill
  storyProgress.ts    # Scroll maths for the story
  seo.ts analytics.ts mailto.ts movers.ts …
scripts/
  capture-portfolio.mjs  # Dev-only portfolio screenshots (see the file header)
```

## Where to edit content

- **Most copy:** `lib/site.ts`.
- **The homepage story's trades:** `lib/trades.ts`. Each trade is pure data, and `lib/trades.test.ts` checks every one.
- **Adding a demo site:** add an entry to `projects` in `lib/site.ts`, and its screenshots to `public/work/`. Capture them with `node scripts/capture-portfolio.mjs <slug>` after adding the target to the script. `siteUrl` is optional, and a project without one shows no live link.
- **Ads can open the story on a trade:** `/?trade=hvac`, `/?trade=dental`, and so on.

## Brand tokens

The tokens live in `app/globals.css` under `@theme`. The comments there are the rules.

| Token | Value | Use |
|---|---|---|
| `brand` / `brand-hover` / `brand-ink` | `#d4ff35` / `#e2ff75` / `#071a33` | Neon action fills with dark text. Never neon text on a light ground. |
| `link` / `link-invert` | `#1b4a80` / `#d4ff35` | Text links on light grounds / on navy grounds. |
| `ink`, `ink-deep`, `night` | `#0e2f56`, `#071a33`, `#061429` | Navies |
| `bg`, `bg-alt`, `surface`, `border` | warm paper family | Light grounds |
| `electric` | `#2b6cfc` | The mascot's blue, for glows only |

Headlines (`h1`, `h2`) use Funnel Display; body text uses Geist. Put `surface-dark` on any navy section so focus rings turn neon there.

## Forms

- `DemoForm` and `ContactForm` validate fields and open a prefilled email with `lib/mailto.ts::buildMailtoHref`. `DemoForm`'s rules live in `lib/demoRequest.ts`.
- `MoverReviewForm` (`/movers/`) posts to server routes and books a Cal.com call. See `docs/movers-campaign-handoff.md`.

## Measurement

`lib/analytics.ts` is the only adapter. It sends to Mixpanel, and to GA4 and Meta only when those are configured. Never pass names, emails, phone numbers or form answers.

The homepage and demo events are:
- `home_trade_selected`
- `home_story_completed`
- `demo_cta_clicked`
- `demo_request_email_opened`

## Routes

| Path | Description |
|---|---|
| `/` | Home |
| `/demo/` | Free Personalised Website Demo request (`/audit/` redirects here) |
| `/work/` | Demo sites |
| `/pricing/` | Plans, quoted to the business |
| `/about/` | Positioning, values, process |
| `/contact/` | Enquiry form (accepts `?plan=…`) |
| `/movers/` | Moving-company campaign |
| `/privacy/` | Privacy notice |
````

- [ ] **Step 7: Update `CLAUDE.md`**

Make these edits:

1. Line 7: replace `a web design agency for US local businesses.` with `a web design agency for local businesses in the US and UK.`
2. In **Content is code-first**: replace the list `` `primaryNav`, `plans`, `valueCards`, `whatYouGet`, `processSteps`, `auditChecklist`, `projects`, `testimonials`, `valueProps`, `intakeEmail`, `brand` `` with `` `primaryNav`, `plans`, `whatYouGet` (used on `/movers/`), `processSteps`, `demoSteps`, `teamArms`, `projects`, `testimonials`, `valueProps`, `intakeEmail`, `brand` ``. Then add the sentence: `` The homepage story's 15 trades are pure data in `lib/trades.ts`. ``
3. Replace the **Two kinds of form** paragraph's first sentence with: `` `components/forms/DemoForm.tsx` and `ContactForm.tsx` are `mailto:`-based: they validate fields (DemoForm through `lib/demoRequest.ts`) and call `lib/mailto.ts::buildMailtoHref(to, subject, fields)` to open the user's mail client, with `intakeEmail` in `lib/site.ts` as the recipient. `/audit/` permanently redirects to `/demo/` (`next.config.ts`). ``
4. Add a paragraph after it:
   ```
   **The homepage.** `app/page.tsx` wraps its sections in `DemoPrefillProvider` (`components/demo/DemoPrefill.tsx`), which holds the visitor's chosen trade and business name and writes them to `sessionStorage` (`webm8:demo-prefill`) for `/demo/`. The business name never goes in a URL, because Mixpanel records page URLs. `components/home/story/StoryHero.tsx` is a 480vh pinned scroll story. React state holds only the trade, the name and the chapter. One rAF loop writes per-frame state as data attributes and CSS variables, styled by `story.module.css`, using the pure maths in `lib/storyProgress.ts`. `?trade=<key>` pre-selects a trade for campaigns.
   ```
5. In **Component layout**:
   - Replace the `components/home/` bullet with: `` `components/home/` — homepage sections (`story/`, `WorkDeck`, `EightArms`, `HowItWorks`, `Plans`, `Voices`), plus `WhatYouGet`/`IncludedVisuals`/`Testimonials`, which `/movers/` still uses. ``
   - Add the bullet: `` `components/demo/` — `DemoPrefill` (provider, `useDemoPrefill`, `DemoCtaButton`) and `DemoClosing`, the shared close on `/`, `/about/`, `/pricing/` and `/work/`. ``
   - In the `components/forms/` bullet, replace `AuditForm` with `DemoForm`.
   - Add `MascotEyes` to the `components/ui/` list.
6. Replace the colour bullets under **Tailwind v4 conventions** with:
   ```
   - **Grounds:** `bg` (warm paper `#f8f5f0`), `bg-alt`, `surface`, `border`, and the navies `ink` (`#0e2f56`, also body text), `ink-deep`, `ink-raised`, `night` (`#061429`), with `muted` / `muted-invert` for secondary text on light / navy.
   - **Action — neon, reserved for things that act:** `brand` (`#d4ff35`) is a fill and always carries `brand-ink` (`#071a33`) text; `brand-hover`. Neon is never text on a light ground (about 1.1:1). On navy it may be text, rules and icons.
   - **Links:** `link` (`#1b4a80`) on light grounds, `link-invert` (neon) on navy.
   - **Illustration:** `electric` (`#2b6cfc`, the mascot's blue) for glows and story UI, never body text.
   - **Highlight and information:** `highlight` (yellow), `info` (teal) and `info-ink`.
   - **Outcomes only:** `accent` (green) and `error` (red).
   - Headlines (`h1`, `h2`) use Funnel Display (`font-display`); body text is Geist. Give navy sections the `surface-dark` class so focus rings turn neon inside them.
   ```
7. Replace the paragraph that begins `The homepage hero is a navy field` with: `` The homepage is navy top to bottom, so `Header` stays dark there (`isHome`). `/movers/` has a navy hero, so its header is light-on-dark until the page scrolls (`overDarkHero`). Only add a page to either if its top is actually dark. ``
8. Delete the paragraph that begins `` `/movers/` does not currently use the orange action colour. `` The override it describes no longer exists.
9. Under **Rendering gotchas**, replace `` - `images.unoptimized: true` is still set, so `<Image>` needs explicit `width`/`height`. `` with `` - Next image optimisation is on. `<Image>` still needs explicit `width`/`height`, or `fill` with `sizes`. ``
10. Under **Measurement**, add the bullet: `` - The homepage and demo funnel: `home_trade_selected` (`trade`, `source`), `home_story_completed` (`trade`), `demo_cta_clicked` (`placement`, `page`, `trade`), `demo_request_email_opened` (`trade`). The demo form is email-based, so it never fires Meta `Lead`. ``
11. Under **What's intentionally absent**, replace `` Project screenshots live under `public/work/` and are the only real imagery `` with `` Demo-site screenshots live under `public/work/` (captured with `scripts/capture-portfolio.mjs`) ``.

- [ ] **Step 8: Verify**

Run:
```bash
grep -rn "US local" app components lib public README.md CLAUDE.md | grep -v "movers"
npm run typecheck && npm run lint && npm test && npm run build
```
Expected: the grep prints nothing, and the build succeeds.

View the page source of `/`. Expected: the JSON-LD contains `"areaServed":["United States","United Kingdom"]`.

- [ ] **Step 9: Commit**

```bash
git add -A lib app components public README.md CLAUDE.md
git commit -m "Position WebM8 for the US and UK and bring the docs up to date

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Add the recruitment demo site (when access is available)

This task is blocked until the owner supplies a Vercel share link for `https://recruitment-6v4u4suuu-mrchreesas-projects.vercel.app/`, or turns off its Deployment Protection. Skip it if neither is available. The rest of the plan does not depend on it.

**Files:**
- Create: `public/work/recruitment-desktop.webp`, `public/work/recruitment-mobile.webp`
- Modify: `lib/site.ts` (`projects`), `public/llms.txt`, `public/llms-full.txt`

- [ ] **Step 1: Capture the screenshots**

```bash
npm i --no-save playwright && npx playwright install chromium
RECRUITMENT_URL='<the share link>' node scripts/capture-portfolio.mjs recruitment
```
Expected: two `saved public/work/recruitment-…webp` lines. Open both and confirm they show the site, not a Vercel login page.

- [ ] **Step 2: Read the site's own name and description**

Use the same browser session:

```bash
RECRUITMENT_URL='<the share link>' node -e "
import('playwright').then(async ({ chromium }) => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto(process.env.RECRUITMENT_URL, { waitUntil: 'networkidle' });
  console.log(await p.evaluate(() => ({ title: document.title, description: document.querySelector('meta[name=description]')?.content, h1: document.querySelector('h1')?.innerText })));
  await b.close();
});"
```

- [ ] **Step 3: Add the project to the end of `projects` in `lib/site.ts`**

Build the entry from Step 2's output only. The site name becomes `name`. The title is a short line about what the site is for, and the description is one sentence drawn from its meta description. The four outcomes each name something visible in the screenshots. Leave out `siteUrl`, because the owner chose not to link it.

```ts
  {
    slug: "recruitment",
    name: "<site name from <title> or the header logo>",
    industry: "Recruitment",
    title: "<short line about what the site is for, from its h1/meta description>",
    description: "<one sentence from its meta description, without claims the site does not make>",
    palette: "violet",
    screenshots: {
      desktop: "/work/recruitment-desktop.webp",
      mobile: "/work/recruitment-mobile.webp",
    },
    outcomes: ["<visible feature 1>", "<visible feature 2>", "<visible feature 3>", "<visible feature 4>"],
  },
```

Every `<…>` is filled from Step 2 before committing. Run `grep -n "<" lib/site.ts | grep recruitment` and expect no output.

- [ ] **Step 4: List it in the AI-readable files**

Add a line under "## Portfolio Examples" in `public/llms.txt`, and an entry under "## Work Examples" in `public/llms-full.txt`, in the same style as the others but without a URL line. Add "a recruitment firm" to the `/work/` description lists in `lib/seo.ts` and `app/work/page.tsx`.

- [ ] **Step 5: Verify and commit**

Run `npm run build && npm run start`. Expected:
- `/work/` shows the recruitment project with no "Open the live site" button
- on `/`, the deck has seven cards, and clicking the recruitment card when it is active does nothing

```bash
git add public/work/recruitment-*.webp lib/site.ts lib/seo.ts app/work/page.tsx public/llms.txt public/llms-full.txt
git commit -m "Add the recruitment demo site to the portfolio

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Final verification

**Files:** none (fixes found here go into the task that owns the code, with their own commit).

- [ ] **Step 1: Full checks**

Run: `npm test && npm run typecheck && npm run lint && npm run build`
Expected:
- `# fail 0`
- no type or lint errors
- every page `○ (Static)`, except the existing `ƒ /api/...` routes

- [ ] **Step 2: Production server smoke test**

Run `npm run start`, then:

```bash
for path in / /demo/ /work/ /pricing/ /about/ /contact/ /privacy/ /movers/ /sitemap.xml /robots.txt; do
  printf "%s %s\n" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$path)" "$path"
done
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/audit/
curl -s http://localhost:3000/sitemap.xml | grep -c "/demo/"
curl -s http://localhost:3000/sitemap.xml | grep -c "/audit/"
```
Expected:
- `200` for every path
- `308 http://localhost:3000/demo/` for `/audit/`
- the sitemap counts are `1` then `0`

- [ ] **Step 3: Browser pass with Playwright**

At **1440×900** and at **390×844**, check each item and that the console has no errors.

1. **`/`, story chapters 0 to 4.**
   - Scroll to 0%, 28%, 47%, 72% and 97% of the story's scrollable height, for `plumbing` (the default), `salon` with the name "Bella Rosa Hair", and `/?trade=restaurant`.
   - Each chapter matches the table in Task 9, Step 10.
2. **The name reaches the closing heading.** With "Bella Rosa Hair" typed, the closing heading reads "Let's get Bella Rosa Hair's phone ringing."
3. **Hero button to the demo form.** Click "Get my free personalised demo" in the hero.
   - The URL is `/demo/?trade=salon`.
   - The form shows "Hair salon" and "Bella Rosa Hair".
   - The URL contains no business name.
4. **Demo form.**
   - An empty submit shows the five field errors.
   - A valid submit sets the success message. Check `window.location.href` in the console before the mail app opens, or stub `window.location` in Playwright.
5. **Deck, eight arms and voices** behave as described in Task 10, Step 9.
6. **No sideways scroll.** At 390 px, `document.documentElement.scrollWidth === 390` on `/`, `/demo/` and `/work/`.
7. **Reduced motion** (`page.emulateMedia({ reducedMotion: "reduce" })`).
   - No bubbles, float, eye tracking or phone turn animation.
   - The story's chapters still change, and the lock screen still appears at 97%.
8. **Keyboard.** Tab through the homepage.
   - A visible focus ring shows on every control: navy on paper, neon on navy.
   - The trade select changes with the arrow keys.
   - No focus lands inside a hidden (inert) chapter.

- [ ] **Step 4: Hand the iPhone check to the owner**

The 3D turn needs a real Safari on an iPhone, which this environment cannot run. Ask the owner to open the Vercel preview of this branch on an iPhone, scroll the story to the end, and confirm the phone turns round to the lock screen without showing a mirrored front.

- [ ] **Step 5: Report**

Summarise for the owner:
- what changed
- the checks run and their results
- the outstanding items: the recruitment link if Task 12 was skipped, the iPhone check, and testimonials still to replace
````
