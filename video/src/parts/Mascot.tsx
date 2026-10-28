import { Img } from "remotion";
import mascot from "../../../public/mascot.png";

/**
 * The mascot with its eyes drawn on, as components/ui/MascotEyes.tsx draws
 * them on the site (same 1254 px view and coordinates). Here the eyes are
 * driven by frame: `lid` closes them (0 open, 1 shut) and `gaze` moves the
 * irises, in px of that view.
 */
const VIEW = 1254;
const EYES = [
  { cx: 470, rest: 18 },
  { cx: 780, rest: -18 },
] as const;
const EYE_Y = 506;

export function Mascot({ size, lid, gaze }: { size: number; lid: number; gaze: { x: number; y: number } }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <Img src={mascot} style={{ width: size, height: size }} />
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} style={{ position: "absolute", inset: 0, width: size, height: size }}>
        <defs>
          <radialGradient id="mascot-white" cx="50%" cy="62%" r="62%">
            <stop offset=".72" stopColor="#fff" />
            <stop offset="1" stopColor="#d9e3f7" />
          </radialGradient>
          <radialGradient id="mascot-iris" cx="50%" cy="40%" r="60%">
            <stop offset="0" stopColor="#3f74ff" />
            <stop offset=".8" stopColor="#1f49d6" />
            <stop offset="1" stopColor="#16359f" />
          </radialGradient>
          <linearGradient id="mascot-lid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2463f6" />
            <stop offset="1" stopColor="#3b7cfb" />
          </linearGradient>
          {EYES.map((eye) => (
            <clipPath key={eye.cx} id={`mascot-clip-${eye.cx}`}>
              <ellipse cx={eye.cx} cy={EYE_Y} rx="86" ry="99" />
            </clipPath>
          ))}
        </defs>
        {EYES.map((eye) => (
          <g key={eye.cx} clipPath={`url(#mascot-clip-${eye.cx})`}>
            <ellipse cx={eye.cx} cy={EYE_Y} rx="88" ry="101" fill="url(#mascot-white)" />
            <g transform={`translate(${eye.rest + gaze.x} ${4 + gaze.y})`}>
              <ellipse cx={eye.cx} cy={EYE_Y + 8} rx="58" ry="65" fill="url(#mascot-iris)" />
              <ellipse cx={eye.cx} cy={EYE_Y + 12} rx="39" ry="46" fill="#090f2d" />
              <circle cx={eye.cx + 17} cy={EYE_Y - 12} r="15" fill="#fff" />
            </g>
            <rect
              x={eye.cx - 90}
              y="400"
              width="180"
              height="214"
              fill="url(#mascot-lid)"
              style={{ transform: `scaleY(${lid})`, transformOrigin: `${eye.cx}px 405px` }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
