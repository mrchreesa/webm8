# `/movers/` Landing Page Refine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/movers/` around one offer — a free 10-minute website review — with two honest plans, a working backend, and a real booking step.

**Architecture:** The site drops `output: "export"` so one Next.js route handler can validate a review request and record it in Supabase before the UI ever claims success. Page copy and pricing move into `lib/movers.ts` as a single source of truth, and the 844-line page file splits into focused section components under `components/movers/`.

**Tech Stack:** Next.js 15.5 App Router, React 19, TypeScript 5.7, Tailwind v4, Supabase (REST, server-only secret key), Cal.com embed, Mixpanel + optional Meta Pixel, `node --test` via `tsx`.

**Spec:** `docs/superpowers/specs/2026-09-12-movers-landing-refine-design.md`

## Global Constraints

- American English throughout. "moving company", "estimate", "quote request". USD.
- Audience is moving-company owners and managers, never consumers hiring movers.
- The single offer on this page is the **free 10-minute review**. No free bespoke
  homepage, no PDF audit, no video audit.
- Standard: `$197`/month, `$1,970`/year, `$164.17` monthly equivalent, `$394` saved.
- Growth: `$297`/month, `$2,970`/year, `$247.50` monthly equivalent, `$594` saved.
- Both plans: `$0 setup fee`, **no minimum contract term**.
- Annual label is exactly **"2 months free"**. Annual mode shows the real annual
  charge as the headline; the monthly equivalent is secondary prose only.
- Annual is an annual-payment discount — pay for 10 months, get 12. Never a free
  trial, never two free months on monthly billing.
- Billing selector defaults to **Monthly**.
- No "Most popular" badge. No invented clients, testimonials, ratings, review
  counts, credentials, scarcity or revenue claims.
- Never guarantee leads or rankings. Never promise the site stays live after
  cancellation. Never invent a refund or forfeiture rule for prepaid annual terms.
- Never claim a website answers missed calls, creates traffic, or guarantees jobs.
- Names, emails and phone numbers never enter analytics properties or URLs.
- Internal setup notes and unresolved placeholders stay off the public page.
- Tailwind tokens via arbitrary-value form (`text-[color:var(--color-muted)]`) or
  the existing shorthand utilities already used in this repo (`text-ink`,
  `bg-brand`). Match the file you are editing.
- Internal links end in `/` (`trailingSlash: true`).

---

### Task 1: Pricing model with tests

**Files:**
- Create: `lib/movers.ts`
- Create: `lib/movers.test.ts`
- Modify: `package.json` (add `test` script and `tsx` devDependency)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type BillingCycle = "monthly" | "annual"`
  - `type MoverPlanId = "standard" | "growth"`
  - `moverPlans: MoverPlan[]` where `MoverPlan` is
    `{ id: MoverPlanId; name: string; label: string; summary: string; monthlyPrice: number; annualPrice: number; features: string[]; footnote: string }`
  - `annualEquivalentMonthly(plan: MoverPlan): number`
  - `annualSaving(plan: MoverPlan): number`
  - `formatUsd(amount: number): string` — whole dollars, no cents (`$197`, `$1,970`)
  - `formatUsdPrecise(amount: number): string` — always two decimals (`$164.17`)
  - `reviewCalendarUrl: string`

- [ ] **Step 1: Write the failing test**

```ts
// lib/movers.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  annualEquivalentMonthly,
  annualSaving,
  formatUsd,
  formatUsdPrecise,
  moverPlans,
} from "./movers";

const standard = moverPlans.find((plan) => plan.id === "standard")!;
const growth = moverPlans.find((plan) => plan.id === "growth")!;

test("standard is $197 monthly or $1,970 annually", () => {
  assert.equal(standard.monthlyPrice, 197);
  assert.equal(standard.annualPrice, 1970);
});

test("growth is $297 monthly or $2,970 annually", () => {
  assert.equal(growth.monthlyPrice, 297);
  assert.equal(growth.annualPrice, 2970);
});

test("annual payment is ten months for twelve months of service", () => {
  for (const plan of moverPlans) {
    assert.equal(plan.annualPrice, plan.monthlyPrice * 10);
  }
});

