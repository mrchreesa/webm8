import { copy } from "../reel.ts";
import { color, font } from "../theme.ts";

/** "Demo sites by WebM8" and a counter, along the top through the sites and the deck. */
export function Header({ margin, size, count }: { margin: number; size: number; count?: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: margin - 8,
        left: margin,
        right: margin,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: font.sans,
        fontWeight: 600,
        fontSize: size,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: size * 0.5, color: color.white }}>
        <div style={{ width: size * 0.42, height: size * 0.42, borderRadius: size, background: color.brand }} />
        {copy.header}
      </div>
      {count ? <div style={{ color: color.mutedInvert, fontVariantNumeric: "tabular-nums" }}>{count}</div> : null}
    </div>
  );
}
