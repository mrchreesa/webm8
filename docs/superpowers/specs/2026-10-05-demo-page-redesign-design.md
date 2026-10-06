# `/demo/` redesign: the Meta ad landing page for the Free Personalised Website Demo

Date: 2026-10-05
Status: design approved in conversation (direction, layout, journey, approach A, copy, motion, testing).

## Goal

A local business owner taps a WebM8 ad in Facebook or Instagram and lands on `/demo/`, almost always on a phone inside Meta's in-app browser. The ad promised a free website demo with no obligation to pay. In about two minutes the page should:

1. Confirm that promise in the first screen.
2. Prove WebM8 is good at this.
3. Collect only the details needed to make their demo.
4. Make what happens next completely clear.

Payment plans come later, and only if they like the demo.

Success means more ad clicks becoming requests WebM8 actually receives, and Meta learning from those requests (a `Lead` per saved request).

## Decisions already made

| Topic | Decision |
|---|---|
| Submission | Saved on the server (Supabase), never `mailto:`. WebM8 is emailed each request. |
| After sending | WebM8 calls them. No booking step on this page. |
| Speed promise | "We'll call you today, or first thing tomorrow if it's late." The demo is ready **within 48 hours of that call**. |
| Fields | Required: type of business, business name, town or area, their name, phone, email. Optional: a link to the business (website, Google or Facebook page). |
| Header | The full site nav, kept dark over the navy hero. Its "Get my free demo" button scrolls to the form. (Changed 2026-10-06: the first build showed only the logo and "Our work".) |
| Pricing | No prices on the page. One rule: seeing the demo is free; if they love it, WebM8 recommends a plan based on the features they need, and only then talks price. |
| Wow direction | A "live sketch" of their homepage builds as they answer (direction A), merged with a carousel of real demo sites (from direction B) into **one deck**. |
| Honesty about the sketch | The owner removed name-typing from the homepage hero because a sketch is not the real demo. Here the sketch is always labelled as a quick sketch, and the real demo cards carry the quality message. |
| Email provider | Resend, called with `fetch` (no SDK). |
| Visitor email | Yes, a short confirmation goes to the visitor. |
| Technical approach | A: reuse the homepage story's `TradeSite` designs for the sketch; save to the existing `agency_review_requests` table with `request_type = 'demo'`. |

## Reference mockups

Approved during brainstorming. They are in `.superpowers/brainstorm/36420-1791227124/content/`, which is not committed:

- `wow-direction.html` (A chosen)
- `layout.html` (option 1, "one deck")
- `journey.html` (the four steps and the success screen)

Where they differ from this document, this document wins.

## Scope

In:

1. A new `/demo/` page: hero with deck and journey, What happens next, Free means free, FAQ, sticky mobile CTA.
2. A server route that validates, saves, deduplicates and emails.
3. A Supabase migration adding two columns.
4. A Resend helper and two emails.
5. The header for `/demo/`.
6. Measurement, including Meta `Lead`.
7. Making demo promises consistent across the site.
8. Docs: `CLAUDE.md`, `README.md`, `.env.example`.

Out:

- The Meta Conversions API (server-side events). The event id is set now so it can be added later without double counting.
- Any booking, calendar or materials-upload step.
- Changes to `/movers/`, `/thank-you/` or the homepage story's behaviour.
- A CRM, or a dashboard for requests. They live in the Supabase table and the emails.
- Prices anywhere on `/demo/`.

---

## 1. Page structure

`app/demo/page.tsx` stays a server component and prerenders statically. Its only client islands are the hero's journey and deck, and the sticky CTA. In order:

1. `DemoHero`: navy (`bg-night`, `surface-dark`). It holds the pill, `h1`, subline, `DemoDeck` and `DemoJourney`.
2. `DemoNext`: "Here's what happens next." Paper ground.
3. `DemoPromise`: "Free means free." Navy ground.
4. `DemoFaq`: paper ground.
5. `DemoStickyCta`: phones only.

`DemoClosing` is **not** used on this page; the form is the page's call to action. All new components live in `components/demo/`, with page styles in `components/demo/demo.module.css` where Tailwind utilities are not enough (deck transforms, deal and stamp animations).

