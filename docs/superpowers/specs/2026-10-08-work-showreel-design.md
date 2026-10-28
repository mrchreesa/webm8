# Work showreel: a 20-second motion video of WebM8's demo sites, built with Remotion

Date: 2026-10-08
Status: design approved in conversation (purpose, formats, length, projects, sound, end card, approach 1, storyboard take two, layout, setup). Built 2026-10-08; the notes under "As built" record where the build differs from this design.

## Goal

A short, bold showreel of the demo sites WebM8 designed, for LinkedIn and Instagram feeds, sales calls and the site. Someone scrolling with the sound off should, in 20 seconds, see six good-looking sites working on a computer and a phone, know they came from WebM8, and know the next step is a free demo.

Done means two MP4s, `out/webm8-showreel-4x5.mp4` and `out/webm8-showreel-1x1.mp4`, each exactly 20.0 s at 30 fps, around 10 MB, sharp in a feed and readable on mute, rendered by one command on the owner's Mac.

## Decisions already made

| Topic | Decision |
|---|---|
| Purpose | Work showreel. |
| Formats | 4:5 (1080×1350) and 1:1 (1080×1080). No 16:9 or 9:16 for now. |
| Length | 20 s, 600 frames at 30 fps. |
| Projects | Atelier, Nacre, Allen Fitness, The Stitch House, Ideal Baby & Kids, Veil, in that order (the two clinics kept apart). |
| Sound | None. Rendered with no audio track; on-screen text carries everything. |
| End card | "Want one?" plus a "Get your free demo" button and `webm8agency.com/free-demo`. |
| Tone | Bold and punchy: huge type, hard cuts, springs that overshoot, neon flashes. |
| Approach | 1: fresh tall 2x captures of each site, scrolled inside a browser frame and a phone. |
| Where it lives | `website/video/`, its own npm package, so Remotion never enters the site's dependencies or its Vercel build. |
| Wording | The site calls these "demo sites we designed for local businesses". Nacre and Veil are two directions for one clinic, so the reel never claims six businesses. Names and industries come from `projects` in `lib/site.ts`. |

Remotion is free for individuals and for companies of up to three people; a larger company needs a company licence.

## Storyboard

30 fps, 600 frames. Frame numbers are the targets `timeline.ts` encodes; the tests hold them.

| Frames | Time | Beat |
|---|---|---|
| 0–59 | 0:00–0:02 | **Hook.** Three hard cuts of 20 frames. Each line slams in, scaling from about 1.3 and springing back with a little overshoot, and the frame shakes for 3 frames as it lands: "Your business." on navy, "Online." in `brand-ink` on a full-frame neon (`brand`) fill, "Done right." on navy. |
| 60–449 | 0:02–0:15 | **Six sites**, 65 frames each. The business name, in Funnel Display, fills the background in giant type cropped by the frame. The browser frame and the phone punch in with an overshooting spring and scroll their captures together with an ease-in-out. The caption shows the name (white, Funnel Display) and the industry in a neon-outlined tag. Sites change with a 6-frame whip pan with motion blur, alternating left and right. The first site cuts in hard from the hook. |
| 450–509 | 0:15–0:17 | **Deck.** All six phones snap into a fanned deck, 4 frames apart, like the homepage `WorkDeck`, under "Built for phones first." (a `valueProps` line on the site). |
| 510–599 | 0:17–0:20 | **End card.** One frame of neon, then navy. "Want one?" fills the frame, the mascot bounces in and blinks, the neon "Get your free demo" button (`brand-ink` text) pulses once, and `webm8agency.com/free-demo` sits under it. Everything is still from frame 555 (0:18.5) to the end. |

A small "Demo sites by WebM8" header line sits at the top through the six sites and the deck.

Guardrails:

- Every business name is fully on screen for at least 45 frames (1.5 s).
- Shakes and full-frame flashes happen only in the hook and the end card, never during a site scene.
- The last 45 frames do not move.

## Look

