import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { capturesOf } from "../../captures.ts";
import { BrandBug } from "../../kit/BrandBug.tsx";
import { EndCard } from "../../kit/EndCard.tsx";
import { SafeZoneGuide } from "../../kit/SafeZoneGuide.tsx";
import { Slam } from "../../kit/Slam.tsx";
import type { Rect } from "../../kit/safeZone.ts";
import { mix, punch } from "../../motion.ts";
import { CaptureScreen, PhoneFrame } from "../../parts/PhoneFrame.tsx";
import { color, font, navyGround } from "../../theme.ts";
import { easeInOut } from "../../timeline.ts";
import { abLayout } from "./layout.ts";
import { pairs, type PairId, type Side } from "./pairs.ts";
import { END, HOOK_CUES, SIDE_A, SIDE_B, VERSUS, VERSUS_CUES, length, sideCues, type Span } from "./timeline.ts";

export type ABPostProps = { pair: PairId; guides?: boolean };

const inside = (frame: number, span: Span) => frame >= span.from && frame < span.to;
/** How far each page scrolls while its side is up, in CSS px. */
const SCROLL = 700;

/** "Which would you book? A or B": two designs for the same business, then the question. */
export function ABPost({ pair: id, guides = false }: ABPostProps) {
  const frame = useCurrentFrame();
  const pair = pairs[id];
  return (
    <AbsoluteFill style={{ background: navyGround }}>
      {frame < SIDE_A.from ? <Hook frame={frame} pairId={id} /> : null}
      {inside(frame, SIDE_A) ? <SideBeat frame={frame} side={pair.a} letter="A" span={SIDE_A} /> : null}
      {inside(frame, SIDE_B) ? <SideBeat frame={frame} side={pair.b} letter="B" span={SIDE_B} /> : null}
      {inside(frame, VERSUS) ? <Versus frame={frame} pairId={id} /> : null}
      {frame >= END.from ? <EndCard frame={frame} from={END.from} {...pair.end} /> : <BrandBug frame={frame} />}
      {guides ? <SafeZoneGuide /> : null}
    </AbsoluteFill>
  );
}

function Hook({ frame, pairId }: { frame: number; pairId: PairId }) {
  const pair = pairs[pairId];
  const { hook } = abLayout;
  const rise = easeInOut(Math.min(1, frame / 40));
  return (
    <>
      {[pair.a, pair.b].map((side, i) => {
        const phone = hook.phones[i];
        return (
          <div
            key={side.slug}
            style={{ position: "absolute", left: phone.x, top: phone.y, transform: `translateY(${mix(260, 0, rise)}px) rotate(${i === 0 ? -6 : 6}deg)` }}
          >
            <PhoneFrame width={phone.width} height={phone.height}>
              {(screen) => <CaptureScreen capture={capturesOf(side.slug).phone} screen={screen} scrollY={0} />}
            </PhoneFrame>
          </div>
        );
      })}
      <Box rect={hook.lines}>
        <div>
          <Slam frame={frame} from={HOOK_CUES.first} size={hook.lineSize}>
            {pair.hook[0]}
          </Slam>
          <Slam frame={frame} from={HOOK_CUES.second} size={hook.lineSize} ink={color.brand}>
            {pair.hook[1]}
          </Slam>
        </div>
      </Box>
      <Box rect={hook.question}>
        <Slam frame={frame} from={HOOK_CUES.question} size={hook.questionSize}>
          {pair.question}
        </Slam>
      </Box>
    </>
  );
}

function SideBeat({ frame, side, letter, span }: { frame: number; side: Side; letter: "A" | "B"; span: Span }) {
  const { side: layout } = abLayout;
  const cues = sideCues(span);
  const landed = punch(frame, cues.phone, 14, 9);
  const scroll = easeInOut(Math.min(1, Math.max(0, (frame - cues.scroll.from) / length(cues.scroll))));
  const phone = layout.phone;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: phone.x,
          top: phone.y,
          transform: `translateY(${mix(420, 0, landed)}px) rotate(${mix(letter === "A" ? -8 : 8, 0, landed)}deg)`,
        }}
      >
        <PhoneFrame width={phone.width} height={phone.height}>
          {(screen) => <CaptureScreen capture={capturesOf(side.slug).phone} screen={screen} scrollY={scroll * SCROLL} />}
        </PhoneFrame>
      </div>
      <Letter rect={layout.letter} frame={frame} from={cues.letter}>
        {letter}
      </Letter>
      <Box rect={layout.look} align="left">
        <Slam frame={frame} from={cues.look} size={layout.lookSize} align="left">
          {side.look}
        </Slam>
      </Box>
    </>
  );
}

function Versus({ frame, pairId }: { frame: number; pairId: PairId }) {
  const pair = pairs[pairId];
  const { versus } = abLayout;
  const flown = punch(frame, VERSUS_CUES.phones, 12, 10);
  const subIn = Math.min(1, Math.max(0, (frame - VERSUS_CUES.sub) / 10));
  return (
    <>
      {[pair.a, pair.b].map((side, i) => {
        const phone = versus.phones[i];
        const from = i === 0 ? -1 : 1;
        return (
          <div
            key={side.slug}
            style={{
              position: "absolute",
              left: phone.x,
              top: phone.y,
              transform: `translateX(${mix(from * 700, 0, flown)}px) rotate(${mix(from * 14, from * 4, flown)}deg)`,
            }}
          >
            <PhoneFrame width={phone.width} height={phone.height}>
              {(screen) => <CaptureScreen capture={capturesOf(side.slug).phone} screen={screen} scrollY={0} />}
            </PhoneFrame>
          </div>
        );
      })}
      {(["A", "B"] as const).map((letter, i) => (
        <Letter key={letter} rect={versus.letters[i]} frame={frame} from={VERSUS_CUES.phones + 4}>
          {letter}
        </Letter>
      ))}
      <Box rect={versus.headline}>
        <Slam frame={frame} from={VERSUS_CUES.headline} size={versus.headlineSize}>
          {pair.versus.headline}
        </Slam>
      </Box>
      <Box rect={versus.sub}>
        <div
          style={{
            color: color.brand,
            fontFamily: font.sans,
            fontWeight: 600,
            fontSize: versus.subSize,
            opacity: subIn,
            transform: `translateY(${mix(14, 0, subIn)}px)`,
          }}
        >
          {pair.versus.sub}
        </div>
      </Box>
    </>
  );
}

/** A or B, in brand-ink on a neon disc: neon as a fill always carries brand-ink. */
function Letter({ rect, frame, from, children }: { rect: Rect; frame: number; from: number; children: string }) {
  if (frame < from) return null;
  const landed = punch(frame, from, 10, 8);
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        borderRadius: rect.width,
        background: color.brand,
        color: color.brandInk,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: font.display,
        fontWeight: 700,
        fontSize: rect.width * 0.62,
        transform: `scale(${mix(1.5, 1, landed)}) rotate(${mix(-20, 0, landed)}deg)`,
        boxShadow: "0 18px 40px rgba(0, 4, 16, 0.4)",
      }}
    >
      {children}
    </div>
  );
}

function Box({ rect, align = "center", children }: { rect: Rect; align?: "center" | "left"; children: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        display: "flex",
        alignItems: "center",
        justifyContent: align === "center" ? "center" : "flex-start",
      }}
    >
      {children}
    </div>
  );
}
