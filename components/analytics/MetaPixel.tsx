"use client";

import Script from "next/script";
import { metaPixelScript } from "@/lib/metaPixelScript";

/**
 * Loads the Meta Pixel only when an ID is configured and the browser has not
 * asked not to be tracked. Without `NEXT_PUBLIC_META_PIXEL_ID` the pixel is
 * absent entirely, and the Lead event for an accepted review request has
 * nowhere to go — which is the intended off state, not a silent failure.
 */
export function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  if (!pixelId) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {metaPixelScript(pixelId)}
    </Script>
  );
}
