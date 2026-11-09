# UX Contract

## Product context

WebM8 serves small businesses across industries in the UK and US. English marketing pages use the existing design and British spelling. Source: owner brief and `app/contact/page.tsx`. `lib/contactRequest.ts`, `lib/demoRequest.ts` and the signed CRM intake are authoritative submission contracts. `app/privacy/page.tsx` owns the public privacy explanation.

## Visual contract

`DESIGN.md` documents existing runtime-canonical tokens from `app/globals.css`; it does not generate CSS. Preserve shared controls and review changed tokens against that file.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | components/forms/FormField.tsx SelectField | native select | Platform popup accepted for short plan choices | Keyboard selection and narrow viewport |
| Form | components/forms/FormField.tsx and lib/contactRequest.ts | API validation and CRM receipt | Contact enquiry and existing demo request | Invalid, busy, saved, network and retry |
| Scrollbar | app/globals.css | Global browser scrollbar styling | Natural document and textarea overflow | Narrow viewport and reachable actions |
| Toast | Inline FormStatus with contact live region | components/forms/ContactForm.tsx | Persistent neutral, error, success text | Polite announcement and visible recovery |
| CRUD | lib/contactIntake.ts | CRM signed receipt | Create enquiry only | Save before email, duplicate retry, failed save |

## Instant Websites preview

Source: owner product decisions recorded in `docs/instant-websites-preview.md`. `/instant/` is a review-only form flow with no server mutations or payment capability. Its production route is disabled by default. The shared `FormField` supports both existing uncontrolled usage and controlled step drafts; `components/forms/ChoiceGroup.tsx` owns native labelled checkbox/radio choices. No custom select or date popup is introduced.

`lib/instantWebsite.ts` owns eligibility, conditional validation and versioned draft recovery. `InstantSignup` owns steps, first-invalid focus and inline status. Steps are revisitable with the in-flow Back action; no personal values or steps are put in URLs. All profile links remain optional. Quote branches preserve requirements and collect no payment. Preview completion explicitly says nothing has been sent.

The dedicated `webm8-instant` hosting project enables `INSTANT_WEBSITES_SITE=1` to expose the same preview at the subdomain root. `Header` accepts an explicit `instantSite` flag so a rewritten root retains the light logo-only presentation; `Footer` accepts an optional agency base URL. Their default behaviour is unchanged. Hosting does not enable real payments or submission.

The owner's revised order is personal/business details → payment → website details. The one-page package is implicit: the first screen has no website-type question, and new or previously unanswered scope drafts default to standard. Previously selected ecommerce/custom quote drafts remain recoverable. Contact details appear once and carry into the payment/quote summary. All website links, functionality and optional design/asset inputs belong to the third screen; optional extras use a native disclosure, not a fourth step. Invalid fields inside that disclosure open it before receiving focus. Earlier draft screens migrate without discarding entered answers. The top preview banner is omitted at the owner's request; the checkout and completion still describe their simulated behaviour accurately.

The page follows the owner's `/free-demo/` design reference: form first in a white frame, shared `DemoSketch` beside it on desktop and after the fields on mobile, then the demo showcase. `ChoiceGroup` owns the native chip variant. `DemoSketch` accepts offer-specific caption text so this paid offer never inherits the free-demo call promise. `DemoWall` owns the standalone showcase variant and reuses `DemoSiteModal`; its optional project selection limits this offer's wall to local-business examples. Existing hero callers retain their defaults.

This flow intentionally saves a bounded, 24-hour draft in sessionStorage, distinct from the contact form's unsaved enquiry. This supports the agreed save-progress requirement without transmitting personal data. Files stay in memory. Storage failure is visible and browser departure is guarded when local data would be lost. Checkout, submission and refund claims require real server receipts in the eventual production implementation; the prototype never produces them.

