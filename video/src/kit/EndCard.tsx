import { AbsoluteFill } from "remotion";
import { mix, punch } from "../motion.ts";
import { Mascot } from "../parts/Mascot.tsx";
import { color, font, navyGround } from "../theme.ts";
import { END_CARD_MOVES, endCards, type EndCardVariant } from "./endCards.ts";
import { END_CARD } from "./safeZone.ts";
import { Slam } from "./Slam.tsx";

export function EndCard({
  frame,
  from,
  variant,
  headline,
  sub,
}: {
  frame: number;
  from: number;
  variant: EndCardVariant;
  headline?: string;
  sub?: string;
}) {
  const words = { ...endCards[variant], ...(headline ? { headline } : {}), ...(sub ? { sub } : {}) };
  const mascot = punch(frame, from + 4, 16, 7);
  const subIn = Math.min(1, Math.max(0, (frame - from - 10) / 10));
  const blinking = frame >= from + 18 && frame < from + END_CARD_MOVES;
  const lid = blinking ? Math.sin((Math.PI * (frame - from - 18)) / 6) : 0;
  return (
    <AbsoluteFill style={{ background: navyGround }}>
      <div
        style={{
          position: "absolute",
          left: END_CARD.mascot.x,
          top: END_CARD.mascot.y,
          opacity: frame >= from + 4 ? 1 : 0,
          transform: `translateY(${mix(200, 0, mascot)}px)`,
        }}
      >
        <Mascot size={END_CARD.mascot.width} lid={lid} gaze={{ x: 0, y: 18 }} />
      </div>
      <div style={{ position: "absolute", ...rect(END_CARD.headline), display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Slam frame={frame} from={from} size={112}>
          {words.headline}
        </Slam>
      </div>
      <div
        style={{
          position: "absolute",
          ...rect(END_CARD.sub),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color.brand,
          fontFamily: font.sans,
          fontWeight: 600,
          fontSize: 40,
          opacity: subIn,
          transform: `translateY(${mix(16, 0, subIn)}px)`,
        }}
      >
        {words.sub}
      </div>
    </AbsoluteFill>
  );
}

function rect(r: { x: number; y: number; width: number; height: number }) {
  return { left: r.x, top: r.y, width: r.width, height: r.height };
}
