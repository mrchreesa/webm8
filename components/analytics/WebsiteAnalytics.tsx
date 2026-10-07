"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { MixpanelAnalytics } from "./MixpanelAnalytics";
import { MetaPixel } from "./MetaPixel";
import {
  MEASUREMENT_KEY,
  MEASUREMENT_DAYS,
  readMeasurementChoice,
  measurementBlocked,
} from "@/lib/measurement";

declare global {
  interface Window {
    __webm8MeasurementAllowed?: boolean;
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
export function WebsiteAnalytics() {
  const [allowed, setAllowed] = useState(false),
    [open, setOpen] = useState(false),
    [blocked, setBlocked] = useState(false),
    [message, setMessage] = useState("");
  const settingsButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const applySaved = () => {
      const stop = measurementBlocked(navigator);
      let choice = null;
      try {
        choice = readMeasurementChoice(localStorage.getItem(MEASUREMENT_KEY));
      } catch {
        /* Choice stays in memory when browser storage is unavailable. */
      }
      setBlocked(stop);
      setAllowed(!stop && choice?.allowed === true);
      setOpen(!stop && !choice);
    };
    applySaved();
    const sync = (e: StorageEvent) => {
      if (e.key === MEASUREMENT_KEY || e.key === null) applySaved();
    };
    window.addEventListener("storage", sync);
    const expiry = window.setInterval(() => {
      try {
        const saved = localStorage.getItem(MEASUREMENT_KEY);
        if (saved && !readMeasurementChoice(saved)) applySaved();
      } catch {
        /* In-memory choice remains for this page. */
      }
    }, 60_000);
    return () => {
      window.removeEventListener("storage", sync);
      clearInterval(expiry);
    };
  }, []);
  useLayoutEffect(() => {
    window.__webm8MeasurementAllowed = allowed;
    let cancelled = false;
    if (!allowed) {
      window.WebM8Analytics?.consent(false);
      window.fbq?.("consent", "revoke");
      window.__webm8AnalyticsQueue = [];
      return;
    }
    window.fbq?.("consent", "grant");
    if (!siteId || !/^[0-9a-f-]{36}$/i.test(siteId)) return;
    if (window.WebM8Analytics) {
      window.WebM8Analytics.consent(true);
      return;
    }
    let script = document.querySelector<HTMLScriptElement>(
      "script[data-webm8-native]",
    );
    if (!script) {
      script = document.createElement("script");
      script.src = trackerUrl;
      script.async = true;
      script.dataset.webm8Native = "true";
      script.dataset.site = siteId;
      script.dataset.paths =
        "/,/demo,/free-demo,/pricing,/contact,/work,/about,/movers,/thank-you";
      document.head.appendChild(script);
    }
    const ready = () => {
      if (!cancelled && window.__webm8MeasurementAllowed)
        window.WebM8Analytics?.consent(true);
    };
    const failed = () => {
      if (!cancelled)
        setMessage(
          "Activity measurement could not load. The website and enquiry forms still work.",
        );
    };
    window.addEventListener("webm8:ready", ready);
    script.addEventListener("error", failed);
    return () => {
      cancelled = true;
      window.removeEventListener("webm8:ready", ready);
      script?.removeEventListener("error", failed);
    };
  }, [allowed]);
  function choose(value: boolean) {
    const permit = value && !measurementBlocked(navigator);
    try {
      localStorage.setItem(
        MEASUREMENT_KEY,
        JSON.stringify({
          allowed: permit,
          expires: Date.now() + MEASUREMENT_DAYS * 86400_000,
        }),
      );
    } catch {
      /* No storage required to decline or use the website. */
    }
    window.__webm8MeasurementAllowed = permit;
    if (!permit) {
      window.WebM8Analytics?.consent(false);
      window.fbq?.("consent", "revoke");
      window.__webm8AnalyticsQueue = [];
    }
    setAllowed(permit);
    setOpen(false);
    setMessage(
      permit ? "Activity measurement is on." : "Activity measurement is off.",
    );
    requestAnimationFrame(() => settingsButton.current?.focus());
  }
  return (
    <>
      {allowed && (
        <>
          <MixpanelAnalytics />
          <MetaPixel />
        </>
      )}
      <div className="measurement-controls" data-analytics-ignore>
        <button
          ref={settingsButton}
          type="button"
          className="measurement-settings"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="measurement-preferences"
        >
          Analytics choices
        </button>
        <span className="sr-only" role="status">
          {message}
        </span>
        {open && (
          <section
            id="measurement-preferences"
            className="measurement-panel"
            aria-labelledby="measurement-title"
          >
            <h2 id="measurement-title">Your website activity</h2>
            <p>
              With your permission, we measure pages, clicks and time spent in
              this browser. We compare visit times and ad tags with incoming
              enquiries to suggest possible website visits to our team. These
              comparisons do not confirm a visitor’s identity.
            </p>
            <p>
              Browser identifiers and activity last up to 180 days. We do not
              record form contents. You can turn measurement off here at any
              time. <Link href="/privacy/">Read our privacy notice.</Link>
            </p>
            {blocked ? (
              <p>Your browser’s privacy setting has disabled measurement.</p>
            ) : (
              <div className="measurement-actions">
                <button type="button" onClick={() => choose(true)}>
                  Allow activity measurement
                </button>
                <button type="button" onClick={() => choose(false)}>
                  {allowed
                    ? "Turn measurement off"
                    : "Continue without measurement"}
                </button>
              </div>
            )}
            <button
              type="button"
              className="measurement-close"
              onClick={() => {
                setOpen(false);
                settingsButton.current?.focus();
              }}
            >
              Close choices
            </button>
          </section>
        )}
      </div>
    </>
  );
}
