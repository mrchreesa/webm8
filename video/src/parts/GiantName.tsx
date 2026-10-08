import { color, font } from "../theme.ts";

/** The business name as poster type behind the devices: two rows drifting apart around `centreY`, cropped by the frame. */
export function GiantName({ name, size, centreY, drift }: { name: string; size: number; centreY: number; drift: number }) {
  const row = (offset: number, opacity: number) => (
    <div
      style={{
        whiteSpace: "nowrap",
        fontFamily: font.display,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 0.86,
        letterSpacing: "-0.04em",
        textTransform: "uppercase",
        color: color.electric,
        opacity,
        transform: `translateX(${offset}px)`,
      }}
    >
      {name} {name}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: centreY, transform: "translateY(-50%)" }}>
      {row(-120 - drift, 0.22)}
      {row(-480 + drift, 0.12)}
    </div>
  );
}
