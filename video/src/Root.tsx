import { Composition } from "remotion";
import { loadFonts } from "./fonts.ts";
import { portrait, square } from "./layout.ts";
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
    </>
  );
}
