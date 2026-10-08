import { Img } from "remotion";
import mascot from "../../../public/mascot.png";
import { mix, punch } from "../motion.ts";
import { color, font } from "../theme.ts";
import { BRAND_BUG } from "./safeZone.ts";

/** The mascot and "WebM8" in the top corner, popping in on the very first frame and staying put. */
export function BrandBug({ frame, ink = color.white }: { frame: number; ink?: string }) {
  const pop = punch(frame, 0, 10, 9);
  return (
    <div
      style={{
        position: "absolute",
        left: BRAND_BUG.x,
        top: BRAND_BUG.y,
        height: BRAND_BUG.height,
        display: "flex",
        alignItems: "center",
        gap: 12,
        transform: `scale(${mix(1.5, 1, pop)})`,
        transformOrigin: "0 50%",
      }}
    >
      <Img src={mascot} style={{ width: BRAND_BUG.height, height: BRAND_BUG.height }} />
      <span style={{ color: ink, fontFamily: font.display, fontWeight: 700, fontSize: 38, letterSpacing: "-0.02em" }}>WebM8</span>
    </div>
  );
}
