import type { CSSProperties, ReactNode } from "react";
import { mix, punch } from "../motion.ts";
import { color, font } from "../theme.ts";

/**
 * A headline that lands: oversized on its first frame, springing back to size
 * with a little overshoot. Hidden before `from`.
 */
export function Slam({
  frame,
  from,
  size,
  children,
  ink = color.white,
  align = "center",
  style,
}: {
  frame: number;
  from: number;
  size: number;
  children: ReactNode;
  ink?: string;
  align?: "center" | "left";
  style?: CSSProperties;
}) {
  if (frame < from) return null;
  const landed = punch(frame, from, 10, 9);
  return (
    <div
      style={{
        color: ink,
        fontFamily: font.display,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 0.95,
        letterSpacing: "-0.035em",
        textAlign: align,
        transform: `scale(${mix(1.3, 1, landed)})`,
        transformOrigin: align === "center" ? "50% 50%" : "0 50%",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
