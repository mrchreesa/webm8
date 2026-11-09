# Instant Websites loading performance — 9 November 2026

Published to `https://instant.webm8agency.com` with production deployment `dpl_8pXLq2M1bknfukRVUyByV6RNaKUM`.

## Changes

- Prerender and CDN-cache the public Instant page. `dynamic = "error"` prevents request-specific data being added silently to this cached page. Billing configuration is deployment-scoped; customer data remains in the private session API.
- Render the empty first-step form immediately, disabled and marked busy until draft/session recovery finishes. This reserves its space and prevents the gallery moving into view while the form loads.
- Load the demo gallery component when it comes within 320 pixels of the viewport. Its existing responsive geometry reserves the space; the existing demo links, modal, and image handling are reused.
- Skip the database lookup for a newly generated session token, which cannot already own an order. Valid existing cookies still restore from the database. Session responses remain `private, no-store`, with HttpOnly cookies and cross-site rejection.

## Live measurements

| Measurement | Before | After |
| --- | ---: | ---: |
| Initial HTML, decoded bytes | 116,607 | 40,798 (65% smaller) |
| Image elements in initial HTML | 50 | 2 |
| Public page cache | MISS, private/no-store | PRERENDER, then HIT |
| Median page HTTP request, 3 samples | 244 ms | 212 ms |
| Median fresh-session HTTP request, 3 samples | 466 ms | 187 ms |

Samples used Node fetch from the same workstation, including the response body. Before page samples: 880/242/244 ms; after: 454/33/212 ms. Before fresh-session samples: 764/466/213 ms; after: 187/208/130 ms. These small samples are diagnostic, not a field-performance guarantee or a Core Web Vitals score. The image count describes markup, not 48 distinct image downloads. In mobile Brave the gallery remained absent while filling step one, then appeared on approach.

## Verification

- All 156 automated tests passed, including PostgreSQL integration tests; none skipped. TypeScript, targeted ESLint, the strict UI audit, and the production build passed.
- Tested the session route with an unavailable database: no-cookie and malformed-cookie requests still succeeded with a new private session; an existing valid cookie returned 503 rather than silently discarding recovery; cross-site requests returned 403.
- Brave desktop and 390-pixel mobile checks covered required-field validation, the design simulator, draft restoration, deferred gallery rendering, and opening/closing a demo by keyboard. The mobile document had no horizontal overflow. The viewport override was reset after testing.
- The live domain resolves to the new deployment. Three fresh live session requests returned 200 with the expected empty session, private/no-store headers, and HttpOnly cookies. An existing synthetic order restored its saved details and automatically opened the checkout loading state.
- A development hydration diagnostic identified injected `data-sharkid` attributes and a `shark-icon-container` from the browser's autofill extension. No warning suppression or browser security changes were introduced. A clean extension-free browser run was not available in this pass.
- This performance pass did not complete another Stripe transaction or send emails. The previously verified sandbox checkout → signed webhook → CRM → two delivered emails with CC is recorded in `instant-signup-emails.md`. The browser-debugger limitation affecting Stripe iframe loading is also recorded there.

Framework references: [Next.js route segment configuration](https://nextjs.org/docs/15/app/api-reference/file-conventions/route-segment-config), [Next.js lazy loading](https://nextjs.org/docs/app/guides/lazy-loading).
