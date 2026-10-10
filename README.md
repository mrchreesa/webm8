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
  demo/page.tsx       # Meta Instant Form destination, with examples and next steps
  free-demo/page.tsx  # Website enquiry form for normal site visitors
  work/ pricing/ about/ contact/ privacy/ movers/
  api/                # demo-request (/demo/) and the /movers/ campaign routes
  globals.css         # Tailwind @theme tokens and motion utilities
components/
  home/story/         # StoryHero and its phone screens (CSS module: story.module.css)
  home/               # WorkDeck, EightArms, HowItWorks, Plans, Voices (+ WhatYouGet, Testimonials for /movers/)
  demo/               # The /demo/ page (DemoHero, DemoDeck, DemoJourney, DemoSketch, …), plus DemoCtaButton and DemoClosing
  forms/              # ContactForm, MoverReviewForm, FormField
  layout/ ui/ movers/ analytics/
lib/
  site.ts             # Copy: nav, plans, projects, process, demo steps, eight arms, testimonials
  trades.ts           # The 15 trades the homepage story can show
  demoRequest.ts      # /demo/ request validation, shared by the form and its route
  demoEmail.ts        # The two /demo/ emails; resend.ts sends them
  storyProgress.ts    # Scroll maths for the story
  seo.ts analytics.ts mailto.ts movers.ts …
scripts/
  capture-portfolio.mjs  # Dev-only portfolio screenshots (see the file header)
```

## Where to edit content

- **Most copy:** `lib/site.ts`.
- **The homepage story's trades:** `lib/trades.ts`. Each trade is pure data, and `lib/trades.test.ts` checks every one.
- **Adding a demo site:** add an entry to `projects` in `lib/site.ts`, and its screenshots to `public/work/`. Capture them with `node scripts/capture-portfolio.mjs <slug>` after adding the target to the script. `siteUrl` is optional, and a project without one shows no live link. To show it in the homepage phone for a trade, give the target a `phone.button` selector, run the script with `--phone`, copy the numbers it prints into the project's `screenshots.phone`, and set that trade's `site` to `{ project: "<slug>" }` in `lib/trades.ts`.

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

- `/free-demo/` (`components/demo/DemoRequest.tsx`) posts to `/api/demo-request/`, which saves the request to Supabase (`agency_review_requests`, `request_type = 'demo'`) and emails WebM8 and the visitor through Resend. Success shows only once the row exists. Rules live in `lib/demoRequest.ts`. `/demo/` is the destination after a Meta Instant Form and has no second enquiry form.
- `ContactForm` validates fields and opens a prefilled email with `lib/mailto.ts::buildMailtoHref`.
- `MoverReviewForm` (`/movers/`) posts to server routes and books a Cal.com call. See `docs/movers-campaign-handoff.md`.

## Measurement

`components/analytics/WebsiteAnalytics.tsx` mounts the measurement: native WebM8 tracking and the configured Meta/Mixpanel integrations. There is no consent prompt; DNT/GPC keep them all off. Native activity lasts up to 180 days.

Set `NEXT_PUBLIC_WEBM8_ANALYTICS_SITE_ID` to the registered site UUID, with both the apex and canonical `www` origin allowed in Analytics. The optional `NEXT_PUBLIC_WEBM8_TRACKER_URL` defaults to the platform tracker. Set the same UUID as `CRM_ANALYTICS_SITE_ID` in the CRM. Its Website activity panel compares `/demo` arrivals with Meta submission times and any ad/campaign identifiers. Matches remain possible, never confirmed identities. `/demo` is the owner's designated Instant Form destination, including visits without referrer/tags.

The native tracker records measured pages, click labels, scroll reach and active/visible time in the same browser. It does not record form contents or activity inside external demo sites. `lib/analytics.ts` forwards business events to configured providers. Never pass names, emails, phone numbers or form answers.

Every public link, button and FAQ summary has an explicit `data-analytics-id`, inside a named `data-analytics-section`. Labels describe the location and action, such as `Homepage examples / Select Fresh and Clean`, `Mobile menu / Pricing` and `Demo request form / Submit demo request`. Selecting a carousel card and opening its site have different names. `lib/analyticsNames.ts` normalises reviewed public project/trade/FAQ copy only; never pass visitor data, form answers, DOM text or URL query parameters. Keep the combined `section / action` within the tracker's 80-character limit. Shared `Section` accepts `analyticsSection`.

These labels apply to newly collected clicks. Old `button-N` or `demo-card-N` keys did not store the control's identity and cannot reliably be renamed from today's DOM order. The platform keeps their counts and marks them unnamed. Third-party iframe interactions remain outside this website's tracker.

From the canonical platform repository, run `node apps/analytics/scripts/verify-webm8-click-labels.mjs <website-url>` to audit all measured routes on desktop/mobile and exercise named interactions, form privacy and GPC. It intercepts all measurements and blocks backend writes and third-party services; no live analytics records or enquiries are created. A local website build needs `NEXT_PUBLIC_WEBM8_ANALYTICS_SITE_ID` set to a test UUID.

`npm test` covers the DNT/GPC check and provider forwarding. The platform's `scripts/verify-webm8-measurement.mjs [website-url]` verifies browser behaviour with outgoing measurements intercepted, so it creates no leads or live analytics records.

The homepage and demo events are:
- `home_story_completed`
- `demo_cta_clicked`
- `demo_step_completed`, `demo_request_accepted` (with Meta `Lead`, once per saved request), `demo_request_failed`

## Routes

| Path | Description |
|---|---|
| `/` | Home |
| `/demo/` | Destination after a Meta Instant Form; examples and next steps |
| `/free-demo/` | Free personalised website demo enquiry form |
| `/work/` | Demo sites |
| `/pricing/` | Plans, quoted to the business |
| `/about/` | Positioning, values, process |
| `/contact/` | Enquiry form (accepts `?plan=…`) |
| `/movers/` | Moving-company campaign |
| `/privacy/` | Privacy notice |
