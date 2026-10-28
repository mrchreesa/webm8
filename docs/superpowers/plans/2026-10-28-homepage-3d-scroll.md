# Homepage 3D Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the top of the homepage (`StoryHero`, `WorkDeck`, `HowItWorks`) with one scroll-driven 3D story in five chapters, with real Three.js phones and laptops and sharp HTML for every word.

**Architecture:** A pure timeline (`lib/homeStory.ts`) turns scroll progress into numbers for every layer. A client component (`components/home/story3d/HomeStory.tsx`) owns the tall section, the sticky stage and all HTML layers, and lazily imports a Three.js scene (`scene.ts`, built from `devices.ts`) that draws only the phones and laptops on a canvas between the back and front HTML layers. Reduced motion and no-WebGL get the same markup laid out as ordinary stacked sections by CSS.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind v4 plus a CSS module, `three@0.160.0` (exact), `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-28-homepage-3d-scroll-design.md` (prototype beside it).

## Global Constraints

- `three` pinned to `0.160.0` and `@types/three` to `0.160.0`; imported only by `components/home/story3d/scene.ts` and `devices.ts`, which `HomeStory` loads with a dynamic `import()`.
- `h1` text: "Websites that make your phone ring." Line under it: "WebM8 designs, builds and looks after websites that turn a local search into a new customer."
- Work chapter `h2`: "Built for businesses like yours." Steps chapter `h2`: "Four steps. Nothing for you to prepare." Finale line: "That's the sound of new customers."
- Ring demos, in order: `stitch-house` "Tailor, London", `boniface-salon` "Hair salon, Kent", `allen-fitness` "Activewear", `waffles-bubbles` "Desserts, Orpington", `fcg-painting` "Painter, Margate", `aesthetic-nacre` "Aesthetic clinic", `dps-gasworks` "Heating, Bedford".
- Finale notifications: "New quote request · Kitchen repaint, Margate", "New booking · Cut and colour, Thursday 10:00", "New order · Sculpt leggings, size M".
- Native scrolling only; no scroll libraries.
- Canvas is `aria-hidden`; no text is drawn in WebGL.
- Device pixel ratio capped at 2; rendering stops off screen and in a hidden tab.
- Anchors `#work` and `#how-it-works` land on their chapters in both layouts.
- Analytics: `demo_cta_clicked` placements `hero` and `home_finale`; `portfolio_example_clicked` with `placement: "home_ring"`, `example`, `position`, `page`; `home_story_completed` once per page view at the finale, no properties; `home_story_trade_picked` retired.
- Follow `CLAUDE.md`: tokens from `app/globals.css`, `trailingSlash`, tests import with `.ts`.

## Review Focus

- A visitor who loads the page already scrolled (back button, `#work` link) must see the right chapter at once, not the hero, and the scene must catch up without a flash.
- A slow or failed Three.js download must leave a complete, usable hero (poster phone, words, buttons), never a blank stage.
- Resizing or rotating a phone mid-story must keep the phone, floaters and canvas aligned.
- Fast flick-scrolling through the dive must never show the HTML zoom layer and the 3D phone at different sizes.
- Reduced motion must get no sticky track at all, so the page is a normal length.

---

### Task 1: The timeline and the story content

**Files:**
- Create: `lib/homeStory.ts`
- Test: `lib/homeStory.test.ts`

