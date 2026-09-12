# WebM8 Agency Site

High-converting marketing site for **WebM8**, a web design agency building
websites for US local businesses. Positioning: **"Websites for Local
Businesses That Want More Calls, Bookings, and Customers."**

Plans:

- **Standard — $197/month** or $1,970/year · Professional website, trust signals, contact.
- **Growth — $297/month** or $2,970/year · Lead-generation focused with tracking + ongoing
  improvements.

Annual billing is ten months paid for twelve months of service. `lib/movers.ts`
is the single source of truth for these numbers on `/movers/`.

Built with **Next.js 15 (App Router) + TypeScript + Tailwind v4**, deployed on
Vercel. Every page prerenders at build time except `/api/mover-review`, the
server route behind the movers campaign form.

## Stack

- Next.js 15.5 (App Router, static export via `output: "export"`)
- React 19
- TypeScript 5.7
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- `next/font/google` — Geist and Geist Mono (variable, display swap)

Content is rendered statically at build time. The audit and contact forms
still submit via `mailto:` links; the `/movers/` review form POSTs to a server
route that records the request in Supabase before reporting success.

## Getting started

```bash
cd website
npm install
npm run dev
# open http://localhost:3000
```

Other scripts:

```bash
npm run build     # production build + static export to ./out
npm run start     # serve the built app (only meaningful without `output: export`)
npm run lint      # next/eslint
npm run typecheck # tsc --noEmit
npm test          # node --test over lib/**/*.test.ts
```

## Deploying

After `npm run build`, the entire site is written to `./out` as static
files. Deploy that folder to any static host:

- **Vercel / Netlify / Cloudflare Pages**: point the project at this
  directory, set build command to `npm run build`, and the publish/output
  directory to `out`.
- **GitHub Pages / S3 / any CDN**: upload the contents of `out/` directly.

## Project structure

```
website/
  app/                      # App Router pages
    layout.tsx              # Root layout with Header + Footer + Inter font
    page.tsx                # Home (composes 10 sections)
    pricing/page.tsx
    work/page.tsx
    audit/page.tsx
    about/page.tsx
    contact/page.tsx
    not-found.tsx           # 404
    globals.css             # Tailwind + @theme tokens
  components/
    layout/                 # Header (with mobile drawer), Footer
    ui/                     # Button, Section, Icon, BrowserMockup, PageHero
    home/                   # Hero, TrustBar, ValueCards, WhatYouGet,
                            # Pricing, Portfolio, Process, AuditTeaser,
                            # Testimonials, FinalCta
    forms/                  # AuditForm, ContactForm, shared FormField
  lib/
    site.ts                 # Single source of truth: nav, plans, features,
                            # projects, testimonials, audit checklist, copy
    mailto.ts               # buildMailtoHref(to, subject, fields)
  public/
    favicon.svg
    og-image.svg
```

## Where to edit content

Almost all copy is in **`lib/site.ts`**:

- `primaryNav` — header/footer navigation.
- `plans` — Standard & Growth bullets, prices, CTA labels.
- `valueCards` — "More Trust / More Leads / More Revenue" cards.
- `whatYouGet` — two-column checkmark list on the homepage.
- `processSteps` — "How it works" 4 steps.
- `auditChecklist` — items shown on `/audit` and in the home audit teaser.
- `projects` — 6 portfolio entries rendered with the pure-CSS browser
  mockup component.
- `testimonials` — quote cards.
- `valueProps` — extended value bullets shown on `/about`.
- `intakeEmail` — target address for both forms (`mailto:`).

Page-specific copy (FAQ, comparison table, industry tiles, etc.) lives
inside the relevant page file under `app/`.

## Design tokens

All brand colors and shared tokens live in `app/globals.css` under
`@theme`:

```
--color-bg:          #F8FAFC
--color-surface:     #FFFFFF
--color-ink:         #0F172A   /* main text */
--color-muted:       #475569   /* secondary text */
--color-brand:       #2563EB   /* primary accent / CTA */
--color-brand-hover: #1D4ED8
--color-accent:      #10B981   /* secondary accent */
--color-border:      #E2E8F0
```

Use them via the Tailwind v4 short form, e.g. `bg-[color:var(--color-brand)]`
or `text-[color:var(--color-muted)]`. The Inter font is wired through
`--font-inter` / `--font-sans`.

## Forms

`AuditForm` and `ContactForm` are client components that validate the
required fields, build a prefilled `mailto:` draft via
`lib/mailto.ts::buildMailtoHref`, and open the user's mail client.

To move to a real backend later:

1. Replace the `onSubmit` handler in `components/forms/AuditForm.tsx` and
   `components/forms/ContactForm.tsx` with a `fetch` to your endpoint.
2. Remove `output: "export"` from `next.config.ts` if you also need server
   actions / API routes, or keep static export and POST to a third-party
   form service (Formspree, Basin, Resend, etc.).
3. Update `intakeEmail` in `lib/site.ts` to the production address.

## Swapping placeholders for real assets

The portfolio currently renders pure-CSS/SVG browser mockups
(`components/ui/BrowserMockup.tsx`) so the site is self-contained. To
swap in real project screenshots:

1. Drop images into `public/projects/<slug>.png` (1600×1000 recommended).
2. Extend the `Project` type in `lib/site.ts` with an `image` field.
3. In `components/home/Portfolio.tsx`, replace the `<BrowserMockup/>`
   with `next/image`:

   ```tsx
   import Image from "next/image";
   // ...
   <Image
     src={`/projects/${project.slug}.png`}
     alt={project.title}
     width={1600}
     height={1000}
     className="rounded-xl"
   />
   ```

   (Static export already sets `images.unoptimized: true` in
   `next.config.ts`.)

## Website measurement

The site has an optional Mixpanel integration in
`components/analytics/MixpanelAnalytics.tsx`. It stays disabled until
`NEXT_PUBLIC_MIXPANEL_TOKEN` is set. The default API address is the EU endpoint;
change `NEXT_PUBLIC_MIXPANEL_API_HOST` only when the Mixpanel project is stored
in another region.

The `/movers` page records a deliberately small funnel:

- main call-to-action clicked
- mover demo clicked
- pricing reached
- preview form reached and started
- form submission attempted, completed, or failed
- calendar or email clicked

`lib/analytics.ts` is the single event adapter. It sends the same meaningful
events to Mixpanel and, only if they are separately configured, GA4 and Meta.
Never pass form values or other personal information to this helper.

Mixpanel reporting and customer-report setup live in
`../ops-dashboard/backend/README.md`.

## What's intentionally out of scope

- Real project screenshots / client logos (placeholders used).
- Backend form submission / CRM integration.
- Blog, Case Studies, Industries pages (listed as "Optional later" in the
  original brief).
- Paid ad conversion tags (add only when a campaign needs them).
- Content management — all copy is code-first in `lib/site.ts`.

## Routes

| Path        | Description                                           |
| ----------- | ----------------------------------------------------- |
| `/`         | Home (10 sections: Hero → Final CTA)                  |
| `/pricing`  | Standard vs. Growth side-by-side, comparison + FAQ    |
| `/work`     | Full portfolio grid (6 projects)                      |
| `/audit`    | Audit checklist + audit request form                  |
| `/about`    | Positioning, value props, industries, process         |
| `/contact`  | Direct contact + enquiry form (accepts `?plan=…`)     |
| `/404`      | Branded not-found page                                |
