import { color, font } from "../theme.ts";

/** The industry, outlined in neon. Neon may be text and rules on navy. */
export function IndustryTag({ label, size }: { label: string; size: number }) {
  return (
    <div
      style={{
        display: "inline-flex",
        padding: `${size * 0.45}px ${size * 0.9}px`,
        border: `2px solid ${color.brand}`,
        borderRadius: size * 2,
        color: color.brand,
        fontFamily: font.sans,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
}