The third-step heading is “Tell us about your business.”, its final action is “Submit”, and the website-purpose question is omitted at the owner's request. Feature selection is no longer required to finish or restore a completed brief. Previously saved feature choices remain recoverable, and empty feature summaries are omitted. Routine storage-status and restored-draft messages are hidden; loading and storage-error messages remain. Draft recovery still runs automatically. At the owner’s request, the password reassurance, clear-answers control, completion edit/download brief actions and seven-section plan line are omitted.

The owner confirmed £0 at signup, a 10-day free trial from completed checkout, then £39/month, cancellation anytime without a cancellation fee, and unlimited revisions until 100% satisfaction. These replace the earlier upfront charge, delivery-triggered refund period and one-revision allowance. `INSTANT_PRICE` and `INSTANT_TRIAL_DAYS` own the displayed price and trial length. Checkout shows £0 due today and an explicitly illustrative first-charge date; the summary and completion use the same terms. Prototype submission stays local and does not activate a real trial, payment or order. Source: owner instructions and billing clarification in this chat, 9 November 2026.

Step one requires `deliveryPhone`, labelled “Phone number (WhatsApp)”, for website delivery and revision discussions. It is distinct from the optional public website phone/WhatsApp fields and is never silently copied into them. Older drafts without a valid delivery number return to step one while retaining all other answers. The standard completion presents the owner's one-working-day delivery promise, email and WhatsApp destinations, a reminder to watch both channels, and unlimited revisions. The destinations use the signup email and delivery phone, not public enquiry contacts. A visible preview label and no-submission notice distinguish this success-screen design from an actual saved request or delivery. The contact-edit action returns to step one; detailed brief review remains available in a disclosure. Source: owner request in this chat, 9 November 2026.

Instant Websites uses the shared `WebsiteAnalytics` and `MetaPixel` loaders with its own production IDs. Native measurement is limited to `/` and `/instant/`, respects Do Not Track/Global Privacy Control and does not collect form answers. Meta initializes once with PageView; preview checkout and completion never emit Lead/Purchase/Subscribe. The private CAPI token belongs exclusively to the separate CRM server connection. Source: owner's tracking request and separate-dataset decision, 9 November 2026.

## Instant Websites billing (separately gated)

Source: owner instructions on 9 November 2026: use Stripe product `prod_Vb8QuLgWtXkWKt`, £39 total each month, no tax collected, a 10-day free trial, and a custom checkout matching the site. This implementation is separate from the default prototype above and is activated only by `INSTANT_BILLING_ENABLED=1` with matching environment configuration. The production connection remains pending; see `docs/instant-websites-preview.md`.

`InstantPayment` owns the embedded Stripe Payment Element, with Checkout Sessions in `elements` mode. `InstantSignup` owns the surrounding form, consent, busy/error feedback and bounded confirmation polling. A 30-day HttpOnly/SameSite cookie controls one private order; only its SHA-256 hash is stored in Postgres. Client drafts use a separate 24-hour storage key and cannot establish payment state. Stripe client secrets stay in memory, never URLs, analytics or browser storage. Reload restores server ownership before any billing state is shown.

Only verified Stripe webhooks confirm checkout. Webhook duplicates are recorded once in the same database transaction as their effects; current subscription data is fetched inside the order lock so late events cannot reverse newer cancellations. Completed-but-unpaid checkout cannot authorise a brief. The trial timestamp comes from Stripe, never the browser date or brief submission. Final submission requires current active/trialing billing and a saved CRM receipt. Quote requirements do not start subscriptions. Files are requested later during correspondence rather than appearing uploaded when no upload exists. Cancellation is offered through Stripe's authenticated portal, including its email sign-in link when the local session is unavailable.

## Contact flow

Validate on submit and recheck fields already in error on change. Use noValidate, inline errors and first-invalid focus on submit. Keep inputs on server/network errors. Freeze edits while sending, block duplicate activations immediately, cancel client wait on unmount and limit waiting to 20 seconds. The same payload retries with the same submission key. A changed payload starts a new enquiry. Warn on browser departure from an unsent dirty form. No personal answers are persisted in browser storage.