- Grounds: `ink` (`#0e2f56`) into `night` (`#061429`), with a soft `electric` (`#2b6cfc`) glow behind the devices.
- Text: white and `muted-invert` (`#9db4cd`). Neon (`#d4ff35`) appears as a fill with `brand-ink` (`#071a33`) text (the "Online." flash and the button), and as text, outlines and rules on navy (the industry tag and the end-card address). This follows the colour rules in `app/globals.css`.
- Type: Funnel Display Bold for every headline and the giant names; Geist for the header line, tags and the address. Both load from the TTFs in `assets/fonts/`.
- Mascot: `public/mascot.png`, with the eyes drawn over it using the same geometry as `components/ui/MascotEyes.tsx` (1254 px view, eyes at x 470 and 780, y 506, lids scaled on Y). In the video the blink and the glance are driven by frame number, not timers.
- Browser frame: rounded window with three dots and an address bar showing the site's host. Phone: rounded body and a notch over the top of the capture.

## Layout

One `Showreel` component reads the frame size from `useVideoConfig()` and takes a layout table for its format. Timing, motion and text are shared; only positions and sizes differ.

- **4:5.** Header line at the top. Browser about 860 px wide in the upper part, the phone about 320 px wide low on the right, overlapping the browser's corner. Name and industry tag on their own at the bottom.
- **1:1.** Browser about 780 px wide on the left, phone about 260 px wide on the right, side by side. Name and tag on one line at the bottom.
- **Hook and end card** are centred stacks in both formats. Hook lines are about 200 px (4:5) and 170 px (1:1), never more than two lines.
- **Deck.** Six phones fanned across the frame, smaller in 1:1.
- Text stays at least 64 px inside every edge.

## Project structure

```
website/video/
  package.json            remotion, @remotion/cli, @remotion/bundler, @remotion/renderer,
                          @remotion/fonts, react, react-dom; typescript, playwright and sharp as dev dependencies
  remotion.config.ts
  tsconfig.json
  src/
    index.ts              registerRoot
    Root.tsx              two <Composition>s: Showreel-4x5 and Showreel-1x1, 600 frames, 30 fps
    Showreel.tsx          sequences the beats from timeline.ts
    reel.ts               the six slugs in order, the hook lines, the header line and the end-card copy;
                          looks up name and industry in ../../lib/site.ts
    captures.ts           reads public/captures/captures.json (each capture's size)
    motion.ts             punch(): an overshooting spring that lands at exactly 1
    timeline.ts           pure frame maths: start and length of every beat, whip and flash windows
    timeline.test.ts
    reel.test.ts
    layout.ts             the 4:5 and 1:1 layout tables
    theme.ts              colour tokens, copied from app/globals.css with a pointer back to it
    fonts.ts              loads Funnel Display and Geist from ../../assets/fonts
    scenes/               Hook.tsx, SiteScene.tsx, DeckBeat.tsx, EndCard.tsx
    parts/                BrowserFrame.tsx, PhoneFrame.tsx, GiantName.tsx, IndustryTag.tsx, Mascot.tsx, Header.tsx
  scripts/capture.mjs     tall 2x captures of the six sites
  scripts/stills.mjs      renders key frames to out/stills/ for checking a change
  public/captures/        <slug>-desktop.webp, <slug>-phone.webp and captures.json, committed
  out/                    rendered MP4s, ignored by the site's existing `out/` rule
```

`lib/site.ts` has no imports, so the video can read `projects` directly; a renamed project on the site shows up in the next render. The mascot and the fonts are imported from the site, not copied.

## Captures

