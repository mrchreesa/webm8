# Instant Websites verification — 9 November 2026

## Published analytics

The Instant signup reports named clicks, form entry, the three ordered steps, validation/submission failures, checkout readiness, server-confirmed trial status and CRM-confirmed brief receipt. Opening checkout does not count as a confirmed trial. The confirmed-trial event also handles restored sessions and Stripe redirects.

Field progress records only fixed field identifiers, step numbers, empty/has-content booleans and observation times. It never includes typed answers, selected option values, text lengths, card data or filenames. Changes are batched; clearing a field replaces its previous state. Payment-provider frames are excluded. Browser privacy signals and measurement consent apply.

In CRM → Analytics → WebM8 Instant Websites:

- Visit explorer → select a visit → Form progress shows its latest observed field states.
- Performance shows the ordered signup funnel, step friction, field completion, named clicks, sources, devices and performance diagnostics.
- Refresh retrieves current observations. A visit is classified as unfinished after 30 minutes without received activity and without an observed successful submission. Historical field progress cannot be reconstructed.
- Leads links to the existing WebM8 CRM intake, where submitted briefs are stored.

## Evidence

- Website: 147 automated tests passed, including the PostgreSQL-backed checkout/brief integration suite.
- CRM: 150 automated tests passed.
- Analytics: 85 automated tests passed, including resumed-funnel and field-clearing coverage.
- Website adapter → signed HTTP intake → CRM validation → PostgreSQL → receipt exercised with a disposable database. Complete brief retained; retry created one lead.
- Built tracker executed against a synthetic DOM/event harness: empty/filled/cleared states, consent withdrawal, privacy signals and payment-field exclusion passed.
- Production collector exercised with a disposable analytics site: accepted progress, rejected unauthorized origins, stripped injected answer canaries, retained the latest clearing on stale retry and stored one cumulative page row.
- Brave: confirmed the collector stored no events while Do Not Track and Global Privacy Control were enabled. Privacy settings were preserved.
- Brave through CRM shared login: verified the live Performance table and per-visit progress displayed synthetic name=has-content and email=empty. The test site and rows were deleted afterward.
- Brave: live checkout rendered card number, expiry and security-code inputs automatically on load and after Continue; step one retained its phone field and Continue label.
- Non-billing local preview: completed all three steps and Submit; verified the one-working-day success message and email/WhatsApp revision instructions. This preview sent no real brief or messages.
- Type checks, production builds and strict UI audits passed. Public website/tracker and CRM health returned HTTP 200.

## Limits

No live card details were entered, no trial subscription was confirmed, and no real charge, renewal, cancellation or delivery message was performed. The real payment lifecycle therefore still needs a controlled owner checkout before it can be described as fully verified. The preview success screen is UI evidence, not evidence of live payment or message delivery. Privacy-blocked traffic and third-party payment-field interactions are intentionally absent from analytics. Visual session recordings/heatmaps were not enabled.

Analytics release: `dpl_CntzQcspgy9CqnxH8etLh448dvaM`. Website release including redirect measurement: `dpl_CAuKz1r6eCW2ubAJ91ENRwsxYf39`.