Success requires a saved CRM receipt, disables resubmission and promises a reply within one business day. Email is supplementary: a failed email must not undo a CRM save. Contact success emits `contact_enquiry` success; demo success emits `demo_request` success. Clicks and validation attempts do not count as saved enquiries. Analytics events contain no form answers.

The short plan selector remains native and is shown for recognised `?plan=standard` or `?plan=growth` links. General enquiries submit `unsure` without asking visitors to choose a plan. A plan validation error exposes the selector for recovery. Business name and phone remain required by the signed CRM contract; website and message remain optional. The page offers a price by email within one business day with no required sales call, matching `/pricing/`. Privacy is linked beside the submit area; email and the separate free-demo journey are secondary options below the form on phones.

No date picker, table selection, embedded calendar, bulk action or new modal is in scope. Public marketing navigation keeps the existing document flow; no page-shell rewrite.

On 9 November 2026 the owner requested card details at the top of checkout. The live payment preparation/consent and Stripe form precede the plan/contact summary. `InstantPayment` prioritises Card and opens the accordion by default; other configured payment methods remain available. The initial layout kept acknowledgement before preparation; the later automatic-loading request below supersedes that preparation step.

The owner then requested step-one CTA “Continue” and automatic checkout loading on step two. Entering/restoring that step prepares or reuses an unconfirmed Checkout Session once, with a visible loading state and a Retry payment form action only on failure. Open sessions load immediately after refresh; completed sessions wait for webhook confirmation. The acknowledgement is displayed beside Start my free trial, and `/api/instant/consent/` records it against the cookie-owned current session before Stripe confirmation. Preparation alone cannot activate a subscription or mark consent.

## Signup analytics (9 November 2026)

The owner selected field completion and drop-off without typed values. Live Instant signup supplies stable click labels, form/step tags and explicit field tags. Shared TextField, TextAreaField and ChoiceGroup forward those tags to native inputs. Stripe payment frames remain ignored. Previews and test-mode forms do not emit conversion observations.

Step 1 completion follows validation, step 2 completion follows server-confirmed trial state, and step 3 success follows the CRM-backed server receipt. Checkout readiness and confirmation attempts are separate fixed events, never successes. Failures use fixed categories only. A bounded queue preserves early events until the tracker is ready; DNT/GPC discard them. No names, answers, payment data, error strings or billing identifiers are accepted by the event helper.

The owner requested removal of the signup footer actions (Check trial status, Manage or cancel subscription, Contact WebM8), the repeated sidebar trial-price sentence and the step-two acknowledgement checkbox on 9 November 2026. Trial and monthly pricing remain beside Start my free trial; selecting that action records acknowledgement against the owned Checkout Session before Stripe confirmation. Loading alone does not acknowledge terms. The preview continuation records only local acknowledgement. Confirmation polling remains automatic, with refresh recovery after timeout; the customer email retains its authenticated subscription-management link.

Step two uses the shared `CheckoutLoading` status panel during session preparation, payment component download, Stripe initialisation and card-field readiness. Its spinner stops for reduced-motion preferences. The mounted payment fields retain their geometry but remain hidden and inert until Stripe signals readiness; failures replace the loading state with recovery instructions. Source: owner's clear-loading-spinner request, 9 November 2026.

## Instant loading performance (9 November 2026)

The Instant page caches only public content and deployment configuration; its static build fails if request-specific server data is added. Cookie-owned answers, checkout confirmation and subscription status remain exclusively in private, uncached APIs. New session tokens skip the impossible saved-order lookup, while valid returning-session cookies retain the existing database restoration path.

`InstantDemoWall` defers the shared `DemoWall` until it approaches the viewport. Its placeholder uses the wall's own responsive showcase classes, preserving document geometry. The simulator, form, analytics and automatic step-two checkout keep their existing behavior. Source: owner's loading-time optimisation request.

The initial HTML includes the empty step-one form, disabled and busy until private session recovery completes. This keeps the first-visit layout stable and prevents the temporarily absent form from pulling the gallery into the loading viewport. No private values are rendered or cached on the server; submission also checks the recovery lock.