test("annual saving equals two months", () => {
  assert.equal(annualSaving(standard), 394);
  assert.equal(annualSaving(growth), 594);
  for (const plan of moverPlans) {
    assert.equal(annualSaving(plan), plan.monthlyPrice * 2);
  }
});

test("monthly equivalent divides the annual charge by twelve", () => {
  assert.equal(annualEquivalentMonthly(standard), 164.17);
  assert.equal(annualEquivalentMonthly(growth), 247.5);
});

test("currency formatting", () => {
  assert.equal(formatUsd(197), "$197");
  assert.equal(formatUsd(1970), "$1,970");
  assert.equal(formatUsdPrecise(164.1666), "$164.17");
  assert.equal(formatUsdPrecise(247.5), "$247.50");
});

test("no plan advertises a minimum contract term", () => {
  const text = JSON.stringify(moverPlans).toLowerCase();
  assert.ok(!text.includes("12-month"));
  assert.ok(!text.includes("minimum term"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module './movers'`

- [ ] **Step 3: Write the implementation**

`lib/movers.ts` holds the plan data, the two derived helpers, the two formatters
and `reviewCalendarUrl` (filled in by Task 5; use `https://cal.com/webm8/15min`
as the committed value until then so the constant is never empty).

```ts
export function annualEquivalentMonthly(plan: MoverPlan) {
  return Math.round((plan.annualPrice / 12) * 100) / 100;
}

export function annualSaving(plan: MoverPlan) {
  return plan.monthlyPrice * 12 - plan.annualPrice;
}
```

Standard features (verbatim, from the brief):
"Website design and copy written for your company, services and real service
area", "Responsive layout with visible phone buttons and a straightforward
estimate form", "Quote requests delivered to your email", "Trust sections built
from your genuine reviews, photos and licence and insurance details", "Hosting,
security, backups and maintenance", "Foundational on-page SEO and analytics
setup", "Routine small content edits", "A simple monthly website and enquiry
summary".

Growth features: "Everything in Standard, plus:", "Google Business Profile
support and optimization, with your access and approval", "One new or
substantially improved service or location page each month", "Review-request and
enquiry-follow-up workflows using supported integrations", "One useful conversion
improvement each month, informed by evidence where available", "A monthly
performance review covering enquiries, sources and the next practical actions".

Labels: Standard → "Managed website"; Growth → "Ongoing growth support".

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/movers.ts lib/movers.test.ts package.json package-lock.json
git commit -m "Add mover plan pricing model with tests"
```

---

### Task 2: Supabase table for review requests

**Files:**
- Create: `../../webm8-platform/supabase/migrations/202609120001_agency_review_requests.sql`

**Interfaces:**
- Produces: table `public.agency_review_requests`, columns
  `id uuid`, `created_at timestamptz`, `updated_at timestamptz`,
  `contact_name text`, `company_name text`, `email text`, `phone text`,
  `website_url text`, `has_website boolean`, `plan text`, `billing text`,
  `utm_source/utm_medium/utm_campaign/utm_content/utm_term text`,
  `referrer text`, `page_path text`, `stage text`, `notes text`.

- [ ] **Step 1: Write the migration**

```sql
create table if not exists public.agency_review_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  contact_name text not null,
  company_name text not null,
  email text not null,
  phone text not null,
  website_url text,
  has_website boolean not null default true,
  plan text,
  billing text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  page_path text,
  stage text not null default 'received',
  notes text,
  constraint agency_review_requests_stage_check
    check (stage in ('received','booked','attended','qualified','customer','lost')),
  constraint agency_review_requests_plan_check
    check (plan is null or plan in ('standard','growth')),
  constraint agency_review_requests_billing_check
    check (billing is null or billing in ('monthly','annual'))
);

alter table public.agency_review_requests enable row level security;
-- No policies: reachable only with the service/secret key.

create index if not exists agency_review_requests_created_at_idx
  on public.agency_review_requests (created_at desc);
```

- [ ] **Step 2: Apply it and verify the table exists**

```bash
TOKEN=$(security find-generic-password -s "Supabase CLI" -w | sed 's/^go-keyring-base64://' | base64 -d)
curl -s -X POST "https://api.supabase.com/v1/projects/usdkmmlvngsrmylcqlgb/database/query" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  --data-binary @<(python3 -c 'import json,sys;print(json.dumps({"query":open(sys.argv[1]).read()}))' <migration path>)
```

Expected: `[]` (DDL returns no rows), then a follow-up
`select count(*) from public.agency_review_requests;` returns `0`.

- [ ] **Step 3: Verify RLS blocks the anon key**

```bash
curl -s "https://usdkmmlvngsrmylcqlgb.supabase.co/rest/v1/agency_review_requests?select=id" \
  -H "apikey: <anon key>" -H "Authorization: Bearer <anon key>"
```

Expected: empty array or a permission error — never row data.

- [ ] **Step 4: Commit the migration in the platform repo**

```bash
git -C ../../webm8-platform add supabase/migrations/202609120001_agency_review_requests.sql
git -C ../../webm8-platform commit -m "Add agency_review_requests table for website review requests"
```

---

### Task 3: Request validator with tests

**Files:**
- Create: `lib/reviewRequest.ts`
- Create: `lib/reviewRequest.test.ts`

**Interfaces:**
- Consumes: `MoverPlanId`, `BillingCycle` from `lib/movers.ts`.
- Produces:
  - `type ReviewRequestInput = Record<string, unknown>`
  - `type ReviewRequestFields = { contactName; companyName; email; phone; websiteUrl: string | null; hasWebsite: boolean; plan: MoverPlanId | null; billing: BillingCycle | null; utmSource … utmTerm: string | null; referrer: string | null; pagePath: string | null }`
  - `type ValidationResult = { ok: true; value: ReviewRequestFields } | { ok: false; errors: Record<string, string> }`
  - `validateReviewRequest(input: ReviewRequestInput): ValidationResult`

Rules: `contactName`, `companyName`, `email`, `phone` required. `email` must match
a simple address shape. `phone` must contain at least 7 digits. When
`hasWebsite` is false, `websiteUrl` is forced to `null` and never required. When
`hasWebsite` is true and a URL is supplied, it is normalized to include a scheme.
`plan` and `billing` are optional context and are dropped when not recognized.
All strings trimmed and length-capped. Unknown keys ignored.

- [ ] **Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { validateReviewRequest } from "./reviewRequest";

const valid = {
  contactName: "Jamie Smith",
  companyName: "Example Moving Co.",
  email: "jamie@example.com",
  phone: "(555) 123-4567",
  hasWebsite: true,
  websiteUrl: "example.com",
};

test("accepts a complete request and normalizes the website", () => {
  const result = validateReviewRequest(valid);
  assert.ok(result.ok);
  assert.equal(result.value.websiteUrl, "https://example.com");
  assert.equal(result.value.contactName, "Jamie Smith");
});

test("accepts a company with no website yet", () => {
  const result = validateReviewRequest({ ...valid, hasWebsite: false, websiteUrl: "" });
  assert.ok(result.ok);
  assert.equal(result.value.hasWebsite, false);
  assert.equal(result.value.websiteUrl, null);
});

test("rejects a missing name, bad email and short phone together", () => {
  const result = validateReviewRequest({ ...valid, contactName: " ", email: "nope", phone: "12" });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.ok(result.errors.contactName);
  assert.ok(result.errors.email);
  assert.ok(result.errors.phone);
});

test("keeps recognized plan and billing context, drops junk", () => {
  const good = validateReviewRequest({ ...valid, plan: "growth", billing: "annual" });
  assert.ok(good.ok && good.value.plan === "growth" && good.value.billing === "annual");
  const junk = validateReviewRequest({ ...valid, plan: "enterprise", billing: "weekly" });
  assert.ok(junk.ok && junk.value.plan === null && junk.value.billing === null);
});

test("caps absurd input lengths", () => {
  const result = validateReviewRequest({ ...valid, companyName: "x".repeat(5000) });
  assert.ok(result.ok);
  assert.ok(result.value.companyName.length <= 200);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/reviewRequest.ts`**

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/reviewRequest.ts lib/reviewRequest.test.ts
git commit -m "Add review request validation with tests"
```

---

### Task 4: Route handler and deployment mode

**Files:**
- Create: `app/api/mover-review/route.ts`
- Modify: `next.config.ts` (remove `output: "export"`)
- Modify: `.env.example`
- Create: `.env.local` (untracked, real values for local verification)

**Interfaces:**
- Consumes: `validateReviewRequest` from `lib/reviewRequest.ts`.
- Produces: `POST /api/mover-review` → `200 { ok: true, id: string }`,
  `400 { ok: false, errors }`, `429 { ok: false, message }`,
  `502 { ok: false, message }`.

Env: `SUPABASE_URL`, `SUPABASE_SECRET_KEY` — server-only, no `NEXT_PUBLIC_`
prefix. If either is missing the route returns `502` and logs; it never returns
a fake success.

- [ ] **Step 1: Remove static export**

```ts
// next.config.ts
const nextConfig: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
};
```

- [ ] **Step 2: Write the route**

`export const runtime = "nodejs";` and `export const dynamic = "force-dynamic";`.
Honeypot field `company_website_hp` must be empty. A `startedAt` timestamp more
recent than 2 seconds is rejected as automated. Per-IP in-memory throttle of 5
requests per 10 minutes keyed on `x-forwarded-for`, documented as best-effort on
serverless. On success, POST to
`${SUPABASE_URL}/rest/v1/agency_review_requests` with headers `apikey`,
`Authorization: Bearer`, `Content-Type: application/json`,
`Prefer: return=representation`, then return the inserted `id`.

- [ ] **Step 3: Verify locally against the real table**

```bash
npm run dev &
curl -s -X POST http://localhost:3000/api/mover-review \
  -H 'Content-Type: application/json' \
  -d '{"contactName":"Test Owner","companyName":"WebM8 Internal Test","email":"mrchreesa+test@gmail.com","phone":"5551234567","hasWebsite":false,"startedAt":0}'
```

Expected: `{"ok":true,"id":"<uuid>"}`. Then confirm the row exists via the
Management API, and confirm a bad payload returns `400` with field errors.

- [ ] **Step 4: Delete the test row**

```sql
delete from public.agency_review_requests where company_name = 'WebM8 Internal Test';
```

- [ ] **Step 5: Commit**

```bash
git add next.config.ts app/api/mover-review/route.ts .env.example
git commit -m "Record mover review requests through a server route"
```

---

### Task 5: Cal.com 10-minute review event

**Files:**
- Modify: `lib/movers.ts` (`reviewCalendarUrl`)

- [ ] **Step 1: Create the event type**

`POST https://api.cal.com/v2/event-types` with `cal-api-version: 2024-06-14`,
`Authorization: Bearer $CAL_API_KEY` from
`~/Desktop/WebM8/webm8-agency/ops-dashboard/backend/.env`, body:

```json
{
  "title": "Free 10-minute website review",
  "slug": "review",
  "lengthInMinutes": 10,
  "description": "A short call to look at your current website, point out what gets in the way of customers requesting an estimate, and show a relevant example. No obligation to buy."
}
```

- [ ] **Step 2: Verify the booking page loads**

```bash
curl -sI https://cal.com/webm8/review | head -3
```
Expected: `HTTP/2 200`.

- [ ] **Step 3: Set `reviewCalendarUrl` to the created URL and commit**

```bash
git add lib/movers.ts
git commit -m "Point the review booking step at the 10-minute Cal.com event"
```

---

### Task 6: Analytics events and Meta Pixel

**Files:**
- Modify: `lib/analytics.ts`
- Create: `components/analytics/MetaPixel.tsx`
- Modify: `app/layout.tsx` (mount `MetaPixel`)

**Interfaces:**
- Produces: `trackEvent(name, details)` unchanged in shape; new canonical event
  names `mover_landing_viewed`, `mover_review_form_started`,
  `mover_review_request_accepted`, `mover_review_request_failed`,
  `mover_booking_link_clicked`, `mover_booking_confirmed`,
  `mover_call_link_clicked`, `mover_pricing_viewed`, `mover_plan_selected`,
  `mover_billing_changed`, `mover_demo_viewed`.
- `mover_review_request_accepted` is the **only** event that fires Meta `Lead`,
  and it fires once per request id (module-level guard set).

- [ ] **Step 1: Update the Meta mapping in `lib/analytics.ts`**

```ts
const leadEvent = "mover_review_request_accepted";
const firedLeadIds = new Set<string>();

export function trackLeadOnce(requestId: string, details: AnalyticsDetails = {}) {
  if (!requestId || firedLeadIds.has(requestId)) return;
  firedLeadIds.add(requestId);
  trackEvent(leadEvent, details);
  window.fbq?.("track", "Lead", { content_name: "Mover 10-minute review" });
}
```

Remove the old `mover_preview_submitted` special case so no other event can fire
`Lead`.

- [ ] **Step 2: Add the gated pixel loader**

`MetaPixel.tsx` renders nothing unless `NEXT_PUBLIC_META_PIXEL_ID` is set and
`navigator.doNotTrack !== "1"`, mirroring `MixpanelAnalytics`.

- [ ] **Step 3: Verify no PII can reach analytics**

Run: `grep -rn "trackEvent\|trackLeadOnce" components app lib` and confirm every
call site passes only utm/plan/billing/location values.

- [ ] **Step 4: Commit**

```bash
git add lib/analytics.ts components/analytics/MetaPixel.tsx app/layout.tsx .env.example
git commit -m "Separate review request, booking and call events for measurement"
```

---

### Task 7: Real demonstration screenshots

**Files:**
- Create: `public/movers/demo-1-open.webp` … `demo-4-received.webp`
- Create: `scripts/capture-demo.mjs`

- [ ] **Step 1: Capture the flow at phone width**

Drive `https://removals.webm8agency.com/` with Playwright at 390×844: home with
the estimate button visible, the estimate form with demonstration details filled
in, the submitted confirmation, and the owner-side request view. Save as WebP,
each under 120 KB.

- [ ] **Step 2: Verify sizes and dimensions**

Run: `ls -la public/movers/` and confirm every file is present and under 120 KB.

- [ ] **Step 3: Commit**

```bash
git add public/movers scripts/capture-demo.mjs
git commit -m "Add real mover demonstration screenshots"
```

---

### Task 8: Page sections

Split across five commits. All components live in `components/movers/`.

**Files:**
- Create: `components/movers/MoverHero.tsx`, `MoverDemo.tsx`, `MoverBenefits.tsx`,
  `MoverPricing.tsx`, `MoverProof.tsx`, `ReviewExpectations.tsx`, `MoverFaq.tsx`,
  `ReviewFormSection.tsx`, `PlanSelectionContext.tsx`
- Create: `components/forms/MoverReviewForm.tsx`
- Delete: `components/forms/MoverPreviewForm.tsx`
- Modify: `app/movers/page.tsx`, `components/movers/StickyMoverCta.tsx`

**Interfaces:**
- `PlanSelectionContext` produces
  `usePlanSelection(): { plan: MoverPlanId | null; billing: BillingCycle; setPlan(p): void; setBilling(b): void }`
  with `billing` defaulting to `"monthly"`.
- `MoverReviewForm` consumes `usePlanSelection()` and posts to
  `/api/mover-review`, showing success only on `200`.

- [ ] **Step 8a: Hero, benefits, sticky CTA**

Audience label "Websites for US moving companies." Headline "Your hands are full.
Your website can take the details." Body "We build and manage moving-company
websites that make requesting an estimate simple, so customers can send their
moving details while you're on the job." Primary button "Book my free 10-minute
review." Secondary text link "See how it works" → `#how-it-works`. Reassurance
row: "From $197/month", "$0 setup", "No minimum contract term". Real mobile
preview uses `public/work/removals-mobile.webp` with explicit width/height.
Three benefits: making an estimate request straightforward on mobile; giving the
owner the details needed to follow up; making the business look credible.
Sticky CTA: mobile only, appears after the hero, single row, no overlay, must not
cover form controls — hide it once the form section is on screen.

Commit: `Rebuild the mover hero and benefits around the 10-minute review`

- [ ] **Step 8b: Demonstration section**

Four labelled steps using the Task 7 screenshots, `id="how-it-works"`, an explicit
"WebM8 demonstration site — the details shown are demonstration data" label, and
an optional `target="_blank"` link to the live demo.

Commit: `Show the real estimate flow on the mover landing page`

- [ ] **Step 8c: Pricing cards**

Two cards from `moverPlans`, billing selector defaulting to Monthly, annual option
labelled "2 months free". Annual headline is `formatUsd(plan.annualPrice)` with
"billed once a year"; secondary prose "Pay for 10 months, get 12 — that works out
at `formatUsdPrecise(annualEquivalentMonthly(plan))` a month. You save
`formatUsd(annualSaving(plan))` a year." Each card carries one review CTA that
sets the plan and scrolls to `#review-request`. Below the cards: a line stating
that ad spend, paid third-party software and phone or SMS usage are billed
separately.

Commit: `Replace single-plan mover pricing with Standard and Growth`

- [ ] **Step 8d: Proof, review expectations, FAQ**

Proof: founder introduction, initials avatar until a photo file exists at
`public/team/founder.webp`, explicit statement that the demo is a demonstration
and not paying-client work. Review expectations: the four things the call covers
and "There is no obligation to buy", plus the no-website-yet variant. FAQ answers
the ten required questions with the non-binding wording from the spec.

Commit: `Add mover proof, review expectations and focused FAQ`

- [ ] **Step 8e: Review form and booking**

Fields: your name, moving-company name, current website with an "I don't have a
website yet" checkbox that disables and clears the URL field, email, callback
number. Plan and billing ride along as hidden optional context. Consent line
naming WebM8 and linking `/privacy/`. On `200`: success panel with
"Your review request is received. Choose a time to confirm your call.", the Cal
link rendered immediately, the inline embed mounted after, the time zone shown,
and a line explaining the one-business-day follow-up if they don't book. On
failure: the real error, the form still populated, no success claim.

Commit: `Collect mover review requests and route them to booking`

---

### Task 9: Metadata, structured data and stale claims

**Files:**
- Modify: `app/movers/page.tsx` (metadata + JSON-LD), `lib/seo.ts`

- [ ] **Step 1: Update the route entry in `indexableRoutes` and the page metadata**

Title and description must describe the review offer and the two plans.

- [ ] **Step 2: Replace the JSON-LD offer**

`hasOfferCatalog` with two `Offer` entries at `197` and `297` USD, both
`"unitCode": "MON"`. Delete the `12-month initial agreement` description. FAQ
JSON-LD regenerates from the new FAQ array.

- [ ] **Step 3: Verify no stale claims survive**

```bash
grep -rn "12-month\|12 month\|free preview\|homepage preview\|PDF audit\|video audit" app components lib
```
Expected: no matches inside the mover flow.

- [ ] **Step 4: Commit**

```bash
git add app/movers/page.tsx lib/seo.ts
git commit -m "Update mover metadata and structured data for two plans"
```

---

### Task 10: Demo site cleanup (separate repo)

**Files (in `~/Desktop/WebM8/removals/main/experia`):**
- Modify: `src/components/sections/about/about1.tsx`, `about2.tsx`,
  `src/components/sections/project/project2.tsx`,
  `src/components/sections/process/process2.tsx`,
  `src/components/sections/service/service2.tsx`

- [ ] **Step 1: Remove every lorem ipsum string**

```bash
grep -rn "Lorem ipsum\|lorem ipsum" src/
```
Expected after the edit: no matches.

- [ ] **Step 2: Replace courier-template copy**

Rewrite "Global Logistics Solutions", "Worldwide shipping", "Recent Delivered
Package & Parcel Supplies" and the Apply Online → Documentation → Processing →
Final Destination steps as a US moving-company narrative.

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit in that repo only**

```bash
git -C ~/Desktop/WebM8/removals/main/experia add -A src/components/sections
git -C ~/Desktop/WebM8/removals/main/experia commit -m "Replace courier template placeholder copy with mover content"
```

Do not deploy. The owner reviews and deploys.

---

### Task 11: Verification and handoff

- [ ] **Step 1: Full local gate**

```bash
npm test && npm run typecheck && npm run lint && npm run build
```
Expected: all pass.

- [ ] **Step 2: Live-path check**

Submit one request through the rendered form at 390px width using the designated
test recipient, confirm the row lands in Supabase, confirm the success panel and
booking link, then delete the test row.

- [ ] **Step 3: Layout and accessibility check**

390px, 768px and 1280px. Keyboard-only pass through the form. Confirm the sticky
CTA never covers a form control.

- [ ] **Step 4: Write the handoff notes**

Cover the seven owner decisions from the spec plus anything found during
implementation.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "Verify mover landing page and record handoff notes"
```
