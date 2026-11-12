"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { draftAnswers, draftVisitKey, hasDraftContent } from "@/lib/instantDraft";
import type { Answers, Step } from "@/lib/instantWebsite";

type Snapshot = {
  enabled: boolean;
  answers: ReturnType<typeof draftAnswers>;
  step: string;
  revision: number;
  visitKey: string | null;
};

export function useInstantDraft(available: boolean, loaded: boolean, answers: Answers, step: Step, onVerificationRequired: () => void) {
  const touched = useRef(false);
  const composing = useRef(false);
  const latest = useRef<Snapshot | null>(null);
  const acknowledged = useRef(0);
  const [trackerVersion, trackerReady] = useReducer((version: number) => version + 1, 0);
  const legacyOptOut = useRef(false);

  useEffect(() => {
    // A tab which explicitly declined saving under the previous form keeps its choice.
    try { legacyOptOut.current = sessionStorage.getItem("webm8:instant-save-progress:v1") === "off"; }
    catch { /* Automatic saving does not require session storage. */ }
  }, []);

  const save = useCallback(async (snapshot: Snapshot, leaving = false) => {
    if (snapshot !== latest.current || acknowledged.current >= snapshot.revision) return true;
    if (composing.current && snapshot.enabled) return false;
    try {
      const response = await fetch("/api/instant/draft/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
        keepalive: leaving,
        signal: leaving ? undefined : AbortSignal.timeout(10000),
      });
      if (response.status === 428) onVerificationRequired();
      const receipt = await response.json();
      if (response.ok && receipt.ok && receipt.saved) {
        acknowledged.current = Math.max(acknowledged.current, snapshot.revision);
        return true;
      }
    } catch { /* The latest edit can retry on the next save or when the browser reconnects. */ }
    return false;
  }, [onVerificationRequired]);

  useEffect(() => {
    if (!available || !loaded || !touched.current || legacyOptOut.current) return;
    const finished = step === "complete";
    const fields = finished ? {} : draftAnswers(answers);
    if (!latest.current && !hasDraftContent(fields)) return;
    const snapshot: Snapshot = {
      enabled: !finished,
      answers: fields,
      visitKey: finished ? null : draftVisitKey(window.WebM8Analytics?.getContext?.()),
      step: finished ? "brief" : step === "quote-complete" ? "quote" : step,
      revision: Math.max(Date.now(), (latest.current?.revision ?? 0) + 1),
    };
    latest.current = snapshot;

    let cancelled = false;
    let timer = window.setTimeout(async () => {
      if (!(await save(snapshot)) && !cancelled) {
        timer = window.setTimeout(() => void save(snapshot), 1500);
      }
    }, finished ? 0 : 800);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [available, loaded, answers, step, save, trackerVersion]);

  const flush = useCallback((leaving = false) => {
    if (latest.current) void save(latest.current, leaving);
  }, [save]);

  useEffect(() => {
    if (!available) return;
    const leave = () => flush(true);
    const visibility = () => { if (document.visibilityState === "hidden") leave(); };
    const reconnect = () => flush();
    const ready = () => { if (touched.current) trackerReady(); };
    window.addEventListener("webm8:consent", ready);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", leave);
    window.addEventListener("online", reconnect);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("online", reconnect);
      window.removeEventListener("webm8:consent", ready);
    };
  }, [available, flush]);

  return {
    markChanged: () => { touched.current = true; },
    onBlur: () => flush(),
    onCompositionStart: () => { composing.current = true; },
    onCompositionEnd: () => { composing.current = false; flush(); },
  };
}
