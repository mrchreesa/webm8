# WebM8 Agency Site

High-converting marketing site for **WebM8**, a web design agency building
websites for US local businesses. Positioning: **"Websites for Local
Businesses That Want More Calls, Bookings, and Customers."**

Plans:

- **Standard — $197/month** · Professional website, trust signals, contact.
- **Growth — $297/month** · Lead-generation focused with tracking + ongoing
  improvements.

Built with **Next.js 15 (App Router) + TypeScript + Tailwind v4**, exported
as static HTML/CSS/JS. No backend required.

## Stack

- Next.js 15.5 (App Router, static export via `output: "export"`)
- React 19
- TypeScript 5.7
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- `next/font/google` — Inter (variable, display swap)

All content is rendered statically at build time. Forms submit via
`mailto:` links (same pattern as the legacy `website1/site.js`), so the
whole site can be hosted on any static host (Vercel, Netlify, Cloudflare
Pages, S3, GitHub Pages) with no server.

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

## Adding analytics

The site ships with zero tracking. To add analytics, drop the snippet
into `app/layout.tsx`. For Google Analytics (GA4):

```tsx
import Script from "next/script";
// Inside <html> ...
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX" strategy="afterInteractive" />
<Script id="ga" strategy="afterInteractive">{`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXX');
`}</Script>
```

## What's intentionally out of scope

- Real project screenshots / client logos (placeholders used).
- Backend form submission / CRM integration.
- Blog, Case Studies, Industries pages (listed as "Optional later" in the
  original brief).
- Third-party analytics (trivial to add — see above).
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
