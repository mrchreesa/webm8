"use client";

import Script from "next/script";

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
      {`
        if (navigator.doNotTrack !== "1") {
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', ${JSON.stringify(pixelId)});
          fbq('track', 'PageView');
        }
      `}
    </Script>
  );
}
