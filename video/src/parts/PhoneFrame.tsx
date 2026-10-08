import { Img, staticFile } from "remotion";
import { scrolledBy, type Capture } from "../captures.ts";

/** A phone showing a tall capture, its page scrolled down by `scrollY` CSS px. */
export function PhoneFrame({ capture, width, height, scrollY }: { capture: Capture; width: number; height: number; scrollY: number }) {
  const bezel = Math.round(width * 0.034);
  const screenWidth = width - bezel * 2;
  const screenHeight = height - bezel * 2;
  const shown = (capture.height * screenWidth) / capture.width;
  const top = -Math.min(Math.max(0, shown - screenHeight), scrolledBy(capture, screenWidth, scrollY));
  return (
    <div
      style={{
        width,
        height,
        padding: bezel,
        borderRadius: width * 0.17,
        background: "linear-gradient(145deg, #2a3446, #0b0f17 45%)",
        boxShadow: "0 50px 90px rgba(0, 4, 16, 0.6), inset 0 0 0 1.5px rgba(255, 255, 255, 0.12)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: screenWidth,
          height: screenHeight,
          borderRadius: width * 0.14,
          overflow: "hidden",
          background: "#000",
        }}
      >
        <Img src={staticFile(capture.src)} style={{ position: "absolute", top, left: 0, width: screenWidth }} />
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
