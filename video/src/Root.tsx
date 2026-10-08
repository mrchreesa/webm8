import { Composition } from "remotion";
import { loadFonts } from "./fonts.ts";
import { portrait, square } from "./layout.ts";
import { REEL } from "./kit/safeZone.ts";
import { ABPost, type ABPostProps } from "./posts/ab/ABPost.tsx";
import { AB_FRAMES } from "./posts/ab/timeline.ts";
import { PhoneRings } from "./rings/PhoneRings.tsx";
import { Showreel } from "./Showreel.tsx";
import { FPS, TOTAL_FRAMES } from "./timeline.ts";

loadFonts();

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="Showreel-4x5"
        component={Showreel}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={portrait.width}
        height={portrait.height}
      />
      <Composition
        id="Showreel-1x1"
        component={Showreel}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={square.width}
        height={square.height}
      />
      <Composition id="PhoneRings-4x5" component={PhoneRings} durationInFrames={TOTAL_FRAMES} fps={FPS} width={portrait.width} height={portrait.height} />
      <Composition id="PhoneRings-1x1" component={PhoneRings} durationInFrames={TOTAL_FRAMES} fps={FPS} width={square.width} height={square.height} />
      {/* Organic posts: 9:16 Reels, words inside Meta's safe zone (src/kit/). */}
      <Composition
        id="AB-veil-nacre"
        component={ABPost}
        durationInFrames={AB_FRAMES}
        fps={REEL.fps}
        width={REEL.width}
        height={REEL.height}
        defaultProps={{ pair: "veil-nacre", guides: false } satisfies ABPostProps}
      />
    </>
  );
}