**Interfaces:**
- Produces:
  - `type StoryChapter = "search" | "dive" | "work" | "steps" | "finale"`
  - `const STORY_ANCHORS: { work: number; steps: number }` — progress where those chapters are settled (`work` 0.47, `steps` 0.775).
  - `const ringDemos: readonly { slug: string; label: string }[]` (Global Constraints order).
  - `const finaleNotifications: readonly { icon: string; title: string; detail: string }[]`.
  - `type StoryLayout = { wide: boolean; W: number; H: number; phoneH: number; anchorX: number; anchorY: number }` and `storyLayout(W: number, H: number): StoryLayout` — `wide` when `W >= 900`; phone height `clamp(H * 0.49, 260, 440)` wide, `clamp(H * 0.34, 200, 300)` narrow; anchor `(W * 0.22, H * 0.02)` wide, `(0, H * 0.2)` narrow.
  - `type StoryFrame` with: `chapter`, `copy` (hero words opacity), `dive`, `straighten`, `grow`, `zoom` (opacity of the HTML zoom layer), `desktop` (zoom crossfade), `ringAppear`, `ringLeave`, `ringSpin` (radians), `ringFront` (index), `stepIn: number[]` (4), `stepOut`, `back` (phone return), `ringing` (boolean), `finale` (opacity of finale words), `finaleReached` (boolean).
  - `storyFrame(p: number, demoCount: number): StoryFrame` using the prototype's ranges: copy fades 0.1–0.2; straighten 0.2–0.24; grow 0.24–0.34; zoom in 0.238–0.244 and out 0.37–0.43; desktop 0.3–0.36; ring appear 0.34–0.46, leave 0.64–0.72, spin over 0.44–0.64 resting 55% of each step; steps in from 0.68 + i × 0.022 for 0.07, out 0.79–0.84; back 0.8–0.9; ringing above 0.93; finale 0.91–0.97; reached at 0.9.
  - `type PhonePose = { x: number; y: number; z: number; rx: number; ry: number; rz: number; scale: number; visible: boolean; scroll: number; lock: number }` and `heroPhonePose(p: number, layout: StoryLayout): PhonePose` — page pixels from the stage centre and degrees, as the prototype computes them (turn −34→−12°, tilt 14→5° over 0–0.2; straighten to 0 and scale 1.12 by 0.24; hidden from 0.246 to 0.8; returns from z −1500 px with turns 60/−10/−16 → −10/4/0; `scroll` = sin(π·seg(0.03, 0.2)) × 0.14; `lock` = seg(0.84, 0.88)).
  - `phoneScreenRect(pose: PhonePose, layout: StoryLayout): { left: number; top: number; width: number; height: number; radius: number }` — the straight phone's screen in stage pixels (phone width = `phoneH / 2.056`, screen inset 3 %, corner radius 8.5 % of width), used by the zoom layer at the handoff.
  - Also export `clamp`, `seg`, `ease`, `out3`, `lerp`.

- [ ] **Step 1: Write the failing tests** in `lib/homeStory.test.ts`:
  - `storyFrame` chapters: 0 → "search", 0.3 → "dive", 0.5 → "work", 0.75 → "steps", 0.95 → "finale".
  - The ring rests on each demo: for k in 0..6, at p = 0.44 + (k + 0.2) / 6 × 0.2, `ringFront === k` and `ringSpin` equals `-k * 2π / 7` within 1e-9.
  - `ringSpin` never increases across 200 samples of 0.44–0.64.
  - At `STORY_ANCHORS.work`: chapter "work", `ringFront === 0`, `ringAppear === 1`, `ringLeave === 0`. At `STORY_ANCHORS.steps`: chapter "steps", every `stepIn` is 1, `stepOut === 0`.
  - The handoff: `zoom === 0` at 0.237, `zoom === 1` at 0.3, `zoom === 0` at 0.43; `grow === 0` at 0.24 and 1 at 0.34; `heroPhonePose(0.25, layout).visible === false` and `true` at 0.2 and 0.85.
  - At the handoff the phone is straight: `heroPhonePose(0.244, layout)` has `rx`, `ry`, `rz` 0, `x` and `y` 0, `scale` 1.12; and `phoneScreenRect` of it is centred on the stage.
  - `finaleReached` is false at 0.899 and true at 0.9; `copy` is 1 at 0 and 0 at 0.2.
  - `ringDemos` is the seven slugs in order, each found in `projects` with a `siteUrl`, labels at most 22 characters, and each label equal to `deckOrder`'s for that slug where `deckOrder` has it (read `deckOrder` labels from the Global Constraints list in the test, not by importing a client component).
  - `storyLayout(1280, 720).wide === true`, `storyLayout(390, 844).wide === false` with `anchorX === 0`.
