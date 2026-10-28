import { AbsoluteFill } from "remotion";
import { REEL, SAFE } from "./safeZone.ts";

/** Red over the edges Instagram and Facebook cover. For checking stills only (`npm run stills -- ab --guides`). */
export function SafeZoneGuide() {
  const band = { position: "absolute" as const, background: "rgba(255, 0, 60, 0.28)" };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ ...band, left: 0, right: 0, top: 0, height: SAFE.top }} />
      <div style={{ ...band, left: 0, right: 0, top: SAFE.bottom, bottom: 0 }} />
      <div style={{ ...band, left: 0, width: SAFE.left, top: SAFE.top, height: SAFE.bottom - SAFE.top }} />
      <div style={{ ...band, left: SAFE.right, width: REEL.width - SAFE.right, top: SAFE.top, height: SAFE.bottom - SAFE.top }} />
    </AbsoluteFill>
  );
}
