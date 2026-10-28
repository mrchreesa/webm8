import type { CSSProperties, ReactNode } from "react";
import { font } from "../../theme.ts";

/** Screens are drawn 390 CSS px wide, like the phone captures, then scaled to the phone. */
export const SCREEN_CSS_WIDTH = 390;

export function Scaled({ screenWidth, screenHeight, children, style }: { screenWidth: number; screenHeight: number; children: ReactNode; style?: CSSProperties }) {
  const k = screenWidth / SCREEN_CSS_WIDTH;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: SCREEN_CSS_WIDTH,
        height: screenHeight / k,
        transform: `scale(${k})`,
        transformOrigin: "0 0",
        overflow: "hidden",
        fontFamily: font.sans,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StatusBar({ time, color }: { time: string; color: string }) {
  return (
    <div
      style={{
        height: 46,
        padding: "14px 30px 0 34px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        color,
        fontSize: 15,
        fontWeight: 600,
      }}
    >
      <span>{time}</span>
      <svg width="64" height="14" viewBox="0 0 64 14" fill={color}>
        <rect x="0" y="9" width="3" height="5" rx="1" />
        <rect x="5" y="6" width="3" height="8" rx="1" />
        <rect x="10" y="3" width="3" height="11" rx="1" />
        <rect x="15" y="0" width="3" height="14" rx="1" />
        <rect x="36" y="1" width="24" height="12" rx="3.5" fill="none" stroke={color} strokeWidth="1.4" opacity="0.6" />
        <rect x="38" y="3" width="18" height="8" rx="2" />
        <rect x="61" y="5" width="2" height="4" rx="1" opacity="0.6" />
      </svg>
    </div>
  );
}

/**
 * A finger on the glass: a dot that arrives a few frames before `at`, then a
 * ring that spreads as it taps. Positions are in CSS px of the screen.
 */
export function Tap({ x, y, frame, at }: { x: number; y: number; frame: number; at: number }) {
  const since = frame - at;
  if (since < -5 || since > 10) return null;
  const arriving = Math.min(1, (since + 5) / 5);
  const ring = Math.max(0, since) / 10;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      <div
        style={{
          position: "absolute",
          left: -22,
          top: -22,
          width: 44,
          height: 44,
          borderRadius: 44,
          background: "rgba(255, 255, 255, 0.55)",
          border: "2px solid rgba(7, 26, 51, 0.35)",
          opacity: since > 4 ? Math.max(0, 1 - (since - 4) / 6) : arriving,
          transform: `scale(${since >= 0 && since < 3 ? 0.82 : 1.3 - 0.3 * arriving})`,
        }}
      />
      {since >= 0 ? (
        <div
          style={{
            position: "absolute",
            left: -22,
            top: -22,
            width: 44,
            height: 44,
            borderRadius: 44,
            border: "3px solid rgba(255, 255, 255, 0.9)",
            opacity: 1 - ring,
            transform: `scale(${1 + ring * 1.4})`,
          }}
        />
      ) : null}
    </div>
  );
}

export function GlobeIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </svg>
  );
}
