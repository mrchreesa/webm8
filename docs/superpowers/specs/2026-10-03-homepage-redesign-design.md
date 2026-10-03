# Homepage redesign ("After Hours"), neon brand and Free Personalised Website Demo

Date: 2026-10-03
Status: design approved in conversation; the owner's answers on the portfolio, market and demo copy are folded in (section 9).

## Goal

A visitor who runs a local business in the US or the UK should land on the homepage and know, within a few seconds, that WebM8 builds websites that bring that kind of business customers, and that they are in good hands. The page has to feel modern and alive (interactive, animated, clearly made by people who are good at this) while staying fast, readable on a phone, and honest.

The page sells one thing: the **Free Personalised Website Demo**.

## Decisions already made

| Topic | Decision |
|---|---|
| Direction | Drop B, "After Hours": dark navy, cinematic scroll story, Funnel Display headlines. |
| Hero | The visitor picks their trade and may type their business name. The scroll story then plays out one of their customers' journeys, using a site generated for that trade with their name on it. |
| Trades | Home services, moving, food and hospitality, health/beauty/wellness, plus "something else" (15 entries, listed in section 2.1). |
| Action colour | Neon `#d4ff35` replaces orange as the action colour **across the whole site**. |
| Offer wording | "Free Personalised Website Demo" (British spelling, kept deliberately). Buttons read "Get my free personalised demo"; the short header button reads "Get my free demo". |
| Demo request | A simple email-based form for now (same mechanism as today's contact form). The movers-style server journey stays on `/movers/` and may be generalised later. |
| Testimonials | Keep the current three for now; the owner will replace them. |
| Portfolio | Replace the examples (section 3). Keep only Fresh & Clean (cleaning) and Fantastic Moves (removals) from the old set. Present the set as demo sites WebM8 designed for local businesses. |
| Market | The US and the UK. Positioning copy says "local businesses in the US and UK". |
| Demo details | Confirmed: the demo is shown on a short video call, and WebM8 replies within one business day. |

## Reference prototype

`deliverables/homepage-design-drops/drop-b-after-hours.html` (untracked, served locally during review) is the visual reference for layout, motion and copy. Where this document and the prototype differ, this document wins.

## Scope

In:

1. Site-wide brand switch: tokens, buttons, links, focus, headline typeface, header.
2. New homepage built from the prototype.
3. Portfolio replaced with the new set of example sites, with fresh screenshots.
4. New `/demo/` request page; `/audit/` retired with a permanent redirect.
5. Measurement events for the new journey.
6. Positioning copy widened from "US local businesses" to "local businesses in the US and UK" (section 2.9).
7. `CLAUDE.md` and `README.md` brought up to date.

Out:

- Generalising the `/movers/` request, booking and materials journey to all trades.
- New testimonials.
- A redesign of `/movers/` (it only inherits the new tokens and fonts).
- UK-flavoured versions of the story's examples (postcodes, UK phone numbers). The story keeps its US examples for now; a later `?region=uk` variant can swap them.
- Any CMS, CRM or email-notification work.

---

## 1. Brand system (site-wide)

### 1.1 Tokens (`app/globals.css`, `@theme`)

| Token | Value | Role |
|---|---|---|
| `--color-brand` | `#d4ff35` | Action fills: primary buttons, the active state of choices. Never text on a light ground. |
| `--color-brand-hover` | `#e2ff75` | Hover for brand fills. |
| `--color-brand-ink` | `#071a33` | Text and icons placed on a brand fill (contrast about 15:1). |
| `--color-link` | `#1b4a80` | Text links and inline actions on light grounds. |
| `--color-link-invert` | `#d4ff35` | Text links and inline actions on navy grounds. |
| `--color-electric` | `#2b6cfc` | The mascot's blue. Glows, illustration accents, story UI. Not for body text. |
| `--color-night` | `#061429` | Deepest ground (homepage story, closing). |
| `--color-ink`, `--color-ink-deep`, `--color-ink-raised`, `--color-muted`, `--color-muted-invert`, `--color-bg`, `--color-bg-alt`, `--color-surface`, `--color-border` | unchanged | Grounds and text. |
| `--color-accent`, `--color-error`, `--color-highlight`, `--color-info`, `--color-info-ink` | unchanged | Outcomes, highlight, information. |
| `--shadow-cta` | neon glow, `0 14px 40px -12px rgb(212 255 53 / .55)` | Hover lift for primary buttons. |

Removed: `--color-signal` and the orange values. `--color-neon` and `--color-neon-soft` fold into `brand` and `brand-hover`, so the Header's logo chip (`bg-neon`) becomes `bg-brand text-brand-ink`.

Rules, to replace the colour comments in `globals.css` and the colour section of `CLAUDE.md`:

- Neon is a fill, never text on paper or white (about 1.1:1). On navy grounds neon may be text, rules and icons.
- A brand fill always carries `brand-ink` text.
- Links on light grounds use `link`; on navy grounds they use `link-invert`.
- Focus outline: `ink` on light grounds, `brand` on navy grounds. Implement as a `:focus-visible` default of `ink`, overridden inside a `.surface-dark` scope (see 1.4).

### 1.2 Typeface

- Headlines: **Funnel Display** on every `h1` and `h2` site-wide, set in the base layer of `globals.css`. An `h3` uses it only when a component opts in with the `font-display` utility (display-sized `h3`s on the homepage and in plan cards); smaller `h3`s stay Geist. Funnel Display uses, weights 600 to 800, with tracking `-0.035em`, line-height about 0.96 at display sizes. Loaded with `next/font/google` as `--font-display`. If the installed Next font list lacks it, self-host the variable file with `next/font/local`.
- Body and UI: Geist (unchanged). Geist Mono only where it is today.
- Remove Manrope, DM Sans and Caveat from `app/layout.tsx` once nothing references them (today only `FinalCta` does).
- Add a `font-display` utility, and apply it in `Section`, `PageHero` and the new homepage sections. Body copy stays sentence case. No all-caps eyebrows on the new homepage.

### 1.3 Components

- `Button` / `LinkButton`:
  - `primary` becomes a neon fill with `brand-ink` text and the neon hover glow. The `btn-shine` sweep is dropped.
  - `ghost` stays white on light grounds.
  - Add `ghost-invert` (translucent white on navy).
  - `dark` and `outline-invert` are kept for navy grounds.
- `Eyebrow`: the `brand` tone becomes `link` colour. The homepage does not use eyebrows.
- `FormField`: the focus ring uses `ink` (light) or `brand` (dark), not orange.
- Every current `text-brand`, `border-brand`, `bg-brand/10` and `from-brand` use (about 30, across `about`, `work`, `contact`, `pricing`, `privacy`, `not-found`, `/movers/` components, `Footer`, `Header`, `Portfolio`, `Pricing`, `WhatYouGet`, `Testimonials`, `IncludedVisuals`) is reviewed one by one:
  - text and links move to `link`
  - decorative tints move to `ink/5` or `info`
  - fills move to `brand` with `brand-ink`

  The plan lists each file.

### 1.4 Header

- On `/`: transparent over the story hero, then translucent night (`rgb(6 20 41 / .72)` with a blur) once scrolled. It stays dark for the whole homepage.
- On other pages: the light header as today, with the neon button.
- `/movers/` keeps its own nav and "Book my free review" button (its offer is unchanged), now in neon.
- Button: "Get my free demo" linking to `/demo/`.
- `primaryNav`: "Free Review" becomes "Free Demo" (`/demo`).
- Logo: unchanged (mascot plus "Web" with the neon "M8" chip).
- Introduce a `.surface-dark` class on navy sections that sets focus and link colours for descendants.

---

## 2. Homepage

Order in `app/page.tsx`. The demo pieces live in `components/demo/`, because `/about/`, `/pricing/` and `/work/` share them:

1. `StoryHero`
2. `WorkDeck`
3. `EightArms`
4. `HowItWorks`
5. `Plans`
6. `Voices`
7. `DemoClosing`

A client `DemoPrefillProvider` (`components/demo/DemoPrefill.tsx`) wraps them, so the trade and business name chosen in the hero reach the closing section and the demo page.

All copy below is final unless marked. It comes from the prototype.

### 2.1 StoryHero (client)

**Structure.** A section `480vh` tall containing a `100svh` sticky stage. Scroll progress `p` (0 to 1) drives five chapters, with bounds `[0, .10, .32, .54, .76, 1]`.

| # | Copy (title / body) | Phone shows |
|---|---|---|
| 0 | `h1` "Websites that make your phone ring." / "WebM8 designs, builds and looks after websites for local businesses in the US and UK. Pick your trade, then scroll to see how one turns a search into a new customer." Then the picker, then "Get my free personalised demo" and "See our work". | Search screen with "Searched near you today": the selected trade's query highlighted first, then four other trades' queries. |
| 1 | `trade.need` (e.g. "Someone nearby needs a plumber.") / "Right now, people in your area are searching for exactly what you do. Most of them are on a phone." | The query types itself, a map and three results appear, the top result (their business) is highlighted, and "Website" is tapped. |
| 2 | "They find a site that looks the part." / "Clear, quick and built for the small screen. Within seconds they know they're in the right place." | The generated trade site (logo initial and name, hero, rating pill, main button, call button, three services, sticky "Call now" bar). It scrolls slightly, then the main button is tapped. |
| 3 | "Saying yes takes one tap." / "A booking or quote form right where they need it, or a button that calls you. No hunting for a phone number." | The trade's form fills its four fields one by one, the button is pressed, then "Request sent" with `"{name} {trade.form.done}"`. |
| 4 | "And your phone lights up." / "That's the whole job of a website. We build it, host it and keep it working, so you can get on with yours." Then "Get my free personalised demo". | The phone turns around (3D, scrubbed by scroll) to the owner's lock screen. The trade's notification lands with a neon ring, then "Your customer got their confirmation". The phone buzzes. |

**Progress rail.** Four labelled segments: Search, Site, Request, Call. Each fills with its chapter, and clicking one scrolls to that chapter.

**Picker** (chapter 0).

- A sentence: "Show me how it works for my [select]". The select is styled as neon underlined text and sized to the chosen label. Options are grouped:
  - Home services: cleaning business, HVAC company, plumbing business, electrical business, roofing company, landscaping business.
  - Moving: moving company.
  - Food and hospitality: restaurant, café.
  - Health, beauty and wellness: hair salon, barbershop, med spa, dental practice, gym or fitness studio.
  - Something else: local business.
- "Your business name (optional)": a text input, `maxlength` 30, `autocomplete="organization"`.
- Hint: "This stays in your browser until you ask for your demo."
- When a name is typed, it appears in the top search result, the site logo and initial, the form header, the success text, and the closing heading. With no name, each trade's example name is used.
- Changing the trade re-renders all trade content immediately and gives the phone a small nudge animation.

**Default and campaigns.** The page is server-rendered with `plumbing`, so the `h1` and chapter text are in the HTML. After hydration, `?trade=<key>` (when it is a valid key) selects that trade. Read `window.location` in an effect, not `useSearchParams`, so the page stays static without a Suspense boundary.

**Trade data.** A new `lib/trades.ts` holds the trades. It is pure data plus helpers, with no React.

```ts
type TradeKey = "cleaning" | "hvac" | "plumbing" | "electrical" | "roofing" | "landscaping"
  | "moving" | "restaurant" | "cafe" | "salon" | "barber" | "medspa" | "dental" | "fitness" | "other";

type Trade = {
  key: TradeKey;
  group: "Home services" | "Moving" | "Food and hospitality" | "Health, beauty and wellness" | "Something else";
  label: string;            // "plumbing business", reads after "for my"
  exampleName: string;      // "Reyes Plumbing"
  need: string;             // chapter 1 title
  query: string;            // "plumber near me"
  category: string;         // "Plumber, open 24 hours"
  reviewCount: number;
  competitors: [Competitor, Competitor];          // { name, rating: "3.8 (41)" }
  site: { headline: string; sub: string; cta: string; phone: string; services: [string, string, string] };
  form: { title: string; sub: string; fields: [Field, Field, Field, Field]; button: string; done: string };
  notification: { title: string; body: string };
  palette: { primary: string; deep: string; accent: string; accentInk: string; soft: string; ink: string; serif?: boolean };
};
export const trades: Record<TradeKey, Trade>;
export const defaultTrade: TradeKey = "plumbing";
export function parseTrade(value: string | null | undefined): TradeKey | null;
export const tradeGroups: { group: Trade["group"]; keys: TradeKey[] }[];
```

The content of every trade is the content in the prototype's `TRADES` object. Phone numbers stay in the fictional `555-01xx` range. All names, ratings and requests are examples. Chapter 0's lede says "see how one turns a search", and the story's `aria-label` reads "An example of how a website turns a local search into a new customer".

**Trade icons.** A `TradeIcon` component holds the 15 stroke icons from the prototype.

**Rendering approach.**

- React state holds only `tradeKey`, `businessName` and `chapter`.
- Per-frame work (progress, typing, form fill, flip angle, rail fills) happens in a single `requestAnimationFrame` handler that writes CSS custom properties, classes and `textContent` through refs. It is passive and runs only while the section is near the viewport (IntersectionObserver).
- The phone is split into `SearchScreen`, `TradeSite`, `RequestForm` and `LockScreen`. Each is a presentational component taking `trade` and `name`.
- No animation library.

**Phones (< 960px).**

- Copy sits at the top. The phone is absolutely placed above the rail at `min(58svh, 520px)` tall.
- When the active chapter's copy reaches into the phone's space (chapter 0, with the picker), the phone is translated down so it peeks up from below.
- From chapter 1 on it rises fully into view. Each chapter is `align-self: start`, so its height is its own.

**Accessibility.**

- Only the active chapter is exposed. The others are `inert`.
- The phone is `aria-hidden` (decorative).
- The picker has a real `<label>`, and every control works with a keyboard.
- The select keeps native behaviour.

**Reduced motion.**

- The chapters still follow scroll, but transitions are instant.
- The phone switches faces without turning, and there is no buzz, nudge, tilt or float.

### 2.2 WorkDeck (client)

- Heading "Built for businesses like yours." / "Demo sites we designed for local businesses. Pick one to take a closer look." The line states no count, so adding sites needs no copy change.
- A 3D fan of browser-framed desktop screenshots, each with a phone showing the mobile screenshot. The active card is centred and the rest fan out (translateX, translateZ, rotateY, dimmed).
- It opens on the middle project.
- **Ways to change the active card:**
  - clicking a card brings it forward, and clicking the active card opens the live site
  - the arrow keys
  - a horizontal swipe
  - a row of buttons labelled by business name
- Below the fan: the industry, a description and, when the project has a `siteUrl`, "Open the live site" (new tab, `rel="noreferrer"`). A project without a `siteUrl` shows no link, and clicking its active card does nothing.
- On narrow screens the fan flattens (no rotateY) into a swipeable stack.
- Data: `projects` from `lib/site.ts`. Adding a project adds a card. No other change is needed.

### 2.3 EightArms (client for the connector lines only)

- "Eight arms. One team." / "Everything your website needs, handled by the same people for as long as you're with us. You never have to chase three different companies."
- The mascot sits in the centre, with four items on each side.
- SVG curves run from the mascot's tentacle tips (fractions of its box: `[.1,.47]`, `[.08,.65]`, `[.25,.81]`, `[.37,.87]`, mirrored on the right) to each item.
- The lines draw once when the section enters view. Hover or focus on an item lights its line and card in neon.
- Lines are hidden below 1024px (Tailwind `lg`), where the layout becomes the mascot above a list.
- New data in `lib/site.ts`, `teamArms` (title, one line):
  1. Design that earns trust
  2. Built for phones first
  3. Found in local searches
  4. Ready for AI search
  5. Tap to call, easy to quote
  6. Know where calls come from
  7. Hosting and security
  8. Changes when you need them

### 2.4 HowItWorks (client for the line fill)

- A sticky heading "How it works." / "You'll always know what's happening, what we need from you, and what happens after launch."
- Four steps on a vertical line. A neon fill tracks reading position, and each step lights as it passes 60% of the viewport height.
- `processSteps` in `lib/site.ts` gains a `need` field and a new step 1:

| # | Title | Body | From you |
|---|---|---|---|
| 1 | Free personalised demo | We design a homepage for your business, with your name and services on it, and show it to you before you spend a cent. | Two minutes to tell us about your business |
| 2 | Website plan | We plan the pages, the wording and the buttons around how your customers search and decide. | A 15-minute call |
| 3 | Design and build | We write and build your site so it looks the business and works properly on phones. | Your logo and a few photos |
| 4 | Launch and improve | We put it live, host it and look after it, and keep improving it so it keeps bringing in work. | Nothing, unless you want a change |

- Replaces `Process` on `/about/` as well.

### 2.5 Plans (server)

- Paper ground for contrast. "Two plans. Priced for your business." / "Every project is quoted to the business, so you only pay for what you need. Pick the plan that fits and we'll send you a number."
- Standard is a white card. Growth is a night card with the "Best value" neon badge.
- The data in `plans` is unchanged.
- Both buttons read "Get a fast estimate" and link to `/contact/?plan=<id>` (unchanged).
- Footnote: "No large upfront website cost. Monthly support included. Cancel anytime."

### 2.6 Voices (client)

- One large quote in Funnel Display, with a row of name buttons (initials, name, role) to switch between `testimonials`. The quote crossfades and sits in an `aria-live="polite"` region.
- Data unchanged until the owner replaces it. `Testimonials` stays for `/movers/`.

### 2.7 DemoClosing (shared; replaces `FinalCta`)

- Night ground with a soft electric-blue glow and rising bubbles (decorative, `aria-hidden`).
- The mascot's eyes follow the pointer and blink, using the SVG overlay from the prototype on top of `mascot.png`.
- Heading: "Let's get your phone ringing." When a business name has been entered on the homepage, it reads "Let's get {name}'s phone ringing." (possessive handles a trailing "s").
- "Start with a Free Personalised Website Demo. We design a homepage for your business and show it to you, before you spend a cent."
- Three numbered steps:
  1. **Tell us about your business.** Your trade, your area and what you want more of. It takes about two minutes.
  2. **We design your homepage.** With your name, your services and your area on it.
  3. **We show it to you.** On a short video call, at a time that suits you.
- Button "Get my free personalised demo" linking to `/demo/` (with `?trade=<key>` on the homepage), with "No payment. No obligation. We reply within one business day."
- Used on `/`, `/about/`, `/pricing/` and `/work/`. On pages other than `/` it shows the generic heading.

### 2.8 Demo prefill

- `DemoPrefillProvider` keeps `{ trade, business }`. Every picker change writes it to `sessionStorage` under `webm8:demo-prefill`, inside try/catch.
- Homepage buttons link to `/demo/?trade=<key>`. The business name never goes in a URL.
- `/demo/` reads `?trade=` first, then `sessionStorage`.

### 2.9 Positioning copy (US and UK)

Every "US local businesses" phrase outside `/movers/` becomes "local businesses in the US and UK", or is reworded to drop the region where it reads better. The places:

- `lib/seo.ts`: `defaultDescription`, `socialDescription` and the `/about/` description.
- `app/layout.tsx` structured data:
  - `areaServed` becomes `["United States", "United Kingdom"]`.
  - The contact point's `areaServed` becomes `["US", "GB"]`.
  - The audience text drops "US".
- `app/about/page.tsx` metadata, and the `Footer` tagline.
- `public/llms.txt` and `public/llms-full.txt`.
- `README.md` and `CLAUDE.md`'s project line.

`/movers/` keeps its US-only copy, because its pricing is in dollars and its campaign is American.

---

## 3. Portfolio

`projects` in `lib/site.ts` becomes:

| Name | Industry label | Live URL | Notes |
|---|---|---|---|
| Fantastic Moves | Removals | https://removals.webm8agency.com/ | Kept; existing screenshots. |
| Fresh & Clean | Home cleaning | https://cleaning.webm8agency.com/ | Kept; existing screenshots. |
| Allen Fitness | Activewear brand | https://sports-ecom-nu.vercel.app/ | Hide the "Design preview" switcher when capturing. |
| The Stitch House | Tailoring and dry cleaning | https://stitch-shop-one.vercel.app/heritage/ | Hide the "Compare designs" pill when capturing. UK business. |
| Solvers Cleaning | Rental and office cleaning | https://sovlers-cleaning.vercel.app/demo-b/ | UK business. |
| Recruitment site (name from its own header) | Recruitment | none (no live link, by the owner's choice) | Screenshots only. Capturing them needs access past Vercel's login (section 9, item 1). |
| Ideal Baby & Kids | Baby and kids store | https://baby-shop-blue-ten.vercel.app/pop/ | Miami. |

- `Project` gains `name` (business name, used on the deck buttons), and `siteUrl` becomes optional. It keeps `industry`, `title`, `description`, `screenshots` and `outcomes`. `/work/` and the JSON-LD omit the link when `siteUrl` is absent.
- Titles, descriptions and outcomes for the new sites are written from each site's own content. The plan contains the text, and nothing is claimed that the sites don't show.
- `palette` stays optional for `BrowserMockup`'s fallback.
- **Screenshots:**
  - Captured with Playwright: desktop at 1600×900 and mobile at 420 wide, top of page, after fonts and images load.
  - Demo overlays are hidden with injected CSS.
  - Saved as WebP (quality about 80) at `public/work/<slug>-desktop.webp` and `<slug>-mobile.webp`.
  - Old screenshots for restaurant, car rental and travel are deleted.
- **Other places that change:**
  - The `/work/` title and description in `lib/seo.ts`: "Website examples" and "demo sites WebM8 designed for local businesses", naming the trades.
  - `public/llms.txt` and `public/llms-full.txt`.
  - Mentions of the old projects in `app/about/page.tsx`.
  - The JSON-LD `ItemList` in `app/layout.tsx` follows `projects` automatically.
  - `/work/` renders the new list unchanged in structure, restyled by the token switch. Its copy changes from "live websites" to the demo-site framing.

---

## 4. Demo request page (`/demo/`)

- `app/demo/page.tsx` uses `createPageMetadata`:
  - title "Free Personalised Website Demo"
  - description "Tell us about your business and we'll design a homepage for you, with your name and services on it, and show it to you on a short call. Free, no obligation."
- `/demo/` is added to `indexableRoutes`, and `/audit/` is removed from it.
- **Layout:** a light page.
  - On the left: the heading "Your free personalised website demo", and the three closing steps.
  - On the right: `DemoForm`.
- **`DemoForm`** (client, email-based like `ContactForm`):

| Field | Required | Notes |
|---|---|---|
| Business name | yes | Prefilled from the hero |
| Type of business | yes | Select built from `tradeGroups`; prefilled |
| Your name | yes | |
| Email | yes | |
| Phone | no | |
| City or service area | yes | |
| Current website | no | |
| What do you want more of? | no | Calls, bookings, quote requests… (textarea) |

- **Validation:** in a new `lib/demoRequest.ts` (`validateDemoRequest`, `demoRequestMailFields`), unit-tested.
- **Submit:** `buildMailtoHref(intakeEmail, "Website demo request from {business}", fields)`, with source "WebM8 marketing site, /demo".
- **Success state:** "Your email app should open with your request filled in. Press send and we'll reply within one business day." The intake address shows as a copyable fallback in case no mail app opens.
- **Retire `/audit/`:**
  - Permanent redirects `/audit` and `/audit/` to `/demo/` in `next.config.ts`.
  - Delete `app/audit/`, `AuditForm`, `AuditTeaser` and `auditChecklist`.
  - Update every `/audit` link (Header, Footer, `app/work/page.tsx`, `lib/site.ts`).

---

## 5. Files

New:

- `lib/trades.ts`, `lib/demoRequest.ts` and `lib/storyProgress.ts`, each with a `.test.ts`
- `components/home/story/`: `StoryHero`, `TradePicker`, `SearchScreen`, `TradeSite`, `RequestForm`, `LockScreen`, `StoryBackdrop`, `StatusBar`, `TradeIcon`, `icons.tsx`, `story.module.css`
- `components/home/WorkDeck.tsx`, `EightArms.tsx`, `HowItWorks.tsx`, `Plans.tsx`, `Voices.tsx`
- `components/demo/DemoPrefill.tsx`, `components/demo/DemoClosing.tsx`
- `components/ui/MascotEyes.tsx`, `components/forms/DemoForm.tsx`
- `app/demo/page.tsx`
- `scripts/capture-portfolio.mjs`
- new `public/work/*.webp`

Changed:

- `app/globals.css`, `app/layout.tsx`, `app/page.tsx`
- `app/about/page.tsx`, `app/pricing/page.tsx`, `app/work/page.tsx`, `app/contact/page.tsx`, `app/privacy/page.tsx`, `app/not-found.tsx`
- `components/layout/Header.tsx`, `components/layout/Footer.tsx`
- `components/ui/Button.tsx`, `components/ui/Eyebrow.tsx`, `components/ui/AmbientBlobs.tsx`, `components/ui/BrowserMockup.tsx`
- `components/forms/FormField.tsx`
- brand-colour uses in `components/movers/*`, `components/forms/MoverReviewForm.tsx` and `components/home/{WhatYouGet,IncludedVisuals,Testimonials}.tsx`
- `lib/site.ts`, `lib/seo.ts`
- `next.config.ts`
- `public/llms*.txt`, `CLAUDE.md`, `README.md`

Deleted:

- `components/home/{Hero,AuditTeaser,FinalCta,Process,Portfolio,Pricing,TrustBar,ValueCards}.tsx`. `TrustBar` and `ValueCards` are already unused.
- `components/forms/AuditForm.tsx`, `app/audit/`
- the `trustBar`, `valueCards` and `auditChecklist` data
- old restaurant, car-rental and travel screenshots

Each deletion is checked with a repo-wide search before it happens.

## 6. Measurement

All through `trackEvent`. Values are trade keys and placements only, never names, emails or form answers.

| Event | Details | When |
|---|---|---|
| `home_trade_selected` | `trade`, `source: "picker" \| "url"` | Picker change, or a valid `?trade=` on load |
| `home_story_completed` | `trade` | First time chapter 4 is reached in a page view |
| `demo_cta_clicked` | `trade` (when known), `placement: "header" \| "hero" \| "story_end" \| "closing"`, `page` | Any demo button click |
| `demo_request_email_opened` | `trade` | `DemoForm` passes validation and opens the mail app |

No Meta `Lead` event. `Lead` stays reserved for server-confirmed requests, per the existing rule.

## 7. Accessibility, motion, performance

- **Reduced motion**, via `prefers-reduced-motion`. These are disabled:
  - the phone flip and buzz, nudge, pointer tilt, mascot float and eye tracking, bubbles, and line drawing
  - instead, the end states show immediately
- **Accessibility:**
  - Contrast follows the token rules in 1.1. Focus is always visible.
  - Every interactive element is a native button, link, select or input.
  - Hidden chapters are `inert`.
- **Performance:**
  - No new runtime dependencies.
  - Scroll work runs in one passive, rAF-throttled handler per component, paused when off screen.
  - The hero's largest content is text, so it renders without waiting for images.
  - Deck screenshots are lazy-loaded.
  - Next image optimisation is on (`CLAUDE.md` says otherwise and is corrected), so the 945 KB `mascot.png` is served resized. Every `<Image>` still gets explicit sizes, or `fill` with `sizes`.
- **Static rendering:** every page still prerenders. No new server routes.

## 8. Testing and verification

- `npm test`:
  - `trades.test.ts`:
    - 15 unique keys and queries, and four non-empty form fields each.
    - `parseTrade` accepts every key and rejects anything else.
    - WCAG contrast ≥ 4.5:1 for `accentInk` on `accent` and white on `primary`.
  - `demoRequest.test.ts`: required fields, email shape, and that mail fields omit empty values.
- `npm run lint`, `npm run typecheck`, `npm run build`: all clean.
- Playwright, against `next start`:
  - Story chapters 0 to 4 at 1440×900 and 390×844, for at least three trades.
  - `?trade=dental`, a typed name reaching the closing heading, and the deck, arms, how-it-works and demo pages.
  - `/audit` and `/audit/` both redirecting to `/demo/`.
  - No console errors and no horizontal scroll at 390 px.
  - Reduced-motion run.
- Manual, by the owner: the 3D flip on a real iPhone in Safari.

## 9. Owner decisions and remaining item

Decided on 2026-10-03:

- **Recruitment site:** no live link; use it only for preview screenshots.
- **Framing:** the portfolio is presented as demo sites WebM8 designed for local businesses.
- **UK examples:** fine. WebM8 targets both the US and the UK (section 2.9).
- **Demo details:** "a short video call" and "we reply within one business day" are correct.
- **Testimonials:** replaced later by the owner (unchanged here).

Remaining:

1. **Access to the recruitment preview for screenshots.** The deployment is behind Vercel's login. Any of these works:
   - a Vercel share link (the deployment's Share button makes a URL that skips the login for a while)
   - turning off Deployment Protection briefly
   - sending the two screenshots

   Until then, the deck ships with six projects. The seventh is a one-entry addition with no code change.
