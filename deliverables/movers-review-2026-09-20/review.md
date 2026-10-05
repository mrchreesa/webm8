# /movers conversion and design review

Reviewed 20 September 2026.

The page would benefit from a focused tidy-up. The strongest opportunities are making the booking offer consistent, bringing mobile visitors directly to the form, and reducing repeated explanations before pricing. The section immediately after “What's included” should receive a content and design update together.

## Scope and evidence

Inspected the current local implementation in Chromium at 1440 × 1000 and 390 × 844, compared the live desktop page, exercised the billing toggle and review CTAs, and opened the public calendar. No review requests or bookings were submitted. No application source files were changed.

The live page at https://www.webm8agency.com/movers/ does not contain the local “What's included” section. It also retains an “Open the demonstration site” link that is absent from the local version. Recommendations below primarily concern the current workspace.

These are findings from a usability inspection supported by published UX research. They are not findings from customer interviews, session recordings, or a conversion experiment; conversion impact remains a hypothesis to measure.

Measured local layout:

| Measurement | Desktop | Mobile |
| --- | ---: | ---: |
| Total document height | 10,270 px | 19,473 px |
| Demo section height | 1,728 px | 4,121 px |
| What's included height | 1,379 px | 3,077 px |
| Benefits section height | 689 px | 1,345 px |
| Pricing section begins | 4,796 px | 9,730 px |
| Review section begins | 9,060 px | 16,906 px |

At the tested mobile size, pricing starts about 11.5 viewport heights down the page. Anchor links and the sticky CTA provide shortcuts, so visitors do not have to scroll through all of this. Length alone is not evidence of poor conversion; the concern is repeated content and how much effort it takes to compare the offer.

## Highest-priority fixes

