import { AbsoluteFill, useCurrentFrame } from "remotion";
import { capturesOf } from "../captures.ts";
import type { Layout } from "../layout.ts";
import { mix, punch } from "../motion.ts";
import { BrowserFrame } from "../parts/BrowserFrame.tsx";
import { GiantName } from "../parts/GiantName.tsx";
import { IndustryTag } from "../parts/IndustryTag.tsx";
import { CaptureScreen, PhoneFrame } from "../parts/PhoneFrame.tsx";
import type { ReelProject } from "../reel.ts";
import { color, font } from "../theme.ts";
import { CAPTION_IN_FRAMES, easeInOut, siteSlot, siteSpan, whipAt } from "../timeline.ts";

/**
 * One site: its name as poster type behind, the browser and phone punching in
 * and scrolling the site together, and the name and industry below. It whips
 * in from, and out to, its neighbours.
 */
const SCROLL_FROM = 14;
const SCROLL_FRAMES = 44;
/** How far each page scrolls, in CSS px. */
const DESKTOP_SCROLL = 700;
const PHONE_SCROLL = 600;

export function SiteScene({ index, project, layout }: { index: number; project: ReelProject; layout: Layout }) {
  const frame = useCurrentFrame() + siteSpan(index).from;
  const slot = siteSlot(index);
  const shots = capturesOf(project.slug);
  const { x, blur } = whipAt(frame, index);
  const browserIn = punch(frame, slot.from, 16, 9);
  const phoneIn = punch(frame, slot.from + 3, 16, 9);
  const captionIn = punch(frame, slot.from, CAPTION_IN_FRAMES, 14);
  // Hold on the hero for a moment after landing, then scroll one screen or so down the site.
  const scroll = easeInOut(Math.min(1, Math.max(0, (frame - slot.from - SCROLL_FROM) / SCROLL_FRAMES)));
  const { browser, phone, caption } = layout;
  const filterId = `whip-${index}`;

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={filterId} x="-30%" y="0" width="160%" height="100%">
          <feGaussianBlur stdDeviation={`${blur * 44} 0`} />
        </filter>
      </svg>
      <AbsoluteFill
        style={{
          transform: `translateX(${x * layout.width}px)`,
          filter: blur > 0.01 ? `url(#${filterId})` : undefined,
        }}
      >
        <GiantName name={project.name} size={layout.giantSize} centreY={layout.giantY} drift={(frame - slot.from) * 2.4} />
        <div
          style={{
            position: "absolute",
            left: browser.x,
            top: browser.y,
            transform: `translateY(${mix(80, 0, browserIn)}px) scale(${mix(0.82, 1, browserIn)})`,
            transformOrigin: "50% 70%",
          }}
        >
          <BrowserFrame capture={shots.desktop} host={project.host} width={browser.width} height={browser.height} scrollY={scroll * DESKTOP_SCROLL} />
        </div>
        <div
          style={{
            position: "absolute",
            left: phone.x,
            top: phone.y,
            transform: `translateY(${mix(160, 0, phoneIn)}px) rotate(${mix(9, -3, phoneIn)}deg)`,
            transformOrigin: "50% 100%",
            opacity: frame >= slot.from + 3 || index > 0 ? 1 : 0,
          }}
        >
          <PhoneFrame width={phone.width} height={phone.height}>
            {(screen) => <CaptureScreen capture={shots.phone} screen={screen} scrollY={scroll * PHONE_SCROLL} />}
          </PhoneFrame>
        </div>
        <div
          style={{
            position: "absolute",
            left: caption.x,
            bottom: caption.bottom,
            maxWidth: caption.maxWidth,
            display: "flex",
            flexDirection: caption.inline ? "row" : "column",
            flexWrap: "wrap",
            alignItems: caption.inline ? "center" : "flex-start",
            gap: caption.inline ? 28 : 22,
            opacity: captionIn > 0 ? 1 : 0,
            transform: `translateY(${mix(48, 0, captionIn)}px)`,
          }}
        >
          <div
            style={{
              color: color.white,
              fontFamily: font.display,
              fontWeight: 700,
              fontSize: caption.nameSize,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
            }}
          >
            {project.name}
          </div>
          <IndustryTag label={project.industry} size={caption.tagSize} />
        </div>
      </AbsoluteFill>
    </>
  );
}