### 1.1 Phone layout (below `lg`)

One column, in this order:

- header (full nav)
- pill
- `h1`
- subline
- deck, about 210px tall
- dots
- the journey card

At 390×844 inside Meta's in-app browser, the step card's main input and button must sit in the first screen on step 1 (as in `layout.html`).

### 1.2 Desktop layout (`lg` and up)

- Hero at least `100svh`, in two columns.
- Left: pill, `h1`, subline and the journey card.
- Right: the deck, large (cards about 300px wide, aspect 420:900), tilting in 3D towards the pointer (fine pointers only).
- The whole hero fits in the first screen at 1440×900.

## 2. Hero copy

- Pill: "Free demo · No obligation", in neon text with a neon dot on navy.
- `h1`: "See your new website **before** you pay a thing." The word "before" is neon.
- Subline: "Two minutes now. Your demo 48 hours after our call." (`text-muted-invert`).
- The deck tag above the cards:
  - before the sketch exists: "Real demos we've designed"
  - once it exists: "Your quick sketch · real demo 48h after our call"

## 3. The deck (`DemoDeck`, client)

A fanned stack of phone-shaped cards. The front card is centred; the next and previous cards sit fanned behind it, rotated about ±10° and scaled about 0.9.

**Real demo cards.** Six cards, one per `projects` entry, in this order:

1. stitch-house
2. solvers-cleaning
3. ideal-baby
4. removals
5. allen-fitness
6. cleaning

Each card:

- shows `screenshots.mobile` (420×900 webp) with `next/image`, `sizes` set, and only the first card `priority`
- is labelled "Real demo · {project.industry}"
- does **not** link out (ad traffic should not leave); tapping a background card brings it to the front

**The sketch card.** Appears once a trade is chosen (§4). It deals onto the front of the deck (index 0) and the deck jumps to it. Whenever the journey step changes, the deck returns to the sketch if the visitor had swiped away.

**Interaction**
- Swipe with pointer events: horizontal threshold 40px, `touch-action: pan-y` so vertical scrolling still works.
- Previous and next buttons, dots, and the left and right arrow keys when the deck has focus.
- Index maths (wrapping, offset of each card from the front) is a pure function in `lib/demoDeck.ts`.

**Autoplay**
- Before the sketch exists, the deck advances every 3.5s.
- It stops for good once the sketch exists or the visitor touches the deck.
- It pauses off screen (IntersectionObserver) and in a hidden tab.
- A visible pause/play button is shown while it can autoplay (WCAG 2.2.2).
- With `prefers-reduced-motion` it never autoplays.

**Semantics:** `role="region"`, `aria-roledescription="carousel"`, `aria-label="Demo websites"`. Each card is a group labelled "{n} of {total}: {label}". The sketch card is labelled "A quick sketch of your homepage".

### 3.1 The sketch (`DemoSketchCard`)

Renders the homepage story's `TradeSite` inside a card with `container-type: inline-size`. `site.module.css` sizes everything in `cqi`, so it scales to the card.

`TradeSite` gains optional props, and the homepage keeps calling it exactly as today:

- `name?: string`: replaces `trade.exampleName` in the nav logo and its initial (`initialOf`). The logo truncates with an ellipsis, as it does now.
- `area?: string`: when non-empty, replaces the site's `badge` text with "Serving {area}".
- `standalone?: boolean`: drops the story's `styles.slot` class (absolute, hidden until the story shows it) and the tap elements.
  - Phone numbers become "Call now": the poster layout's "Call {phone}" link reads "Call now", so no fictional US number appears on a UK visitor's sketch.

The trade is the visitor's choice; "Something else" uses the existing `other` look.

A neon tag on the card reads "YOUR QUICK SKETCH".

### 3.2 The mini sketch (phones only)

