# Instant Websites saved drafts

Owner request, 10 November 2026: show entered form answers before submission, including before Continue.

## Where to find them

Analytics → WebM8 → WebM8 Instant Websites → Visit explorer. Choose a visit marked Saved draft to see its latest answers and estimated country. The Saved drafts section also lists drafts without a matching visit. Only the workspace owner and managers can read saved answers. Dates filter the latest save, in UTC. The list loads on open or explicit Refresh, 20 rows per page.

The report displays the latest partial answers, first/last save, last observed form step and server-derived checkout progress. An unfinished draft is not a submitted lead or proof of marketing permission. Completed briefs still go to WebM8 CRM. Earlier uncollected answers cannot be recovered.

Each draft shows the estimated country of the connection at its latest accepted save. The submitted CRM lead uses the country from the first accepted brief submission, even if delivery is retried. Unknown is shown when no country was recorded; the billing market, service area and phone number are not used to infer it.

## Data boundary

Drafts live in the Instant Websites private Postgres database, in `instant_websites.drafts`. No raw values were added to the anonymous telemetry collector or its events. The report reads from the fixed website endpoint using a separate server-only HMAC secret, after workspace membership and exact website ID/origin checks. Read signatures include the body and expire after five minutes. Neither session-cookie hashes nor Stripe identifiers are returned in the report.

The signup automatically saves edited fields after an 800ms typing pause, on blur, and on browser departure where delivery is possible. The form links to the saved-progress privacy page. Latest answers replace earlier snapshots, so clearing a field removes its earlier value. Only declared business/contact fields are allowed; payment fields, consent assertions, files and arbitrary keys are excluded. Input may be incomplete or unverified. Browser/network interruption can prevent the final save.

A fresh signup saves drafts independently of optional website measurement. An explicit opt-out in an already-open tab from the previous form version is still respected. Clearing all entered fields or completing a signup removes the visible draft. Draft availability follows the form's existing 24-hour lifetime. The existing 15-minute retry schedule purges expired and submitted drafts; its cleanup failure is isolated from email delivery. No new email or billing action was added.

## Release and verification

- Analytics: `dpl_BmMCUX91NQv4jaqaQZhbzoSonrgW`.
- Instant Websites: `dpl_8xyQBXfd61dyyRjT5etPiGdCD4dt`.
- Production migration 004 applied to `webm8_instant`; runtime table privileges verified in Neon. The existing restricted role and private schema remain in use.
- Separate `INSTANT_DRAFT_REPORT_SECRET` installed in both production projects. `INSTANT_DRAFTS_ENABLED=1` enabled only on the Instant project.
- Release snapshots in `/tmp/webm8-drafts-release` were reconstructed from the previous live deployments, retaining existing work and excluding unrelated concurrent authentication edits.
- Analytics: 86 tests passed, typecheck and production build passed.
- Instant: 149 unit tests passed, two database tests skipped in the ordinary unit run; the new seven-check draft suite separately passed against disposable local Postgres. Typecheck and production builds passed.
- Both UI strict audits passed.
- Live browser check: partial name and invalid/incomplete email appeared before Continue/Submit; clearing email updated the report; switching saving off removed the record while retaining form input. Phone viewport had no horizontal document overflow.
- Live boundary checks: missing session 401, wrong origin 403, unsigned private report 401; privacy details 200. Duplicate and stale-save receipts verified on the final release.
- Synthetic browser and API draft values were removed. No checkout, subscription, submitted enquiry or email was created by these checks.

Source changes remain in the application workspaces. No blanket Git push was used: other unpublished work is present in the platform repository.
