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

## Contact flow

Validate on submit and recheck fields already in error on change. Use noValidate, inline errors and first-invalid focus on submit. Keep inputs on server/network errors. Freeze edits while sending, block duplicate activations immediately, cancel client wait on unmount and limit waiting to 20 seconds. The same payload retries with the same submission key. A changed payload starts a new enquiry. Warn on browser departure from an unsent dirty form. No personal answers are persisted in browser storage.

Success requires a saved CRM receipt, disables resubmission and promises a reply within one business day. Email is supplementary: a failed email must not undo a CRM save. Contact success emits `contact_enquiry` success; demo success emits `demo_request` success. Clicks and validation attempts do not count as saved enquiries. Analytics events contain no form answers.

The short plan selector remains native. No date picker, table selection, calendar, bulk action or new modal is in scope. Public marketing navigation keeps the existing document flow; no page-shell rewrite.
