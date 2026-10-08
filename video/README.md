# WebM8 videos

Two 20-second motion videos built with [Remotion](https://www.remotion.dev/). Each renders at 4:5 (1080×1350) and 1:1 (1080×1080), silent, and ends on "Get your free demo".

- **The showreel** (`Showreel-*`): six of WebM8's demo sites, each in a browser and a phone. The design is in `../docs/superpowers/specs/2026-10-08-work-showreel-design.md`.
- **The phone rings** (`PhoneRings-*`, in `src/rings/`): someone nearby needs a plumber, searches, finds DPS Gasworks, taps its real "Get a quote" button and sends a request. The phone turns round to the owner on neon and the enquiry slams in. This repeats faster for cleaning (Solvers Cleaning) and removals (Fantastic Moves), then enquiries from nine trades pile up before "Your phone could be next." The sites are WebM8's real phone captures from `../public/work/`. The searches, forms and enquiries are the homepage story's examples from `../lib/trades.ts`, so the video carries a "dramatisation" footnote.

This is its own npm package. The site never installs or builds it, and the site's `tsconfig.json` excludes this folder.

```bash
npm install
npm run studio    # Remotion Studio: scrub through and tweak
npm run render    # both videos, all four MP4s, into out/
npm run render:showreel
npm run render:rings
npm run stills    # the showreel's key frames as PNGs in out/stills/ (or: npm run stills -- 95 128)
npm run stills -- rings
npm run capture   # re-shoot the six sites (npx playwright install chromium, once)
npm test          # timeline and reel data
npm run typecheck
```

- **What plays when** is in `src/timeline.ts`. Its tests check that the reel is exactly 600 frames, that each name stays readable for 1.5 s, that the shakes and flashes stay off the sites, and that the end card holds still for its last 1.5 s.
- **The phone rings** keeps its timing in `src/rings/timeline.ts` (three rounds, each faster, then the pile and the close), its words in `src/rings/story.ts`, and the in-phone camera in `src/rings/camera.ts`. The camera's tests make sure every tap happens in view and no label or business name is cut off.
- **Which sites, and the words** are in `src/reel.ts`. Names and industries come from `projects` in `../lib/site.ts`, so a rename on the site shows up in the next render.
- **Positions and sizes** for each format are in `src/layout.ts`.
- **Screenshots** in `public/captures/` are committed. Re-capture after a site changes. The capture script takes each site's URL, and what to hide or reveal on it, from `../scripts/portfolio-targets.mjs`, the same list the portfolio screenshots use.

Remotion is free for individuals and for companies of up to three people. A larger company needs a company licence.
