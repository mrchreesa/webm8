"use client";

import { useEffect } from "react";
import mixpanel from "mixpanel-browser";
import { flushAnalyticsQueue } from "@/lib/analytics";

export function MixpanelAnalytics() {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN?.trim();
  const apiHost =
    process.env.NEXT_PUBLIC_MIXPANEL_API_HOST?.trim() ||
    "https://api-eu.mixpanel.com";

  useEffect(() => {
    if (!token || browserSaysDoNotTrack()) return;

    mixpanel.init(token, {
      api_host: apiHost,
      autocapture: false,
      disable_persistence: true,
      ip: false,
      record_sessions_percent: 0,
      stop_utm_persistence: true,
      track_pageview: "url-with-path",
    });

    window.mixpanel = mixpanel;
    flushAnalyticsQueue();

    return () => {
      delete window.mixpanel;
    };
  }, [apiHost, token]);

  return null;
}

function browserSaysDoNotTrack() {
  return navigator.doNotTrack === "1";
}
