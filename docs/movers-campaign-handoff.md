# `/movers/` campaign — handoff notes

Date: 2026-09-12

Internal. Nothing in this file appears on the public page.

## What is live in the code

- `/movers/` rebuilt around one offer: a free 10-minute review.
- Standard $197/month or $1,970/year; Growth $297/month or $2,970/year. Annual is
  ten months paid for twelve months of service. Billing selector defaults to
  Monthly; the annual option is labelled "2 months free".
- Review requests POST to `/api/mover-review/`, are validated server-side, and are
  written to `public.agency_review_requests` in the **webm8-platform** Supabase
  project (`usdkmmlvngsrmylcqlgb`). The success panel appears only after the row
  exists.
- Booking goes to `https://cal.com/webm8/review` — a new public 10-minute event
  (id `7042719`) created on the `webm8` Cal.com account for this campaign.

## Decisions the owner needs to make

### 1. Annual cancellation policy — blocking before you take an annual payment

No refund or forfeiture rule has been decided, so the page does not state one.
The FAQ currently says an annual term is paid up front for 12 months of service
and that if someone needs to stop partway through, it will be agreed in writing
**before** they commit to paying annually. That is true and non-binding today,
but it is not a policy.

Decide one of: no refund on the unused portion; pro-rata refund; credit toward a
later restart. Then the FAQ answer "How does cancelling work?" in
`components/movers/MoverFaq.tsx` should be updated to say it plainly. Whatever is
chosen has to stay consistent with "no minimum contract term" — the customer is
never obliged to continue; the only open question is money already paid.

### 2. Delivery limits still undefined

The plan bullets came from the brief and are written as capabilities, not
quantities. Before selling, pin down:

- How many service/location pages the initial Standard build includes.
- How many revision rounds before launch.
- What counts as a "routine small content edit", and how many per month.
- What "one new or substantially improved page each month" means if a month is
  skipped — does it roll over?
- Response-time commitment. The page currently promises only "within one business
  day" for replies, which matches the rest of the site.

### 3. Which integrations are genuinely supported

The FAQ deliberately says integrations are checked per customer rather than
listing names. If there is a confirmed list (a specific CRM, a specific moving
software), it can be named — but only once it has actually been connected once.

### 4. Domain and website handover terms

The page states the domain is registered in the owner's name and their content and
customer data are theirs, and that the site itself is built and hosted by WebM8
as part of the service with any handover agreed in writing first. It deliberately
does **not** promise the site stays online after cancellation. If there is a real
handover policy, that FAQ answer should carry it.

### 5. Meta Pixel ID — the Lead event cannot fire without it

`lib/analytics.ts` calls `window.fbq`, but no pixel was ever installed, so the
Lead event has had nowhere to go. A loader is now in place gated on
`NEXT_PUBLIC_META_PIXEL_ID`. Set that in Vercel and the Lead event starts firing
once per accepted request. Until then, Meta gets nothing.

### 6. Founder photo

`components/movers/MoverProof.tsx` renders a single-initial avatar. Drop a
portrait at `public/team/founder.webp` and swap the `<span>` for an `<Image>`.

### 7. Name spelling — visible inconsistency

The site says **Kristian** (matching the git author). The Cal.com account says
**Christian**, and a visitor sees that name on the booking page seconds after
reading the site. Pick one and make both match.

## Configuration required before this works in production

Set these in Vercel (Production and Preview). They are **server-only** — do not
add a `NEXT_PUBLIC_` prefix:

```
SUPABASE_URL=https://usdkmmlvngsrmylcqlgb.supabase.co
SUPABASE_SECRET_KEY=<the sb_secret_… key from webm8-platform>
```

Optional:

```
NEXT_PUBLIC_MIXPANEL_TOKEN=<token>     # currently unset, so measurement is off
NEXT_PUBLIC_META_PIXEL_ID=<pixel id>   # required for the Meta Lead event
```

**Check the Vercel project's Output Directory setting.** The site is no longer a
static export. If the project has an explicit output directory of `out`, clear it
or the deploy will keep serving a stale export and the API route will 404.

The migration is at
`webm8-platform/supabase/migrations/202609120001_agency_review_requests.sql`.
It has already been applied to the live project. Note that `webm8-platform` is
not a git repository, so that file is not under version control.

