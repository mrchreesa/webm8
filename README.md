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
