# Stripe / CRM integration handoff — 9 November 2026

Custom Checkout Elements integration lives in this worktree. Owner confirmed £0 today, 10-day trial from confirmed checkout, £39 total/month, no tax collected, cancellation anytime without a fee. Product `prod_Vb8QuLgWtXkWKt`, price `price_1UZw9PBgZAK4OqdMp4l3240z` are verified live.

## Live configuration

Production Vercel project: `webm8-instant`, `prj_wsGxoy2f1WDJyW7HVBux5VHm39Pu`, domain `https://instant.webm8agency.com`.

The owner personally generated the restricted Stripe key; the Stripe task stored it as a Production Secret through the UI. Readable settings and publishable key are also configured. The customer portal `bpc_1UZx8sBgZAK4OqdMLJjMi0Vl` supports cancellation at period end, invoice history and payment-method updates, with no proration/cancellation fees or plan changes. Login: `https://billing.stripe.com/p/login/fZu8wOexM7i3ecD7U933W00`.

Webhook `we_1UZxQ0BgZAK4OqdMy9jzjtyc` targets `/api/instant/webhook/`, API `2026-10-28.endive`, with exactly the 16 events from `BILLING_EVENTS`. It is ACTIVE; its signing secret is a Production Secret. The owner explicitly requested direct live setup instead of creating a sandbox. No live subscriptions or payments may be completed by the agent during verification.

## CRM and data

The CRM chat deployed the full typed HMAC intake at `https://webm8-crm.vercel.app/api/webhooks/instant-websites`; the separate test endpoint ends in `instant-websites-sandbox`. Long answers, exact site/order references, distinct public/private phone details and billing IDs survive intact. Production and test secrets are separate. The CRM chat owns those configured Vercel variables.

Dedicated `webm8_instant` and `webm8_instant_sandbox` databases are provisioned. Runtime roles have only CONNECT, schema USAGE and SELECT/INSERT/UPDATE, isolated from CRM and each other. Initial migration applied. The CRM chat applied migration002 to both databases and verified lost-response, edited-retry and concurrent same-payload recovery. The UI restores the frozen payload on `restoreBrief:true`, uses server answers on success, and ignores edited browser drafts when `briefPending` is set.

Ignored0600 local test config files: `.env.instant-database.local` and `.env.instant-crm-sandbox.local`. No production database URL was saved locally. Do not run migrations with the runtime role.

## Release status

Production deployment `dpl_6oWxwxhrV7fhPXMtXFtLZYbDFEtx` is promoted at `https://instant.webm8agency.com`, with `INSTANT_BILLING_ENABLED=1`. The npm prebuild hook runs the price/portal/database preflight when enabled. Live verification created only unconfirmed checkout sessions, never a subscription/payment. Actual payment confirmation, trial expiry and cancellation remain owner checks.

Final local suite passed all142 tests, including disposable Postgres recovery/integration tests; typecheck, targeted ESLint, strict UI audit, staged production build and production dependency audit passed. CRM independently passed150 tests and signed hosted submission/idempotency/isolation checks; synthetic records were removed through its regular deletion service with tombstones retained.

Our local dev used3057 and `.next-billing-dev` and is now stopped; isolated builds used `.next-billing-build`. Preserve the user's existing server3049 and recent hero/guarantee copy removals. Native Brave is owned by the Stripe task during setup; CRM coordination must avoid tab interference.

## Live verification evidence

The Vercel production prebuild verified the £39 price, portal configuration and all required database tables/brief_submission column using the deployed restricted credentials. Staged and public pages/session endpoints returned200; private sessions set Secure/HttpOnly/SameSite=Lax cookies and no-store. Wrong-origin checkout403; missing-session brief/portal401; unsigned webhook400.

The actual public checkout rendered live Stripe Card, Klarna and Revolut Pay options. The amount/trial guard passed: GBP0 today, next3900p and10days. Opened Card inputs and checked desktop plus440×956 mobile layouts. No card details entered, no Start my free trial action performed. Browser console issues inspected were Brave-blocked Stripe/Google telemetry and MetaMask extension messages; Vercel error-level entries were pg SSL deprecation warnings, with successful DB requests.

The synthetic staged order `110494b2-0fb5-4c8f-a899-2bd463cc8842` was retried with changed business details, expiring its original unconfirmed session and replacing it. Stripe Dashboard verified `checkout.session.expired` delivery200OK at18:52:16GMT, attempt `wc_1UZxfwBgZAK4OqdMCqhkXpTZ`. This proves real signature verification, Checkout retrieval and callback handling; expired replaced sessions intentionally return200 without inserting an event ledger record. Preserve current synthetic order linkage until normal checkout expiry; no CRM brief was submitted.

Full real-card confirmation,3DS, first renewal and cancellation were not exercised, consistent with the owner's direct-live request and no agent-executed financial commitment. The owner can complete that final real trial check through the published form.