## Findings from inspecting what was already live

1. **The `/movers/` form had never worked.** The published bundle contained an
   unresolved `process.env.NEXT_PUBLIC_MOVERS_FORM_ENDPOINT`, so every submission
   hit the `endpoint_missing` branch and showed "The form is being connected."
   `NEXT_PUBLIC_CALENDAR_URL` was equally unset, so the post-submit calendar
   button never rendered. Both variables are now gone; the endpoint is a route in
   this repo and the calendar URL is a committed constant, because an unset
   environment variable is exactly the failure that was being repeated.

2. **Mixpanel has never collected anything** — no token in the live build.

3. **The ops-dashboard Supabase project (`ttytudvnnnjzyrmehfhi`) is PAUSED.**
   That is why review requests were not put there. A paused project would have
   killed the form a second time.

4. **Legacy Supabase API keys are disabled** on `webm8-platform` (since
   2026-09-04). The `anon` and `service_role` JWTs return "Legacy API keys are
   disabled". Use the `sb_publishable_…` and `sb_secret_…` keys.

5. **The demonstration site and its local source have diverged.** The live page at
   `removals.webm8agency.com` reads "We Deliver the Best Global Logistics
   Solutions"; local `main` in `~/Desktop/WebM8/removals/main/experia` reads "We
   Delivering Best Global Logistics Solutions". The local checkout also has ~52
   uncommitted files. **The cleanup committed there will not reach production
   until that divergence is reconciled** — find out what Vercel is actually
   building from before deploying.

6. **Demo site defects fixed in the local repo** (commit `d6151fc`):
   - Two visible "Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias,
     fugiat!?" strings on the homepage and About page.
   - Courier-template sections: "We Delivering Best Global Logistics Solutions",
     "World Wide Shipping", "Recent Delivered Package & Parcel Supplies", and the
     Apply Online → Documentation → Processing → Final Destination flow, which is
     a customs process rather than a move.
   - Footer links `/team` and `/testimonials`, both returning 404.

7. **Demo site defects NOT fixed** — they need someone with that project's
   environment:
   - Step 2 of the estimate shows **"Demo Route Preview Here"** where the route map
     should be. That string does not exist in the local source, which is more
     evidence of the divergence above. Likely a missing
     `NEXT_PUBLIC_MAPS_API_KEY` in the deployed environment.
   - The date field rendered `03/10/2026` for 3 October in a non-US browser
     locale. Worth checking how it looks to a US visitor, since a mover reading
     that as March 10 is a real booking error.

8. **No email notification exists anywhere.** No Resend, SendGrid, Postmark or SMTP
   credentials are configured in any repo. A review request is recorded in
   Supabase and, if the visitor books, Cal.com emails the invitation — but a
   request from someone who does **not** book will sit in the table silently.
   Either check the table daily or add a notification path. This is the largest
   remaining operational gap.

## What was verified, and how

- `npm test` — 20 tests covering the pricing arithmetic and the request validator.
- `npm run typecheck`, `npm run lint`, `npm run build` all clean. 12 of 13 routes
  still prerender; only `/api/mover-review` is server-rendered.
- A real submission through the rendered form at 390px wide reached Supabase, with
  `utm_source=facebook` and `utm_campaign=busy-mover` captured on the row. Test
  rows were deleted afterwards; the table is empty.
- Rejected input returns 400 with per-field messages, the honeypot and a sub-1.5s
  submission are refused, and a sixth request inside the window returns 429.
- RLS confirmed in both directions: the publishable key cannot read or insert
  (`42501`), the secret key can.
- The Cal.com embed renders an iframe for the 10-minute event with no console
  errors, alongside a plain booking link that works if the script is blocked.
- The mobile sticky CTA hides itself (`opacity: 0`, `pointer-events: none`,
  `aria-hidden`) whenever the request form is on screen.
- Tab order through the form is name → company → email → phone → website →
  checkbox → submit. The "no website yet" checkbox disables and clears the URL
  field and swaps its hint text.
- Every required figure renders on the page: $197, $1,970, $297, $2,970, $164.17,
  $247.50, $394, $594, "2 months free", "$0 setup fee", "No minimum contract term".
