"use client";
import { useEffect, useRef } from "react";
import { createInstantAnalytics } from "@/lib/instantAnalytics";
import { measurementBlocked } from "@/lib/measurement";
import type { Step } from "@/lib/instantWebsite";

export function useInstantAnalytics(enabled: boolean, step: Step, loaded: boolean) {
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const recorder = useRef<ReturnType<typeof createInstantAnalytics> | null>(null);
  if (!recorder.current) recorder.current = createInstantAnalytics(
    () => enabledRef.current && typeof window !== "undefined" && !measurementBlocked(navigator),
    () => window.WebM8Analytics,
  );
  const analytics = recorder.current;
  useEffect(() => {
    const ready = () => { queueMicrotask(() => analytics.flush()); };
    window.addEventListener("webm8:ready", ready);
    window.addEventListener("webm8:consent", ready);
    return () => { window.removeEventListener("webm8:ready", ready); window.removeEventListener("webm8:consent", ready); analytics.clear(); };
  }, [analytics]);
  useEffect(() => {
    if (enabled && loaded && ["business", "checkout", "brief"].includes(step)) analytics.form("step_view", step === "business" ? 1 : step === "checkout" ? 2 : 3);
  }, [analytics, enabled, loaded, step]);
  return analytics;
}
