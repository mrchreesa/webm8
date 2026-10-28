import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Layout } from "../layout.ts";
import { mix, punch } from "../motion.ts";
import { copy } from "../reel.ts";
import { color, font, navyGround } from "../theme.ts";
import { hookLineSpan, shakeAt } from "../timeline.ts";

/** Three lines, three hard cuts. Each slams in and shakes the frame; the middle one is on neon. */
export function Hook({ layout }: { layout: Layout }) {
  const frame = useCurrentFrame();
  const line = [0, 1, 2].find((k) => frame < hookLineSpan(k).to) ?? 2;
  const span = hookLineSpan(line);
  const neon = line === 1;
  const landed = punch(frame, span.from, 10, 8);
  const shake = shakeAt(frame);
  return (
    <AbsoluteFill style={{ background: neon ? color.brand : navyGround, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          maxWidth: layout.width - layout.margin * 2,
          transform: `translate(${shake.x}px, ${shake.y}px) scale(${mix(1.35, 1, landed)})`,
          color: neon ? color.brandInk : color.white,
          fontFamily: font.display,
          fontWeight: 700,
          fontSize: layout.hookSize,
          lineHeight: 0.92,
          letterSpacing: "-0.035em",
          textAlign: "center",
        }}
      >
        {copy.hook[line]}
      </div>
    </AbsoluteFill>
  );
}
