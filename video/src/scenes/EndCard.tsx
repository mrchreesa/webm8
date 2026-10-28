import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Layout } from "../layout.ts";
import { mix, punch } from "../motion.ts";
import { Mascot } from "../parts/Mascot.tsx";
import { copy } from "../reel.ts";
import { color, font, navyGround } from "../theme.ts";
import { END, END_CUES, easeInOut, type Span } from "../timeline.ts";

/** 0 → 1 across a cue, 0 before it and 1 after it. */
function through(frame: number, cue: Span): number {
  return Math.min(1, Math.max(0, (frame - cue.from) / (cue.to - cue.from)));
}

/**
 * One frame of neon, then "Want one?", the mascot, the free demo button and
 * the address. Every move finishes by END_STILL_FROM; after that it holds.
 */
export function EndCard({ layout }: { layout: Layout }) {
  const frame = useCurrentFrame() + END.from;
  if (frame < END_CUES.flash.to) return <AbsoluteFill style={{ background: color.brand }} />;

  const { mascotSize, headlineSize, buttonSize, addressSize } = layout.end;
  const headline = punch(frame, END_CUES.headline.from, 18, 8);
  const mascot = punch(frame, END_CUES.mascot.from, 20, 7);
  const button = punch(frame, END_CUES.button.from, 16, 9);
  const address = easeInOut(through(frame, END_CUES.address));
  const pulse = through(frame, END_CUES.pulse);
  const pulsing = frame >= END_CUES.pulse.from && frame < END_CUES.pulse.to;
  const blink = frame >= END_CUES.blink.from && frame < END_CUES.blink.to ? Math.sin(Math.PI * through(frame, END_CUES.blink)) : 0;
  const glance = easeInOut(through(frame, { from: END_CUES.button.from, to: END_CUES.button.from + 12 }));

  return (
    <AbsoluteFill style={{ background: navyGround, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          opacity: mascot > 0 ? 1 : 0,
          transform: `translateY(${mix(mascotSize, 0, mascot)}px) scale(${mix(0.6, 1, mascot)})`,
          transformOrigin: "50% 100%",
        }}
      >
        <Mascot size={mascotSize} lid={blink} gaze={{ x: 0, y: mix(0, 26, glance) }} />
      </div>
      <div
        style={{
          marginTop: -mascotSize * 0.06,
          color: color.white,
          fontFamily: font.display,
          fontWeight: 700,
          fontSize: headlineSize,
          lineHeight: 0.95,
          letterSpacing: "-0.035em",
          opacity: headline > 0 ? 1 : 0,
          transform: `scale(${mix(1.4, 1, headline)})`,
        }}
      >
        {copy.endHeadline}
      </div>
      <div
        style={{
          position: "relative",
          marginTop: buttonSize,
          opacity: button > 0 ? 1 : 0,
          transform: `scale(${mix(0.5, 1, button) * (1 + 0.08 * Math.sin(Math.PI * pulse))})`,
        }}
      >
        {pulsing ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: buttonSize * 2,
              border: `3px solid ${color.brand}`,
              opacity: 0.8 * (1 - pulse),
              transform: `scale(${1 + 0.35 * pulse})`,
            }}
          />
        ) : null}
        <div
          style={{
            padding: `${buttonSize * 0.6}px ${buttonSize * 1.2}px`,
            borderRadius: buttonSize * 2,
            background: color.brand,
            color: color.brandInk,
            fontFamily: font.sans,
            fontWeight: 600,
            fontSize: buttonSize,
            letterSpacing: "-0.01em",
            boxShadow: "0 20px 50px rgba(212, 255, 53, 0.25)",
          }}
        >
          {copy.endButton}
        </div>
      </div>
      <div
        style={{
          marginTop: addressSize * 0.9,
          color: color.brand,
          fontFamily: font.sans,
          fontWeight: 600,
          fontSize: addressSize,
          letterSpacing: "0.01em",
          opacity: address,
          transform: `translateY(${mix(20, 0, address)}px)`,
        }}
      >
        {copy.endAddress}
      </div>
    </AbsoluteFill>
  );
}
