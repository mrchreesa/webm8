# Instant Websites regional verification — November 10, 2026

The regional pricing release passed the checks below. Production is available at https://instant.webm8agency.com/.

## Production checks

| Check | Result |
| --- | --- |
| UK request | HTTP 200; `/instant`; 11 occurrences of £39 and no $79 |
| US request from the remote Vercel fetcher | HTTP 200; `/instant/us`; 11 occurrences of $79 and no £39 |
| Language | `en-US`; US English in signup, pricing, preview, FAQ, confirmation and email payloads |
| Live Stripe prices | Active GBP 3900/month and USD 7900/month prices on the intended product |
| Session protection | Private/no-store response; Secure, HttpOnly, SameSite=Lax cookie |
| Rejected requests | Cross-origin checkout 403; unauthenticated brief and portal 401; unsigned webhook 400; unauthorized email retry 401 |
| Webhook | Enabled production endpoint with the required billing event subscriptions |
| UI | Desktop and 390-pixel mobile layouts; no horizontal overflow on mobile; field errors focus the first invalid field; FAQ works with click and keyboard |
| Gallery | Production images load and the demo gallery renders |

The live session API returns GB to a fresh UK visit. Tests cover the US selection and the GB fallback for unknown countries. A restored US order remained $79 after its browser was routed through the UK proxy.

## Real Stripe sandbox journeys

Both journeys used the application, a local PostgreSQL database, real Stripe sandbox checkout, Stripe CLI forwarding signed events, and the hosted CRM's sandbox intake. Synthetic records are labeled `[TEST DO NOT BUILD]` and use example.com email addresses.

| Evidence | UK | US |
| --- | --- | --- |
| Checkout amount due today | £0 | $0 |
| Recurring monthly amount | £39 | $79 |
| Initial trial duration | 864,000 seconds (10 days) | 864,000 seconds (10 days) |
| Checkout and brief | Completed; success screen shown | Completed; success screen shown |
| CRM receipt | `a3e1bbeb-011a-4f38-a250-5e668006cd0f` | `9023d89e-3ffd-43f4-b78b-876b2abd1a1c` |
| First paid invoice after ending the sandbox trial | GBP 3900, paid | USD 7900, paid |
| Final subscription state | Canceled in Stripe and application database | Canceled in Stripe and application database |

UK checkout displayed the declined-card error and recovered successfully after entering Stripe's successful test card. The US journey preserved the completed checkout and draft after reload, retained the original market when the request country changed, and displayed scheduled cancellation correctly.

Subscription and invoice events that arrived before checkout was linked returned a retryable response. Replaying each real event twice after linking returned 200 and left exactly one event ledger row. Subsequent invoice and cancellation events returned 200 and updated the database.

Sandbox subscriptions: `sub_1UaIG8BCq3J979VqiMGJseCa` (UK), `sub_1UaI7rBCq3J979Vq3okwsoYb` (US). Paid sandbox invoices: `in_1UaIIJBCq3J979Vq4B3lBxAK` (UK), `in_1UaIIMBCq3J979Vq0J70lnw8` (US). The trials were deliberately ended early only after recording their original ten-day duration, to verify the first paid billing cycle.

## Automated and email checks

- Website suite: **160 passed, 0 failed, 0 skipped**, including the PostgreSQL integration suite.
- Companion CRM signed-intake integration test passed, including both regional payloads and duplicate handling.
- TypeScript, targeted ESLint, production build, and strict UI audit passed; the audit reported zero findings.
- Both submitted orders generated exactly two confirmation/notification payloads. Each used its correct price, excluded the other currency, and used US English.
- Email worker delivery was verified with an injected simulated sender: one send per queued message, with no duplicate send on a second run. Queueing the same order twice did not duplicate messages.

## Corrections and release

Verification found small copy remnants and corrected “Removals” to “Moving,” “round the corner” to “around the corner,” “turn up” to “show up,” and the UK form's “postcode” placeholder to “postal code.” No payment logic changed during this verification pass.

Final website deployment: `dpl_5hoPhR1J3ZvF4dyFoGxguJs6C5We` (`webm8-instant-px0vrr0ao-mrchreesas-projects.vercel.app`). Both production domain aliases completed promotion. Regional CRM deployment: `dpl_B23xryWg1y12u6KE4FC9z5YREALs`.

The temporary development server, country proxies, Stripe listener, and local PostgreSQL instance were stopped. The verification-only credential file and generated build directory were removed. Both sandbox subscriptions were canceled; the clearly labeled sandbox CRM receipts remain as evidence.

## Limits

No live card payment or real-money renewal was performed. No real email or WhatsApp message was sent in this verification pass; email content, queueing, retries, and duplicate prevention were tested with a simulated sender. Real inbox delivery and live bank authorization therefore are not claimed as verified here. The sandbox billing cycles and cancellation events above were real Stripe sandbox operations, not mocked Stripe responses.

The local development image optimizer could not follow the gallery asset redirects in this harness; the deployed gallery and its images were verified separately and loaded successfully. A PostgreSQL SSL-mode deprecation warning appeared in runtime logs; it did not cause a failed request during these checks.
