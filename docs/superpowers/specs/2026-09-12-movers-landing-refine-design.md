# `/movers/` landing page refine — design

Date: 2026-09-12
Status: approved, ready for implementation

## Goal

`/movers/` is the destination for Facebook and Instagram ads aimed at **owners and
managers of US moving companies**. The ad shows movers carrying a couch while a
phone rings and offers a **free 10-minute website review**.

The page must:

1. make that free 10-minute review the single, consistent offer;
2. explain the service well enough that booking a call is worth ten minutes;
3. present two plans with honest monthly and annual pricing;
4. accept a review request through a real backend and move the visitor to a real
   booking.

The primary conversion is a **qualified review request followed by a booked call**.

## Verified starting state

Established by inspection on 2026-09-12, not assumed:

- The published page ships `process.env.NEXT_PUBLIC_MOVERS_FORM_ENDPOINT`
  unresolved. Every submission takes the `endpoint_missing` branch and shows
  "The form is being connected. For now, email info@webm8agency.com."
  **The form has never worked.** `NEXT_PUBLIC_CALENDAR_URL` is also unset, so the
  post-submit calendar button never renders. No Mixpanel token in the live build.
- Both sites are on Vercel. The agency site deploys from `mrchreesa/webm8`.
- `removals.webm8agency.com` (Fantastic Moves) still contains ThemeForest courier
  template content: literal "Lorem ipsum dolor sit amet consectetur adipisicing
  elit. Alias, fugiat!?", "Worldwide shipping", "Global Logistics Solutions", and
  an Apply Online → Documentation → Processing → Final Destination process. Source
  is available at `~/Desktop/WebM8/removals/main/experia`; it has a genuine
  booking/lead flow with an admin panel.
- Cal.com account `webm8` is live. Event `5742212` is "WebM8 Demo Call", 15 min.
- Supabase: the ops-dashboard CRM project `ttytudvnnnjzyrmehfhi` is **PAUSED**.
  `webm8-platform` `usdkmmlvngsrmylcqlgb` is ACTIVE_HEALTHY. The CLI is
  authenticated and the Management API accepts DDL.
- No email-sending credentials exist in any repo.
- `window.fbq` is called by `lib/analytics.ts` but **no Meta Pixel is installed**,
  so the Lead event cannot currently fire.
- No founder photo in the repo. The `testimonials` in `lib/site.ts` are invented
  names and must not appear on this page.

## Architecture

### Deployment mode

Remove `output: "export"` from `next.config.ts`. Keep `trailingSlash: true`.
All existing routes continue to prerender statically at build time; the only
server surface is the new API route. `app/robots.ts` and `app/sitemap.ts` keep
`force-static`.

Risk: if the Vercel project sets an explicit Output Directory of `out`, it must be
cleared or the deploy will serve a stale export. Recorded in the handoff notes.

### Request intake

`app/api/mover-review/route.ts`, `runtime = "nodejs"`, POST only.

```
POST /api/mover-review
  -> validate (shared module, also unit-tested)
  -> honeypot + submit-timing + per-IP throttle
  -> insert into Supabase with the server-only secret key
  -> 200 { ok: true, id }        only after the row is written
```

Failure modes: `400` with per-field errors, `429` when throttled, `502` when the
insert fails. The client shows success only on `200`. No `mailto:` fallback in the
primary path.

Secrets: `SUPABASE_URL` and `SUPABASE_SECRET_KEY` are server-only and must never
carry a `NEXT_PUBLIC_` prefix.

### Storage

New table `public.agency_review_requests` in the **webm8-platform** Supabase
project (`usdkmmlvngsrmylcqlgb`).

- Standalone. It does not reference `workspaces`, `leads`, `profiles` or
  `workspace_memberships`, so the platform's isolation verification is unaffected.
- RLS enabled with **no policies**, so only the secret key can read or write it.
- Columns: contact name, company, email, phone, `website_url`, `has_website`,
  `plan`, `billing`, `utm_source/medium/campaign/content/term`, `referrer`,
  `page_path`, `stage`, `created_at`, `updated_at`.
- `stage` is a constrained text column: `received`, `booked`, `attended`,
  `qualified`, `customer`, `lost`. The later sales stages the brief asks to track
  live here, in the database, not in web analytics.

The paused ops-dashboard project was rejected deliberately: a paused project would
silently kill the form a second time.

The migration is committed to `webm8-platform/supabase/migrations/`, because that
project owns the database.

### Booking

Create a public 10-minute event type on the `webm8` Cal.com account so the booking
page matches the advertised offer. Its URL is committed in `lib/movers.ts` — not
read from an environment variable, because an unset environment variable is
precisely the failure being fixed.

After a recorded submission the success panel renders:

- Cal's inline embed, prefilled with name and email, time zone visible; and
- a plain `cal.com/webm8/…` link rendered immediately, so the path still works
  when the embed script is blocked (Meta in-app browser, ad blockers).

