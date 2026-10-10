"use client";
import { useEffect } from "react";
import { MetaPixel } from "./MetaPixel";
import { measurementBlocked } from "@/lib/measurement";
import { rememberAttribution, rememberLandingReferrer } from "@/lib/leadAttribution";

declare global {
  interface Window {
    WebM8Analytics?: {
      consent(allowed: boolean): void;
      track(name: string): boolean;
      form(
        name: string,
        action: string,
        options?: { step?: number; steps?: number; code?: string },
      ): boolean;
      refresh(): void;
    };
  }
}
const siteId = process.env.NEXT_PUBLIC_WEBM8_ANALYTICS_SITE_ID;
const trackerUrl =
  process.env.NEXT_PUBLIC_WEBM8_TRACKER_URL ||
  "https://webm8-platform.vercel.app/tracker.js";

/**
 * Website measurement: the native WebM8 tracker and, where configured,
 * the Meta Pixel. A browser that sends Do Not Track or Global
 * Privacy Control gets none of them.
 */
export function WebsiteAnalytics() {
  useEffect(() => {
    // Capture arrival on every entry page so the eventual CRM enquiry keeps its source.
    rememberAttribution();
    rememberLandingReferrer();
    if (measurementBlocked(navigator)) return;
    if (!siteId || !/^[0-9a-f-]{36}$/i.test(siteId)) return;
    // The tracker waits to be told it may collect, so it is told once it is ready.
    if (window.WebM8Analytics) {
      window.WebM8Analytics.consent(true);
      return;
    }
    const ready = () => window.WebM8Analytics?.consent(true);
    window.addEventListener("webm8:ready", ready);
    if (!document.querySelector("script[data-webm8-native]")) {
      const script = document.createElement("script");
      script.src = trackerUrl;
      script.async = true;
      script.dataset.webm8Native = "true";
      script.dataset.site = siteId;
      script.dataset.paths =
        "/,/demo,/free-demo,/pricing,/contact,/work,/about,/movers,/thank-you";
      document.head.appendChild(script);
    }
    return () => window.removeEventListener("webm8:ready", ready);
  }, []);
  return <MetaPixel />;
}