1. **Align the offer with the calendar.** The page repeatedly promises a free 10-minute website review. The actual [calendar](https://cal.com/webm8/review) offers a “Free 15-minute website preview call” and describes a personalized moving-company homepage preview. It also names “Christian,” while the page names “Kristian.” Resolve the intended offer and make the headline, CTA, agenda, confirmation and calendar agree. The local shared constant already says 15 minutes; mover components still hard-code 10.
2. **Make the form visible after a mobile CTA click.** Both the hero CTA and a pricing CTA land at the start of a long explanatory column. The first input begins approximately 926 px below the viewport top on an 844 px screen. Put the short heading and next-step explanation immediately before the form, with the longer agenda and email alternative below it on mobile. Keep the fields under the sticky header when jumping to the form.
3. **Keep pricing navigation within this offer.** “Explore the plans” in the shared `WhatYouGet` component links to `/pricing/`, leaving this landing page. On `/movers`, use `#pricing` and a label such as “Compare moving-company plans.” Implement a configurable link so the homepage can retain its own destination.
4. **Match the included features to the mover plans.** The generic included cards promise AI-search optimization, email and message booking confirmations, and call attribution without distinguishing scope. The mover plans describe foundational SEO in Standard and supported follow-up integrations in Growth, with some usage charges separate. Clarify what is common, what is Growth, and what depends on an integration; use mover-specific content in both the included section and hero feature strip.

## The section below “What's included”

Current section: **“Three things this changes.”** Source: `components/movers/MoverBenefits.tsx`.

It is readable and uses the established typography and colors. However, the four illustrated included cards are followed by a much plainer block: three small icons, long headings, paragraphs and a final disclaimer. The large heading gives little information when scanned alone. Its mobile version takes about 1.6 screens and repeats mobile usability, complete quote details and trust already shown above.

**Recommended treatment: a compact benefits band leading into pricing.**

- Eyebrow: “Built around your working day”.
- Heading: “Make it easier to request a quote. Easier to follow up.”
- Three concise outcomes, each with one sentence:
  - **Easy to request:** “Customers send their moving details from their phone, with your number one tap away.”
  - **Ready to follow up:** “Dates, addresses and contact details arrive together, so you can call back prepared.”
  - **Reasons to trust you:** “Your real reviews, crew photos and license details help customers decide to get in touch.”
- Desktop: one softly tinted, rounded panel with three equal columns, clear dividers and the existing icon family. Avoid another set of large illustrated cards immediately after the included grid.
- Mobile: three compact horizontal icon-and-text rows; remove the long paragraphs and excess vertical separation. Aim for a materially shorter section while preserving readable type and comfortable spacing.
- Finish with one link to `#pricing`: “Compare plans — from $147/month”. Keep the principal booking action visually stronger elsewhere.
- Retain the no-guarantees explanation in the FAQ, where it already exists, rather than repeating it beneath the benefits. This does not change the service promises.

If the included cards are rewritten to state these same outcomes clearly, remove the standalone benefits section instead. Its purpose must be to explain business value, not repeat features for a fourth time.

[Desktop evidence](local-desktop-benefits.png) · [Mobile evidence](local-mobile-benefits.png)

## Section-by-section tidy-up

| Section | Recommendation | Why |
| --- | --- | --- |
| Hero | Keep the audience label, starting price and website preview. Make the main promise more literal, e.g. “Moving-company websites that collect the details while you're on the job.” | The current heading is personable but less explicit than the supporting copy. |
| Feature strip | Shorten to a handful of meaningful points or remove once included cards cover them. | It repeats the same 16 features used below. |
| Demo | Keep customer-side and owner-side evidence. On mobile, show one legible example plus a short numbered summary and an optional expansion for the other screens. Restore the demo link, clearly labeled as a demonstration. | Four full phone images stack into a long walkthrough; local copy later tells users to open a demo without providing the link. |
| What's included | Keep the visual direction; make content specific to movers and plan scope. Reduce decorative height on mobile. | This is the most developed visual section, but it is generic and lengthy. |
| Benefits | Apply the compact treatment above, or merge with included. | Reduces repetition and makes the transition to pricing purposeful. |
| Pricing | Use “Plans for moving companies.” Keep two clear prices, shorten bullets, distinguish Growth additions, align CTA positions, and show detailed scope on demand. | Cards are tall and the key difference takes too much reading. |
| Trust/founder | Lead with who builds and maintains the site, supported by a real portrait if available and a link to the work. Keep a short, clear statement that the mover example is a demonstration. | The current large “what we can't show” panel gives absences excessive visual prominence. Do not invent testimonials or conceal the demo's status. |
| Review expectations | Merge the four-point agenda into the booking section and match the actual offer. | The agenda and final booking section explain overlapping steps. |
| FAQ | Keep cancellation, ownership, integrations, extra costs and setup questions. Consolidate repeated plan and annual-savings explanations. Add launch timing only when a real delivery commitment is agreed. | Customers need unresolved buying questions answered; they do not need the full pricing section repeated. |
| Booking | Put the form near its heading on mobile; explain “Your details → Choose a time → Confirmed” before submission. Consider “Continue to choose a time” for the submit button. | The current button says “Book” before a slot is selected. |

Pricing terms also need clarity: “No minimum contract term” appears alongside annual upfront payment, while the unused-balance policy remains unspecified. Explain monthly cancellation and annual payment terms separately once the actual policy is settled; do not imply a refund policy that does not exist.

The required callback number is worth testing as optional if email is enough for the review. This is a business-process decision, not an automatic recommendation to remove useful lead qualification.

## Suggested page order

1. Hero: audience, clear benefit, starting price, one main CTA.
2. Compact demonstration: customer request and what the owner receives.
3. What's included: four concise groups tied to the mover offer.
4. Compact benefits band, only if it adds information.
5. Plans and pricing.
6. Short founder/trust block with real work evidence.
7. Booking section with the agenda and form together.
8. Focused FAQ with a final link back to booking.

This preserves enough detail for cautious buyers while moving ready visitors to the action sooner.

## Research supporting the recommendations

- [NN/g: F-shaped scanning and how to improve it](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/) supports descriptive headings, emphasizing meaningful words, grouping related information and removing unnecessary content. Applied here: shorter benefit headings and a clear section hierarchy.
- [NN/g: Descriptive link labels](https://www.nngroup.com/articles/learn-more-links/) supports helping users predict the destination and purpose of a link. Applied here: specific pricing and demonstration labels that match their destinations.
- [NN/g: Eliminate, Automate, Simplify forms](https://www.nngroup.com/articles/eas-framework-simplify-forms/) recommends eliminating unnecessary questions, postponing nonurgent requests and reducing repeated input. Applied here: a visible form, clear booking steps and an optional-phone experiment if operationally appropriate.
- [NN/g: Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) supports keeping the essential information immediately available while letting users request secondary details. Applied here: an optional full walkthrough and detailed plan scope, without hiding prices or material terms.

The proposed ordering, colors and section treatment are design judgments informed by these principles; none of these sources establishes a conversion lift for this page.

## Verification after changes

Measure landing visits → CTA clicks → form starts → accepted requests → confirmed bookings, segmented by device. Use booked calls per landing visitor as the primary conversion measure, with accepted requests and lead quality as supporting measures. Existing code includes many of these events; verify that analytics is configured and that events actually arrive before relying on reports.

At 390 px width, a CTA should reveal the booking heading and first field without an additional scroll. Confirm that the pricing link stays on `/movers`, the selected plan is clear when relevant, billing changes show the correct upfront amount, and page/calendar wording agrees. Evaluate shortening the benefits and walkthrough against a baseline rather than assuming less page length automatically means more bookings.