While a text step is active on viewports below `lg`, a slim bar appears inside the step card, under the input. It shows the logo mark (the trade's `hot` colour, with the initial) and the business name in the trade's typeface (`siteFonts`), plus a small "LIVE SKETCH" tag. It mirrors the input on every keystroke.

It exists because the phone keyboard hides the deck while they type. When they press Next, the keyboard closes and the full sketch shows the change.

## 4. The journey (`DemoJourney`, client)

A card on navy (`bg-white/6`, `ring-white/10`) containing:

- a step label: "Step 1 of 4 · 2 minutes", then "Step 2 of 4", "Step 3 of 4", "Last step"
- a neon progress bar
- a Back link from step 2 onwards
- the step itself

Each step is a `<fieldset>` with a `<legend>` as its question.

| Step | Question (legend) | Fields | Advance |
|---|---|---|---|
| 1 | "What kind of business do you run?" | 15 radio chips from `tradeGroups` order, each with `TradeIcon` and `trade.short`. Choosing "Something else" reveals a text input "What do you do?" (required, max 80). | A **pointer** click on a chip advances immediately (except "Something else", which needs Next). Keyboard users arrow through the radios and press Enter or Next; selection alone never advances. |
| 2 | "What's your business called?" | `business` (required, max 120, `autocomplete="organization"`, placeholder "Reyes Plumbing") | Next, or Enter |
| 3 | "Where do you work?" | `area` (required, max 120, `autocomplete="address-level2"`, placeholder "Austin, TX or West London"). `link` (optional, max 500, `inputMode="url"`), labelled "Got a website, Google or Facebook page? (optional)", placeholder "Paste a link" | Next, or Enter |
| 4 | "Where should we call you about {business}'s demo?" | `name` (required, max 120, `autocomplete="name"`), `phone` (required, `type="tel"`, `autocomplete="tel"`), `email` (required, `type="email"`, `autocomplete="email"`) | Button "Get my free demo" |

Under the step 4 button, in small `text-muted-invert`: "We'll call you today, or first thing tomorrow if it's late. No payment. No obligation." Then a line: "We only use your details to talk to you about your demo." with a link to `/privacy/`.

**Behaviour**

- **Validation.** Each step validates only its own fields with the shared `lib/demoRequest.ts` before advancing. An error shows under the field (`FormField` styles on navy), and focus moves to the field.
- **Focus.** On a step change, focus moves to the new legend (`tabIndex={-1}`). A polite live region announces "Step N of 4". On phones the card scrolls into view.
- **Saved answers.** Answers persist in `sessionStorage` under `webm8:demo-journey` as `{ v: 1, step, answers, submissionKey, startedAt }`, so a reload or an accidental Back restores the step and answers.
  - `submissionKey` is a `crypto.randomUUID()` made once per journey.
  - Storage access is wrapped in try/catch; when it fails, the journey simply does not persist.
- **Spam checks.** A hidden honeypot input (`website_hp`, off-screen, `tabIndex={-1}`, `autocomplete="off"`).
- **Submit**
  - The button reads "Sending…" and is disabled; nothing turns green before the server answers.
  - The browser posts JSON to `/api/demo-request/` (trailing slash, because of `trailingSlash: true`) with:
    - the answers
    - `submissionKey`
    - `elapsedMs` (since `startedAt`)
    - `website_hp`
    - the attribution from `lib/leadAttribution.ts`: the `utm_*` values from the URL, or the stored ones, written back to the same `webm8:lead-attribution` key
    - `referrer` (`document.referrer`, max 300)
    - `pagePath`
- **Responses**
  - `200 { ok: true, id }`: show the success state (§5).
  - `400 { ok: false, errors }`: jump to the step holding the first field in error and show the messages.
  - `429` or `502`, or a network failure: an inline message on step 4. Answers are kept. The message is "That didn't go through. Please try again." with a Try again button, and "or email info@webm8agency.com" as a last resort.
  - **No `mailto:` path and no optimistic success.**

## 5. Success state

The journey card is replaced in place (no navigation):

- **The deck** returns to the sketch, and a stamp lands on it: "✓ RESERVED · {BUSINESS}", neon outline on translucent night, rotated −8°. The mascot's bubbles burst around the card, reusing the `/thank-you/` bubble pattern.
- **Heading:** "You're in, **{first name}**." The first name is the first word of `name`.
- **Body:** "We'll call you today on {phone}. We've emailed you a copy." When `brand.phone` is set, add "Our call will come from {brand.phoneLabel || brand.phone}."
- **Timeline** (✓ marks only the first):
  1. Request received: just now
  2. A quick call: today, about 5 minutes, to learn about {business}
  3. Your demo: ready within 48 hours of that call, shown on a short video call
  4. You decide: love it? We'll recommend a plan; if not, walk away
- **More demos:** a ghost button "See more demos we've designed →" moves the deck to the first real demo (it stays on the page).
- **WhatsApp:** a button appears when `brand.whatsapp` is set, using `whatsappHref` from `lib/leadAttribution.ts`.
- **After a reload:** the success record replaces the journey in `sessionStorage` as `{ v: 1, done: { id, business, firstName, phone, email } }`, so a reload shows the success state again. The Meta `Lead` fires only in the submit handler, never when restoring.

## 6. Lower sections

**`DemoNext`** (paper): `h2` "Here's what happens next." Three steps, in a row on desktop and stacked on phones:

1. **Today: A quick call.** "About five minutes. We learn about your business, your customers and what you want more of."
2. **Within 48 hours of our call: Your demo.** "A homepage designed for your business, with your name, services and area on it. We show it to you on a short video call."
3. **Then: You decide.** "Love it? We'll recommend a plan based on the features you need. Not for you? Walk away. We won't chase."

**`DemoPromise`** (navy, `surface-dark`): `h2` "Free means free." Four short points with neon check icons:

- "No card. We never ask for payment details to make your demo."
- "No contract. Seeing your demo commits you to nothing."
- "No chasing. Not for you? Say so, and that's the end of it."
- "Plans come after. If you love it, we recommend a plan based on the features you need. Only then do we talk price."

**`DemoFaq`** (paper): native `<details>`/`<summary>`; several can be open at once.

- **What's the catch?** "There isn't one. Businesses that see their own website are far more likely to work with us. If you don't, we've spent a couple of hours and you've spent nothing."
- **How much does a website cost?** "It depends on the features you need, so we recommend a plan after you've seen your demo and told us what you want. You'll know the exact price before you agree to anything."
- **What happens after the demo?** "If you'd like to go ahead, we recommend a plan, finish the site with your logo, photos and details, and put it live. If not, that's the end of it."
- **Do I need to prepare anything?** "No. If you have a logo, photos or a current website, mention them on our call. They help, but we can design your demo without them."
- **Will my demo look like the sketch on this page?** "No. The sketch is a quick idea made automatically from your answers. Your real demo is designed by hand for your business."
- **Do you work with businesses in the UK and the US?** "Yes, both. We call you at a time that suits your time zone."
- **What do you do with my details?** "We use them only to contact you about your demo. We never sell them." Then a link to the privacy page.

**`DemoStickyCta`** (below `md` only):

- A neon pill fixed to the bottom with safe-area padding.
- It appears when the journey card is fully out of view (IntersectionObserver) and the request has not succeeded.
- It reads "Get my free demo ↑", or "Continue my demo ↑" once step 1 is done.
- It scrolls back to the journey card and focuses the current step's legend.
- It is hidden while any input is focused, so it never sits on the keyboard.

## 7. Header

In `components/layout/Header.tsx`, add `isDemoPage` (`pathname?.startsWith("/demo")`):

- The full nav stays, as on every other page, with the burger and mobile drawer on phones.
- The header stays dark, as on the homepage, because the form sits in a long navy hero.
- `DemoCtaButton` scrolls to the journey card (`#demo-journey`) and focuses the current step's legend when the card is on the page, instead of linking `/demo/` to itself.

## 8. Server

### 8.1 Validation (`lib/demoRequest.ts`, rewritten)

The client (per step) and the server (whole request) share this module. It exports:

- the field types
- `validateDemoStep(step, input)`
- `validateDemoRequest(input)`, which returns either `{ ok: true, value }` or `{ ok: false, errors }`
- `hasOwnWebsite(link)`

**Rules**

- **Text.** Collapse whitespace and trim, then apply the max lengths given in §4.
- **`trade`** must be a valid `TradeKey` (`parseTrade`). `tradeOther` is required only when `trade === "other"`, and is otherwise dropped.
- **`email`** uses the existing pattern, max 254.
- **`phone`** may contain only `+`, digits, spaces, `(`, `)`, `-` and `.`, and must have 7 to 15 digits. It is stored as typed (tidied), max 40 characters. Both "07700 900123" and "(512) 555-0142" pass.
- **`link`** is optional:
  - with no scheme, `https://` is added
  - it must parse as a URL with a dot in the host and no spaces, max 500
  - it is stored normalised
- **Bots.** A non-empty `website_hp`, or `elapsedMs` under 1500, rejects the request with a generic message.
- **`submissionKey`** must be a UUID.
- **Attribution** values are cleaned with the existing `leadAttribution` rules (max 100; values containing `@` or `{{` are dropped).

**`hasOwnWebsite(link)`** is the "is this their own site rather than Facebook, Instagram or Google Maps" heuristic, currently written inline in `app/api/mover-review/route.ts`. It moves here, and that route imports it.

The mailto helpers (`demoRequestSubject`, `demoRequestMailFields`) are deleted.

### 8.2 Route (`app/api/demo-request/route.ts`)

`runtime = "nodejs"`, `dynamic = "force-dynamic"`. `POST` only. The handler:

1. Parses the JSON body. A body it can't parse returns `400`.
2. Rate-limits with the same in-memory pattern as `mover-review`: 5 per 10 minutes per `x-forwarded-for` IP. Over the limit returns `429`.
3. Validates with `validateDemoRequest`. A failure returns `400` with the errors.
4. **Idempotency.** It looks up `submission_key`; if a row exists, it returns `200 { ok: true, id }` **without** sending emails again.
5. Inserts into `agency_review_requests` (`supabaseTableRequest`, `return=representation`):

   | Column | Value |
   |---|---|
   | `request_type` | `'demo'` |
   | `contact_name` | name |
   | `company_name` | business |
   | `email` | email |
   | `phone` | phone |
   | `main_city_state` | area |
   | `business_link`, `website_url` | link, or `null` |
   | `has_website` | `hasOwnWebsite(link)` |
   | `business_type` | trade |
   | `business_type_other` | tradeOther, or `null` |
   | `submission_key` | submissionKey |
   | `utm_source` … `utm_term` | the cleaned attribution |
   | `referrer`, `page_path` | as sent |

   `stage` defaults to `received`.
6. If the insert fails, it looks up `submission_key` again (the same race handling as `mover-review`). Only if nothing is found does it return `502`.
7. Sends both emails (§8.4) in parallel with a 5-second timeout, **awaited before responding**, because work after the response is not guaranteed on Vercel. A failed or skipped email is logged (`console.error("demo-request: …", id)`) and does not change the response: the row is saved, so the request succeeded.
8. Returns `200 { ok: true, id }`. It returns nothing else: no personal data comes back.

### 8.3 Migration

New file: `webm8-platform/supabase/migrations/202610050001_demo_requests.sql`. That directory is not a git repository, as with the earlier migrations.

```sql
-- /demo/ requests (Free Personalised Website Demo) share the review-request
-- table with /movers/, told apart by request_type = 'demo'.
alter table public.agency_review_requests
  add column if not exists business_type text,
  add column if not exists business_type_other text;

comment on column public.agency_review_requests.business_type is
  'The trade key chosen on /demo/ (lib/trades.ts TradeKey). Null for /movers/ requests.';
comment on column public.agency_review_requests.business_type_other is
  'Free text when business_type is ''other''.';
```

It adds no check constraint on `request_type`, so existing rows are never at risk. The owner applies it to the live `webm8-platform` project (or approves applying it) before the page deploys.

### 8.4 Email (`lib/resend.ts`, `lib/demoEmail.ts`)

**`lib/resend.ts`** exports `sendEmail({ from, to, replyTo, subject, text, html })`. It calls `POST https://api.resend.com/emails` with `Authorization: Bearer ${RESEND_API_KEY}`.

- If the key is unset, it logs and returns `{ ok: false, reason: "not_configured" }` without throwing.
- It never throws for non-2xx responses either; it returns `{ ok: false, reason }`.

**Constants live in code, not environment variables** (an unset variable is the failure the movers handoff recorded):

- `demoEmailFrom = "WebM8 <hello@webm8agency.com>"`
- the notification goes to `intakeEmail`

**`lib/demoEmail.ts`** holds pure builders that return `{ subject, text, html }`. All interpolated values are HTML-escaped. They are unit-tested.

**The notification to WebM8**
- To: `intakeEmail`.
- Reply-To: the visitor's email.
- Subject: "New demo request: {business} ({Trade label}, {area})".
- Body: every field, with the phone as a `tel:` link and the link clickable; the campaign values that are present (`utm_campaign`, `utm_content`); the request id; and the received time in UTC.

**The confirmation to the visitor**
- To: their email.
- Reply-To: `intakeEmail`.
- Subject: "We've got your request, {first name}".
- Body:
  - "Thanks, {first name}. We'll call you today about {business}'s free website demo, or first thing tomorrow if it's late."
  - When `brand.phone` is set: "Our call will come from {brand.phoneLabel || brand.phone}."
  - The three next steps from §6.
  - "No payment. No obligation."
  - "Reply to this email if anything changes."
- Plain, readable HTML plus a text part, with no images and no tracking pixels.

## 9. Measurement

`lib/analytics.ts` adds `trackAcceptedDemoRequest(id, details)`. Once per id (an in-memory set, as with the review request), it sends:

- `trackEvent("demo_request_accepted", details)`, where details are `trade` and the attribution values
- `window.fbq?.("track", "Lead", { content_name: "Free personalised website demo" }, { eventID: id })`

The event id lets a future Conversions API send deduplicate against this event.

| Event | When | Details |
|---|---|---|
| `demo_step_completed` | Steps 1 to 3 pass validation and advance | `step`, `trade` |
| `demo_request_accepted` | Server returned `ok` (plus Meta `Lead`) | `trade` and attribution |
| `demo_request_failed` | Validation, rate limit, server or network failure on submit | `reason`: `validation`, `rate_limited`, `server` or `network` |
**Never** pass names, business names, areas, phones, emails or links to `trackEvent`. `demo_request_email_opened` is removed, and so is the sentence in `CLAUDE.md` saying the demo form never fires `Lead`.

## 10. Motion

All motion uses `--ease-brand`, and none of it blocks input.

| Moment | Motion |
|---|---|
| Page load | `h1` lines rise in one after another (the `/thank-you/` pattern). Deck cards deal up from below and fan out, staggered by 80ms. |
| Deck idle | Autoplay (§3). On fine pointers, the front card tilts up to 8° towards the pointer. |
| Trade chosen | The sketch card scales from 0.6 and drops onto the front with a slight overshoot (about 500ms), and the fanned cards shift back. Changing trade later crossfades the sketch (about 300ms). |
| Typing | The sketch and mini sketch update on every keystroke. The logo initial flips when it changes. |
| Step change | The outgoing step fades and slides left 12px, and the incoming one slides in from the right. Back reverses the direction. The progress bar width animates. |
| Success | The stamp scales 1.4 → 1 with a small rotation settle, and 7 to 9 bubbles burst from the card (the `/thank-you/` bubble keyframes). |

**Reduced motion.** Under `prefers-reduced-motion: reduce` (already handled globally in `globals.css`, and checked explicitly in JS for autoplay and tilt), everything changes state instantly and nothing autoplays. Every state is still reachable.

## 11. Accessibility

- **Steps.** Each one is a `fieldset` and `legend`. Chips are native radio inputs styled as chips, with a visible neon focus ring (`surface-dark`).
- **Focus and announcements.** Focus moves to the new legend on every step change. A polite live region announces the step. Errors are linked to their inputs with `aria-describedby` and `aria-invalid`.
- **Deck.** The deck is a labelled carousel with buttons for previous, next and pause/play, plus arrow keys. Background cards are `inert` to the tab order except through the deck's own controls.
- **Contrast.** All hero text is on navy. Neon is never text on paper. Body text on paper is `ink`; secondary text is `muted`.
- **Touch targets.** At least 44×44px for chips, buttons and the sticky CTA.

## 12. Consistency elsewhere

- **`lib/site.ts` `demoSteps`** (used by `DemoClosing`) becomes three steps:
  1. "Tell us about your business": "Your trade, your area and how to reach you. It takes about two minutes."
  2. "A quick call": "The same day, about five minutes, so we understand what you need."
  3. "Your demo": "Within 48 hours of our call, shown to you on a short video call."
- **`DemoClosing`**'s small print becomes "No payment. No obligation. We call you the same day."
- **The `/demo/` description** in `lib/seo.ts` (`indexableRoutes`) and the page's `createPageMetadata` becomes: "Tell us about your business and we'll design a homepage for it, free. We call you the same day and show you your demo within 48 hours of that call. No payment, no obligation." The title stays "Free Personalised Website Demo", and `/demo/` stays indexable.
- **Unchanged:** `/contact/` and `/pricing/` keep "within one business day". Those promises are about estimates and contact, not the demo.

## 13. Removed

- `components/forms/DemoForm.tsx` (the `mailto:` form).
- The mailto helpers in `lib/demoRequest.ts`, and their tests.
- The `demo_request_email_opened` event.

## 14. Configuration and owner tasks

- **Resend:** create the account and verify `webm8agency.com`, which needs three DNS records at the domain's DNS host. Then add `RESEND_API_KEY` to Vercel (Production and Preview) as **server-only**, with no `NEXT_PUBLIC_` prefix. Add it to `.env.example` with a comment, and to the server-only list in `CLAUDE.md`.
- **Migration:** apply the §8.3 migration to `webm8-platform` before deploying.
- **Meta:** `NEXT_PUBLIC_META_PIXEL_ID` must be set for `Lead` to reach Meta. That is already documented, but it is the point of this page.
- **Before launch:** confirm the "we'll call you today" promise holds at weekends. If it does not, the copy in §4, §5, §6 and §8.4 needs a weekend clause.

## 15. Testing

**Unit tests** (`npm test`, `node --test`, imports with `.ts` extensions):

- `lib/demoRequest.test.ts`:
  - each required field missing
  - max lengths
  - `tradeOther` required only for `other`
  - phone formats: UK mobile, UK landline with spaces, US with brackets, `+44`, `+1`; too short; letters
  - link normalisation, and rejection of junk
  - honeypot, too-fast, bad `submissionKey`
  - `hasOwnWebsite` for a Facebook page, an Instagram page, a Google Maps link and a real domain
  - `validateDemoStep` checks only that step's fields
- `lib/demoEmail.test.ts`:
  - subjects
  - HTML escaping (`<script>` in a business name)
  - the optional link and `brand.phone` lines appear only when set
  - the first name is derived from the full name
- `lib/demoDeck.test.ts`: wrapping, offsets for 1 and 7 cards, and inserting the sketch at the front.

**Static checks:** `npm run lint`, `npm run typecheck` and `npm run build` all pass. `/demo/` is still listed as static (○) in the build output.

**Browser checks** (Playwright, against `next dev`):

- 390×844, 360×740 and 1440×900.
- The step 1 input and button are in the first screen at 390×844.
- A complete keyboard-only journey.
- Reduced motion: no autoplay, and all states reachable.
- Reload mid-journey restores the step and answers; reload after success shows the success state and does not fire `Lead`.
- Double-tapping submit creates one request (one row, one `Lead`).
- A forced server failure shows the retry message, never success.
- No horizontal scroll at any width.

**One real end-to-end send, only with the owner's go-ahead.** `.env.local` points at the live `webm8-platform` project, so this check:

- submits one request whose business name starts with "TEST"
- confirms the row, the notification and the confirmation email (sent to the owner's own address)
- then deletes the row

## 16. Risks

- **Parallel homepage work.** `TradeSite.tsx`, `lib/trades.ts`, `lib/site.ts` and the story files have uncommitted changes in the working tree, and the story is gaining real project screenshots. Implementation starts after that work is committed, on a branch. The change to `TradeSite` is limited to the three optional props in §3.1.
- **The sketch is mistaken for the demo.** This is mitigated by the labels on the sketch and deck, the FAQ answer, and the real demo cards beside it.
- **Email delivery.** Resend needs the domain verified, and until then the visitor confirmation may land in spam or fail. The request is still saved, so a lead is never lost to an email failure; it is just not announced. Check the table until the domain is verified.