- [ ] **Step 2: Run** `node --test lib/homeStory.test.ts` — expect failures (module missing).
- [ ] **Step 3: Implement** `lib/homeStory.ts` with the interfaces above.
- [ ] **Step 4: Run** `node --test lib/homeStory.test.ts` and `npm run typecheck` — all pass.
- [ ] **Step 5: Commit** "Add the homepage story's timeline and content".

### Task 2: The Three.js devices and scene

**Files:**
- Modify: `package.json`, `package-lock.json` (`npm i three@0.160.0 && npm i -D @types/three@0.160.0`, exact versions)
- Create: `components/home/story3d/devices.ts`, `components/home/story3d/scene.ts`

**Interfaces:**
- Consumes: `StoryFrame`, `PhonePose`, `StoryLayout`, `ringDemos` from Task 1.
- Produces: `createStoryScene(canvas: HTMLCanvasElement, layout: StoryLayout): StoryScene` where
  `type StoryScene = { ready: Promise<void>; resize(layout: StoryLayout, dpr: number): void; loadRing(): void; render(frame: StoryFrame, pose: PhonePose, tilt: { x: number; y: number }, time: number): void; dispose(): void }`.
- `devices.ts` exports `makePhone(screen: THREE.Texture, m: Materials)` and `makeLaptop(screen: THREE.Texture, m: Materials, keys: THREE.Texture, shadow: THREE.Texture)` and `materials()`, as in the prototype (rounded titanium phone with buttons, island, camera bump, additive glass `roughness 0.16, specularIntensity 0.3, envMapIntensity 0.55`; aluminium laptop with hinged lid tilted −0.2 rad, notch, keyboard canvas texture, trackpad, contact shadow). Screens are `MeshBasicMaterial` with `toneMapped: false`, cover-cropped from the top.
- `scene.ts`: `RoomEnvironment` reflections, key/rim (#2b6cfc)/lime (#d4ff35) lights, ACES tone mapping, sRGB output, transparent canvas. Hero phone uses `/work/allen-fitness-phone.webp` and a lock-screen canvas texture ("Thursday, October 2", "9:41"); it is placed from `PhonePose` (page pixels → world at a hero camera of fov 24 at z 8, so its height in pixels equals `layout.phoneH × pose.scale`). Ring of `ringDemos` laptops (`/work/<slug>-desktop.webp`) with phones (`/work/<slug>-mobile.webp`), radius 5.4 wide / 4.6 narrow; wide puts the phone beside the laptop (1.66, 0.7, 0.66, turned −0.34), narrow stands it in front and lower so it reads below the laptop; ring camera chosen so the front demo fills about two-thirds of the width; fog fades the neighbours. The ring's textures load only after `loadRing()`. `render` uses the ring camera while `frame.chapter` is "work" or the ring is still leaving, otherwise the hero camera.

- [ ] **Step 1: Install** the two packages at the exact versions; confirm `package.json` shows `"three": "0.160.0"`.
- [ ] **Step 2: Implement** `devices.ts` and `scene.ts`.
- [ ] **Step 3: Run** `npm run typecheck` and `npm run lint` — pass.
- [ ] **Step 4: Commit** "Add the Three.js phones and laptops for the homepage story".

### Task 3: The story section

**Files:**
- Create: `components/home/story3d/HomeStory.tsx`, `components/home/story3d/HomeStory.module.css`
- Modify: `components/demo/DemoCtaButton.tsx` (add `"home_finale"` to `DemoCtaPlacement`), `app/page.tsx` (render `HomeStory` in place of `StoryHero`, `WorkDeck` and `HowItWorks`)

**Interfaces:**
- Consumes: Task 1's timeline, layout, pose and content; Task 2's `createStoryScene` via `await import("./scene")`; `processSteps` from `lib/site.ts`; `projects`; `DemoCtaButton`; `trackEvent`.
- Produces: `export function HomeStory(): JSX.Element` (client component).

Markup, in one tree so both layouts come from it: a `section.story` (`surface-dark`, pulled under the header like today's hero) holding a `div.track` (motion: tall, about 8 viewport heights on a laptop and 9 on a phone; still: auto) with the anchors `#work` and `#how-it-works` (motion: absolutely placed at `STORY_ANCHORS` × track scroll range; still: ordered before their chapters) and a `div.stage` (motion: sticky full viewport; still: `display: contents`). Inside the stage: back layer (particles, glow, ripples, floaters behind the phone), the canvas, front layer (floaters in front, notifications, step cards), the poster phone (CSS frame around the Allen Fitness capture, shown until the scene is ready and always in the still layout), the zoom layer (the Allen Fitness phone capture, plus the desktop capture when wide), and the four chapter blocks with their headings, words, buttons, the front demo's name and live-site link, and the still layout's grid of seven demos.

- [ ] **Step 1: Implement** `HomeStory`:
  - One rAF loop reads `scrollTop`-equivalent progress of the track (`-trackRect.top / (trackHeight - innerHeight)`, clamped), calls `storyFrame` and `heroPhonePose`, writes styles to the layers (prototype maths), sets the zoom layer from `phoneScreenRect` at the handoff and grows it by `left/top/width/height` only, and calls `scene.render`.
  - Mode: still when `(prefers-reduced-motion: reduce)` matches or WebGL is unavailable (`data-still` on the section); CSS does the rest via the media query and the attribute.
  - Scene loading: after first paint and idle, `import("./scene")`; fade the canvas in and the poster out when `scene.ready` resolves; call `loadRing()` once progress passes 0.2 or after the hero is ready and the browser is idle.
  - Pause the loop when the section is off screen (IntersectionObserver) or `document.hidden`; resize on `resize` and `orientationchange`.
  - Analytics: `home_story_completed` once when `finaleReached`; front demo link fires `portfolio_example_clicked` `{ example: slug, position: index + 1, placement: "home_ring", page: "/" }`.
  - Buttons: `DemoCtaButton placement="hero"` and `placement="home_finale"`; "See our work" links to `#work`.
- [ ] **Step 2: Run** `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` — pass; `/` is still static (`○`).
- [ ] **Step 3: Verify in the browser** (`npm run dev`): at 1440×900 and 390×844, every chapter at progress 0, 0.3, 0.5, 0.75, 0.97; the dive never blurs; `#work` and `#how-it-works` land on their chapters; with reduced motion emulated the page has no tall track and shows hero, grid, steps and finale stacked.
- [ ] **Step 4: Commit** "Put a 3D scroll story at the top of the homepage".

### Task 4: Remove the old homepage code and update the docs

**Files:**
- Delete: `components/home/story/StoryHero.tsx`, `TradeChips.tsx`, `SearchScreen.tsx`, `LockScreen.tsx`, `RequestForm.tsx`, `StoryBackdrop.tsx`, `components/home/WorkDeck.tsx`, `components/home/HowItWorks.tsx`, `lib/storyProgress.ts`, `lib/storyProgress.test.ts` — each only after `grep` shows nothing else imports it.
- Modify: `lib/demoDeck.ts` (comment no longer mentions `WorkDeck`), `README.md` if it describes the homepage, the local untracked `CLAUDE.md` in the main checkout (homepage and Measurement sections).

- [ ] **Step 1: Delete** the files; **run** `npm run typecheck`, `npm test`, `npm run build` — pass, and `/free-demo/` still renders its sketch.
- [ ] **Step 2: Commit** "Remove the homepage's old story, deck and steps".

### Task 5: Measure, push and hand over

- [ ] **Step 1:** Lighthouse (mobile) on `/` for `main` and for the branch's production build; the branch's performance score and LCP must be no worse. If worse, fix before pushing.
- [ ] **Step 2:** `git push -u origin homepage-3d`; wait for Vercel's preview deployment on the branch's head commit (`gh api repos/mrchreesa/webm8/commits/<sha>/status`), open the preview URL, check `/` on desktop and phone sizes.
- [ ] **Step 3:** Send the owner the preview link. Do not merge to `main` until they approve.
