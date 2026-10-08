# WebM8 work showreel

A 20-second motion video of six of WebM8's demo sites, built with [Remotion](https://www.remotion.dev/). It renders at 4:5 (1080×1350) and 1:1 (1080×1080), silent, ending on "Get your free demo". The design is in `../docs/superpowers/specs/2026-10-08-work-showreel-design.md`.

This is its own npm package. The site never installs or builds it, and the site's `tsconfig.json` excludes this folder.

```bash
npm install
npm run studio    # Remotion Studio: scrub through and tweak
npm run render    # out/webm8-showreel-4x5.mp4 and out/webm8-showreel-1x1.mp4
npm run stills    # key frames as PNGs in out/stills/ (or: npm run stills -- 95 128)
npm run capture   # re-shoot the six sites (npx playwright install chromium, once)
npm test          # timeline and reel data
npm run typecheck
```

- **What plays when** is in `src/timeline.ts`. Its tests check that the reel is exactly 600 frames, that each name stays readable for 1.5 s, that the shakes and flashes stay off the sites, and that the end card holds still for its last 1.5 s.
- **Which sites, and the words** are in `src/reel.ts`. Names and industries come from `projects` in `../lib/site.ts`, so a rename on the site shows up in the next render.
- **Positions and sizes** for each format are in `src/layout.ts`.
- **Screenshots** in `public/captures/` are committed. Re-capture after a site changes. The capture script takes each site's URL, and what to hide or reveal on it, from `../scripts/portfolio-targets.mjs`, the same list the portfolio screenshots use.

Remotion is free for individuals and for companies of up to three people. A larger company needs a company licence.
