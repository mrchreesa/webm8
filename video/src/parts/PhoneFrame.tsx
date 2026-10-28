import type { ReactNode } from "react";
import { Img, staticFile } from "remotion";
import { scrolledBy, type Capture } from "../captures.ts";

export type Screen = { width: number; height: number };

/** The screen inside a phone body of this size. */
export function phoneScreen(width: number, height: number): Screen & { bezel: number } {
  const bezel = Math.round(width * 0.034);
  return { bezel, width: width - bezel * 2, height: height - bezel * 2 };
}

/** A phone body with a notch; `children` draws the screen, given its size. */
export function PhoneFrame({ width, height, children }: { width: number; height: number; children: (screen: Screen) => ReactNode }) {
  const screen = phoneScreen(width, height);
  return (
    <div
      style={{
        width,
        height,
        padding: screen.bezel,
        borderRadius: width * 0.17,
        background: "linear-gradient(145deg, #2a3446, #0b0f17 45%)",
        boxShadow: "0 50px 90px rgba(0, 4, 16, 0.6), inset 0 0 0 1.5px rgba(255, 255, 255, 0.12)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: screen.width,
          height: screen.height,
          borderRadius: width * 0.14,
          overflow: "hidden",
          background: "#000",
        }}
      >
        {children(screen)}
        <div
          style={{
            position: "absolute",
            top: width * 0.03,
            left: "50%",
            width: width * 0.3,
            height: width * 0.088,
            marginLeft: -width * 0.15,
            borderRadius: width,
            background: "#000",
          }}
        />
      </div>
    </div>
  );
}

/** A tall capture filling a phone screen, its page scrolled down by `scrollY` CSS px. */
export function CaptureScreen({ capture, screen, scrollY }: { capture: Capture; screen: Screen; scrollY: number }) {
  const shown = (capture.height * screen.width) / capture.width;
  const top = -Math.min(Math.max(0, shown - screen.height), scrolledBy(capture, screen.width, scrollY));
  return <Img src={staticFile(capture.src)} style={{ position: "absolute", top, left: 0, width: screen.width }} />;
}
