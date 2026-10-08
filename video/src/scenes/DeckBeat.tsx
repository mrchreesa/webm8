import { AbsoluteFill, useCurrentFrame } from "remotion";
import { capturesOf } from "../captures.ts";
import { PHONE_RATIO, type Layout } from "../layout.ts";
import { mix, punch } from "../motion.ts";
import { CaptureScreen, PhoneFrame } from "../parts/PhoneFrame.tsx";
import { copy, type ReelProject } from "../reel.ts";
import { color, font } from "../theme.ts";
import { DECK } from "../timeline.ts";

/** All six phones snap into a fan, 4 frames apart, under "Built for phones first." */
export function DeckBeat({ projects, layout }: { projects: ReelProject[]; layout: Layout }) {
  const frame = useCurrentFrame() + DECK.from;
  const { phoneWidth, centreY, spread, textY, textSize } = layout.deck;
  const phoneHeight = Math.round(phoneWidth * PHONE_RATIO);
  const middle = (projects.length - 1) / 2;
  const line = punch(frame, DECK.from + 24, 10, 8);
  const push = mix(1, 1.05, (frame - DECK.from) / (DECK.to - DECK.from));

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        {projects.map((project, k) => {
          const offset = k - middle;
          const landed = punch(frame, DECK.from + k * 4, 10, 10);
          return (
            <div
              key={project.slug}
              style={{
                position: "absolute",
                left: layout.width / 2 + offset * spread - phoneWidth / 2,
                top: centreY - phoneHeight / 2 + offset * offset * 10,
                transform: `translateY(${mix(layout.height, 0, landed)}px) rotate(${mix(0, offset * 7, landed)}deg)`,
                transformOrigin: "50% 100%",
              }}
            >
              <PhoneFrame width={phoneWidth} height={phoneHeight}>
                {(screen) => <CaptureScreen capture={capturesOf(project.slug).phone} screen={screen} scrollY={0} />}
              </PhoneFrame>
            </div>
          );
        })}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: textY,
          left: layout.margin,
          right: layout.margin,
          textAlign: "center",
          color: color.white,
          fontFamily: font.display,
          fontWeight: 700,
          fontSize: textSize,
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
          opacity: line > 0 ? 1 : 0,
          transform: `scale(${mix(1.3, 1, line)})`,
        }}
      >
        {copy.deck}
      </div>
    </AbsoluteFill>
  );
}
