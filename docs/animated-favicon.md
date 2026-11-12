# Animated WebM8 favicon

The shared root layout loads `public/animated-favicon.mjs` with Next Script's `lazyOnload` strategy on the agency and Instant Websites projects. Static favicon and Apple touch metadata remain the fallback.

The sequence is octopus → three clockwise spins into the neon-green M8 badge → hold for 3.5 seconds → three counterclockwise spins back to the octopus → rest for ten seconds. Each spin transition lasts about three seconds, with an eased start and finish, a brief crossfade, and enough inset to avoid clipping. This replaces the previous blink, wave and bob rotation.

The module loads `/mascot-icon-192.png` once and caches 74 canvas PNG frames at 64 pixels. Frames change every 80 milliseconds only during motion; the held M8 and resting octopus require no frame updates. The M8 badge reads the header's canonical CSS colors and uses vector lettering, so no additional logo or font download is needed. The first spin starts 2.5 seconds after the module becomes eligible.

Hidden documents, reduced motion and data saving use the static icon. Visibility changes, pagehide/pageshow and changes to reduced-motion preferences cancel or resume the single timer. Resume starts from the octopus to avoid a visual jump. Original icon href/type/sizes are restored when stopped; removed metadata links are not reinserted. Canvas and image failures leave the original icons intact. Visible favicon animation varies by browser; static brand assets remain the baseline.

Release checks cover the exact production frames at enlarged and 16-pixel sizes in Brave, the M8 hold and return sequence, hidden/reduced-motion/data-saving behavior, original metadata restoration, one image and one timer, image/canvas failure, and cleanup. Both project production builds and live-domain script checks must pass.

References: [document visibility](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState), [reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).
