import { Img, staticFile } from "remotion";
import { scrolledBy, type Capture } from "../captures.ts";
import { color, font } from "../theme.ts";

const BAR = 46;

/** A dark browser window showing a tall capture, its page scrolled down by `scrollY` CSS px. */
export function BrowserFrame({
  capture,
  host,
  width,
  height,
  scrollY,
}: {
  capture: Capture;
  host: string;
  width: number;
  height: number;
  scrollY: number;
}) {
  const viewport = height - BAR;
  const shown = (capture.height * width) / capture.width;
  const top = -Math.min(Math.max(0, shown - viewport), scrolledBy(capture, width, scrollY));
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 18,
        overflow: "hidden",
        background: color.inkDeep,
        border: `1.5px solid ${color.inkRaised}`,
        boxShadow: "0 50px 100px rgba(0, 4, 16, 0.55), 0 12px 30px rgba(0, 4, 16, 0.35)",
      }}
    >
      <div style={{ height: BAR, display: "flex", alignItems: "center", gap: 9, padding: "0 18px" }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((dot) => (
          <div key={dot} style={{ width: 13, height: 13, borderRadius: 13, background: dot }} />
        ))}
        <div
          style={{
            marginLeft: 18,
            flex: 1,
            height: 28,
            borderRadius: 14,
            background: "rgba(255, 255, 255, 0.07)",
            color: color.mutedInvert,
            fontFamily: font.sans,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            paddingLeft: 16,
          }}
        >
          {host}
        </div>
      </div>
      <div style={{ height: viewport, overflow: "hidden", position: "relative" }}>
        <Img src={staticFile(capture.src)} style={{ position: "absolute", top, left: 0, width }} />
      </div>
    </div>
  );
}