Copy separates the two states: "Your review request is received. Choose a time to
confirm your call." The request is retained regardless of whether they book, and
the panel states that WebM8 follows up within one business day if they don't.

### Page composition

`app/movers/page.tsx` (currently 844 lines) becomes a thin composition over
`components/movers/*`: `MoverHero`, `MoverDemo`, `MoverBenefits`, `MoverPricing`,
`MoverProof`, `ReviewExpectations`, `MoverFaq`, `ReviewFormSection`, plus the
existing `StickyMoverCta` and `MoverFunnelTracking`.

Section order follows the brief: Hero → Demonstration → Three benefits → Pricing →
Trust and proof → What happens on the review → FAQ → Final review form.

Removed entirely from this flow: the free bespoke homepage preview, the PDF audit,
the video audit, the 12-month initial agreement, and the $297 single plan.

### Pricing model

Single source of truth in `lib/movers.ts`. Selector defaults to **Monthly**; the
annual option is labelled **"2 months free"**.

| Plan     | Monthly | Annual charge | Monthly equivalent | Annual saving |
| -------- | ------- | ------------- | ------------------ | ------------- |
| Standard | $197    | $1,970/year   | $164.17            | $394          |
| Growth   | $297    | $2,970/year   | $247.50            | $594          |

In annual mode the **actual annual charge is the headline**; the monthly
equivalent appears only as secondary prose. The equivalent is never formatted as a
price-per-month headline. Both plans show `$0 setup · no minimum contract term`.

Annual is an annual-payment discount — pay for 10 months, receive 12 — and must
never be described as a free trial or as two free months on monthly billing.

Plan labels are honest descriptors: "Managed website" and "Ongoing growth
support". No "Most popular" badge, because there is no evidence for one.

Selected plan and billing carry into the form as optional context through a small
client provider. There is no checkout.

### Analytics

`lib/analytics.ts` keeps its role as the single adapter. Distinct events:

- landing page viewed
- review form started
- **review request accepted** — fired only after the server confirms the record
- **booking confirmed** — fired only from Cal's `bookingSuccessful` embed event
- calendar link clicked — explicitly not a booking
- click-to-call — explicitly not a completed call

Meta `Lead` fires once per accepted request, guarded by the returned request id.
A Meta Pixel loader is added, gated on `NEXT_PUBLIC_META_PIXEL_ID`.

Event properties carry only `utm_*`, `plan` and `billing`. Names, email addresses
and phone numbers never enter analytics properties or URLs. The form posts; it
never writes answers into the query string.

### Demonstration

On-page: real phone-width screenshots captured from the live demo's estimate flow,
composed into a labelled four-step sequence — customer opens the site on a phone,
enters moving details and contact information, submits the request, the owner
receives it. Demonstration data is labelled as such. No fabricated dashboard.

In the `experia` repo: remove the lorem ipsum in `about1.tsx` and `about2.tsx`, and
rewrite the global-logistics, "Recent Delivered Package & Parcel Supplies" and
courier process sections for a US moving company. That repo is handed back for
review; it is not deployed as part of this work.

The demo is presented as a WebM8 demonstration, never as paying-client work.

### Trust and proof

Founder introduction explaining who does the work and how the owner gets help.
The layout holds a real photo; until the file is supplied it renders an initials
avatar with no visible placeholder text. No invented clients, testimonials,
ratings, review counts, credentials, scarcity or revenue claims.

## Testing

No runner is configured, so add a minimal `node --test` setup:

- pricing math — every figure in the table above, derived not hardcoded;
- the request validator — required fields, the "no website yet" branch, rejection
  of bad input, honeypot.

Then a real end-to-end submission against the live table using a designated test
recipient, with the test rows deleted afterwards.

Manual verification: mobile and desktop layout at typical phone widths, billing
switching, anchor links, form validation, success and error states, the booking
path, and keyboard operation.

## Wording that must stay non-binding

The page will not state a refund or forfeiture rule for prepaid annual terms,
because none has been decided. It says annual is paid up front for twelve months
of service and that any mid-term change is confirmed in writing beforehand. This
is consistent with "no minimum contract term": the customer is never obliged to
continue; only the treatment of money already paid is undecided.

Likewise the page does not promise that the website stays available after
cancellation, does not guarantee leads or rankings, and does not claim a specific
list of supported integrations.

## Owner decisions carried to the handoff notes

1. Annual cancellation policy — what happens to an unused prepaid annual term.
2. Delivery limits — location/service page counts, revision rounds, what a
   "routine small content edit" covers, response-time commitments.
3. Which enquiry integrations are genuinely supported.
4. Domain and website handover terms after cancellation.
5. Meta Pixel ID — without it the Lead event cannot fire.
6. Founder photo file.
7. Vercel Output Directory override, if one is set.
