# Homepage 3D scroll: design

Date: 28 October 2026. Prototype: `2026-10-28-homepage-3d-scroll-prototype.html` beside this file (open it from the brainstorm server or adapt its `/files/` image paths to `/work/`). The prototype is the reference for motion and composition; its code is a sketch, not something to copy.

## Intent

A local business owner lands on the homepage, often on a phone, often from an ad inside Facebook's or Instagram's browser. Within seconds they should think: "WOW, this is incredible, I want that." The homepage itself is the proof of what WebM8 builds. The inspiration was a run of "custom 3D scroll website" reels (a business's own product, filmed cinematically, playing as you scroll), and the owner chose the direction where one phone carries you through the page.

## What it replaces

The top of the homepage becomes one scroll-driven 3D story in five chapters. It replaces `StoryHero` (with its trade chips), `WorkDeck` and `HowItWorks`. `EightArms`, `Plans`, `Voices` and `DemoClosing` follow it, unchanged, as normal sections. Nothing on any other page changes.

## The five chapters

The story is a tall section with a sticky, full-viewport stage. Scroll progress through the section (0 to 1) drives every frame. The prototype's progress ranges are a good starting point. Scrolling stays the browser's own: no scroll hijacking, snapping or smoothing libraries, so a flick on a phone behaves as it does on any page (my call).

1. **The search.** The headline "Websites that make your phone ring." (the page's `h1`), the line "WebM8 designs, builds and looks after websites that turn a local search into a new customer." (my call, from the prototype), "Get my free custom demo" (`DemoCtaButton`, placement `hero`) and "See our work". Beside it (below it on a phone), a realistic 3D phone plays Allen Fitness's real site (`/work/allen-fitness-phone.webp`, the "ALL IN. ALL YOU." hero), angled and turning to face you. Around it, at different depths and drifting gently, float cards from Allen Fitness's world: a search for "gym leggings that fit", a product card ("Sculpt leggings, £38, Size M, Add to bag"), a star rating, a neon bag button, a customer review, four trade icons and an "Order placed" chip. Particles stream towards the viewer and a grid floor recedes. On a laptop the scene leans towards the pointer. The phone scrolls a little way down its page and back up to the hero.
2. **Into the screen.** The phone straightens and centres, then the view dives into its screen while the floating cards and particles rush past. **The dive must stay sharp:** at the moment of the dive, a full-resolution HTML copy of the screen takes over from the 3D phone at exactly the same rectangle, then grows (by size, never by a scale transform) to fill the viewport. On a laptop it crossfades into Allen Fitness's desktop screenshot. Nothing is ever a stretched bitmap.
3. **Our work.** "Built for businesses like yours." (an `h2`, with `id="work"` reachable, see Anchors). Seven demos turn on a 3D ring: each is a realistic laptop showing the project's desktop screenshot, with its phone (mobile screenshot) standing in front. The front demo fills most of the frame (about two-thirds of the width on a laptop); neighbours fade into the dark at the edges. The ring rests on each demo, then turns to the next. The front demo is named under the ring ("Real demo", name, label) with a link to its live site.
4. **How it works.** "Four steps. Nothing for you to prepare." (an `h2`, `id="how-it-works"`). The four steps from `processSteps` in `lib/site.ts` (number, title, body) flip up and rise towards the viewer, in a shallow arc on a laptop and two by two on a phone.
5. **Your phone rings.** The phone flies back from the distance, lands, shows a lock screen ("9:41") and rings: it shakes, neon ripples spread from it, and three notifications land, one from each of three demos just seen (a quote request for FCG Painting, a booking at Boniface, an order at Allen Fitness). A closing line and "Get my free custom demo" (placement `home_finale`).

## Devices and look

- The phones and laptops are real 3D, built with Three.js (owner's go-ahead for external libraries). Phones: rounded titanium frame with softened edges, side buttons, Dynamic Island, a camera bump with three lenses, screen glass with soft reflections. Laptops: aluminium base and lid on a hinge, camera notch, keyboard and trackpad, contact shadow on the floor. Lit by a studio environment plus a blue rim light and a faint lime light. Screens are unlit images in their true colours; reflections are a gentle sheen that never washes out the site.
- Models are built in code, as in the prototype; no 3D model files are needed.
- All words, buttons, cards, steps and notifications are HTML, layered in front of or behind the canvas by depth, so they stay sharp, readable and indexable. The canvas is decorative (`aria-hidden`).
- Colours, type and buttons follow the site's tokens in `app/globals.css` (navy grounds, neon only on things that act, Funnel Display headlines, Geist body).
- On a phone, the work chapter stands each demo's phone below its laptop rather than beside it, so both can be bigger (my call; the owner was told and did not object).

## Content

- The seven ring demos, in this order: The Stitch House, Boniface Hair & Beauty, Allen Fitness, Waffles & Bubbles, FCG Painting & Decorating, Nacre, DPS Gasworks. Names, URLs and screenshots come from `projects` in `lib/site.ts`; the short labels ("Tailor, London" and so on) match `deckOrder` in `components/demo/DemoDeck.tsx`. The other projects stay on `/work/` (my call: seven keeps the ring readable and the download small).
- The finale's closing line must differ from `DemoClosing`'s "Let's get your phone ringing.", which still closes the page. My call: "That's the sound of new customers." Easy to change.
- The work chapter's live-site link uses `siteUrl` and opens in a new tab.

## Constraints

- Next.js 15 App Router, React 19, Tailwind v4, static prerender, `trailingSlash`. Follow `CLAUDE.md`.
- `three` becomes a real npm dependency (pin an exact version), loaded only on the homepage and only from a client component that is dynamically imported, so it is not in the shared bundle.
- **Speed is part of the wow.** The `h1`, line and buttons are server-rendered HTML and paint immediately; they are the page's largest content, not the 3D. Before Three.js arrives, the stage shows a still of the phone (the Allen Fitness capture in a CSS phone frame) so nothing jumps. Textures load per chapter (hero first, ring when the visitor nears it). Cap the device pixel ratio at 2, size the canvas to the viewport, and stop rendering when the stage is off screen or the tab is hidden.
- The homepage's Lighthouse mobile performance score and its largest contentful paint must be no worse than today's, measured on the preview deployment (my call, so "fast" has a number).
- **Reduced motion and no WebGL** get a still version: no long scroll section. The hero shows the phone still beside the headline, the work chapter becomes a simple grid of the seven demos (laptop and phone images), and the steps a normal list, with the same headings, ids, links and buttons.
- **Anchors.** The header's "How it works" link (`#how-it-works`) and the hero's "See our work" (`#work`) must land on their chapters at the right scroll position, in both versions.
- `/free-demo/`'s sketch (`DemoSketch`) uses parts of `components/home/story/` and `lib/trades.ts`. Those must keep working; remove only what nothing uses any more.

## Measurement

- `demo_cta_clicked` for both buttons (placements `hero` and `home_finale`).
- `portfolio_example_clicked` with `placement: "home_ring"` (`example`, `position`) when a ring demo's live-site link is opened.
- `home_story_completed` fires once per visit when the finale is reached; its `trade` property goes away. `home_story_trade_picked` is retired. Update the Measurement section of `CLAUDE.md` to match.

## Goals

- The first screen and the first scroll make a business owner say "wow".
- Everything stays sharp: no pixelated zooms, no soft text.
- It feels smooth on a mid-range phone and inside Meta's in-app browser.

## Non-goals

- Changing any page other than `/`, or any section after the story.
- Sound, 3D model files, paid assets or a CMS.
- New copy beyond the chapter lines named here.

## Anti-goals (a failure even if it works)

- A slower homepage: the headline arriving late, or the page janking on a phone.
- Blurry or pixelated images anywhere in the story.
- Text drawn inside the canvas, where it is unreadable and unindexable.
- Motion forced on someone who has asked their phone for less.
- Breaking the `/free-demo/` sketch.

## Shipping

Build on a branch, push it so Vercel makes a preview deployment, and send the owner the preview link to try on their own phone. Merge to `main` (which deploys to production) only once the owner says it is right.

## Left to the builder

The component split, the timeline maths, how layers are ordered around the canvas, texture sizes and formats, how the still version is laid out in detail, test coverage for the pure timing maths, and which unused story components and tests to delete.