The site's `scripts/capture-portfolio.mjs` already knows each site's URL, what to hide (`hide`), what to force visible (`reveal`) and how long a site needs to settle (`settle`, which Atelier's tile-by-tile hero needs). That list moves into `scripts/portfolio-targets.mjs`, exported, and both `capture-portfolio.mjs` and `video/scripts/capture.mjs` import it. `capture-portfolio.mjs` behaves exactly as before.

`video/scripts/capture.mjs` captures the six reel slugs (or the ones named on the command line):

| View | Viewport | Scale | Length captured |
|---|---|---|---|
| desktop | 1280×800 | 2x | top 2,400 CSS px (a 2,560×4,800 px file) |
| phone | 390×844 | 2x | top 1,600 CSS px (a 780×3,200 px file) |

Before each shot it applies `hide` and `reveal`, waits for fonts, scrolls down and back so sections that reveal on scroll are drawn, then waits `settle` (at least 2.5 s). Files are written as WebP with `sharp` to `video/public/captures/`. The captures are committed so the reel renders identically anywhere without re-capturing; this adds about 3 MB to the repo.

If a site's sticky bar or floating button shows in the tall desktop capture, its selector is added to that target's `hide` list.

## Changes to the site

1. `tsconfig.json`: add `"video"` to `exclude`, so `npm run typecheck` never compiles Remotion code. (`next lint` only covers `app/`, `components/` and `lib/` already.)
2. `scripts/portfolio-targets.mjs`: new, holding the targets list; `scripts/capture-portfolio.mjs` imports it.
3. `CLAUDE.md`: a short paragraph on `video/`. That file is gitignored in this repo, so this change stays local.

Nothing under `app/`, `components/` or `lib/` changes.

## Commands (run in `video/`)

```bash
npm run studio    # Remotion Studio: scrub and tweak
npm run capture   # refresh the six sites' captures
npm run render    # out/webm8-showreel-4x5.mp4 and out/webm8-showreel-1x1.mp4
npm run stills    # key frames as PNGs in out/stills/ (or: npm run stills -- 95 128)
npm test          # node --test over src/**/*.test.ts
npm run typecheck # tsc --noEmit
```

Render settings: H.264, `yuv420p`, 30 fps, no audio track, CRF chosen so each file lands near 10 MB (start at 20 and adjust).

## Testing

Unit tests, `node --test` with native TypeScript like the site (explicit `.ts` imports):

- `timeline.test.ts`: the beats add up to exactly 600 frames; the hook, the six sites, the deck and the end card start at frames 0, 60, 450 and 510; each site's name is fully on screen for at least 45 frames; no shake or flash window overlaps a site scene; nothing moves in the last 45 frames.
- `reel.test.ts`: every reel slug exists in `projects`, and each has both captures in `public/captures/`.

Visual checks: `remotion still` at about 12 key frames in both formats (each hook line, the middle of each site, a whip, the deck, the end card at rest), each looked at before the full render. After rendering, Remotion's bundled `ffprobe` confirms 20.0 s, 30 fps, the right dimensions and the file sizes.

## Risks to check first

1. Remotion's bundler importing `../../lib/site.ts` and the font files from outside `video/`. If it refuses, a small webpack override in `remotion.config.ts` widens what it resolves.
2. Sticky bars and floating buttons in the tall desktop captures. Fixed by extending `hide`.

## As built

- **Whips** are drawn without `@remotion/transitions` or `@remotion/motion-blur`. Each site sits in a `Sequence` that overlaps its neighbours by 3 frames either side; `whipAt()` in `timeline.ts` moves the outgoing and incoming layers a frame width apart (tested), and an SVG `feGaussianBlur` with a horizontal-only deviation gives the motion blur. Cheaper and fully deterministic.
- **Scroll** is a fixed distance, not a share of the capture: after landing, each site holds on its hero for 14 frames, then scrolls 700 CSS px (desktop) and 600 CSS px (phone) over 44 frames.
- **Captions** are held to the bottom margin, and the giant name is centred in the space between the devices and the caption, which balances the 4:5 frame.
- **Veil's** manifesto sharpens word by word as you scroll, so it was captured mid-blur. Its target in `scripts/portfolio-targets.mjs` now forces `[class*="__manifestoText"] span` visible.
- **Renders** come out at 6.2 MB (4:5) and 6.7 MB (1:1) at CRF 20: 600 frames, 20.0 s, 30 fps, H.264 `yuv420p`, no audio stream. The end card is pixel-identical from frame 555 to 599.
- Remotion warns that macOS versions older than 15 may not render; on this Mac (macOS 14) both renders completed. Its bundled `ffmpeg` needs to be run as `npx remotion ffmpeg`, and lacks the `select` filter.

## Out of scope

16:9 and 9:16 versions, audio, captions files, hosting or auto-rendering the video, and per-prospect personalised videos. Each could be added later on the same project.
