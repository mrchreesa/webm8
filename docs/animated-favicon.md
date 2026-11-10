# Animated WebM8 favicon

The shared root layout loads `public/animated-favicon.mjs` with Next Script's `lazyOnload` strategy. This applies to the agency and Instant Websites projects without changing their static favicon or Apple touch metadata.

The module uses the existing `/mascot-icon-192.png` and canvas to make 32 cached, 64-pixel PNG frames. It rotates blink → right-tentacle wave → gentle bob at eight frames per second, with ten seconds of the original static icon between motions. The first animation starts 2.5 seconds after the module becomes eligible. There are no dependencies, workers, tracking events or repeated frame downloads.

Hidden documents, reduced motion and data saving use the static icon. Visibility changes, pagehide/pageshow and changes to reduced-motion preferences cancel or resume the single timer. Original icon href/type/sizes are restored when stopped; removed metadata links are not reinserted. Canvas and image failures leave the original icons intact. Browser support for visible favicon animation still varies; the static brand assets are always the baseline.

Verification on 10 November 2026: Brave displayed the exact generated blink, wave and bob frames at enlarged and 16-pixel sizes; the review's favicon observer recorded all three motions in order and restoration between them. A deterministic lifecycle check covered no work under reduced motion, hidden tabs or data saving; rotation order; one image load and one outstanding timer; metadata restoration; live preference changes; pagehide/pageshow; cleanup; canvas/image failures; and a late image load after hiding. TypeScript, targeted ESLint and the strict UI audit passed. Production builds and live-domain checks are required for release.

References: [document visibility](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState), [reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).
