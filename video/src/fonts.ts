import { loadFont } from "@remotion/fonts";
import funnelDisplayBold from "../../assets/fonts/FunnelDisplay-Bold.ttf";
import geistBlack from "../../assets/fonts/Geist-Black.ttf";
import geistRegular from "../../assets/fonts/Geist-Regular.ttf";
import geistSemiBold from "../../assets/fonts/Geist-SemiBold.ttf";
import { font } from "./theme.ts";

/** The site's own TTFs (the share images use them too). Each holds the render until it has loaded. */
export function loadFonts() {
  loadFont({ family: font.display, url: funnelDisplayBold, weight: "700" });
  loadFont({ family: font.sans, url: geistRegular, weight: "400" });
  loadFont({ family: font.sans, url: geistSemiBold, weight: "600" });
  loadFont({ family: font.sans, url: geistBlack, weight: "900" });
}
