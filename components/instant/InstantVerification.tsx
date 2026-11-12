"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_SCRIPT_ID, Turnstile } from "@marsidev/react-turnstile";
import styles from "./instant.module.css";

export function InstantVerification({ siteKey, onVerified }: { siteKey: string; onVerified: (seconds: number) => void }) {
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const active = useRef<AbortController | null>(null);
  const widgetReady = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!widgetReady.current) setError("Verification couldn’t load. Check your connection and try again.");
    }, 15000);
    return () => { window.clearTimeout(timer); active.current?.abort(); };
  }, [attempt]);

  async function verify(token: string) {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    try {
      const response = await fetch("/api/instant/verify/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.errors?.form);
      if (!controller.signal.aborted) onVerified(result.validForSeconds);
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error && e.name === "Error" && e.message
        ? e.message : "Verification couldn’t finish. Check your connection and try again.");
    }
  }

  function retry() {
    if (!window.turnstile) document.getElementById(DEFAULT_SCRIPT_ID)?.remove();
    widgetReady.current = false;
    setError("");
    setAttempt(n => n + 1);
  }

  return <div data-analytics-ignore>
    {error ? <div className={styles.notice} role="status">
      {error} <button type="button" className={styles.textButton} onClick={retry}>Retry verification</button>
    </div> : <>
      <span className={styles.hint} role="status">Checking your browser…</span>
      <Turnstile key={attempt} siteKey={siteKey}
        options={{ action: "instant_signup", appearance: "interaction-only", size: "compact", theme: "light", retry: "never", responseField: false }}
        onWidgetLoad={() => { widgetReady.current = true; }}
        onSuccess={verify}
        onError={() => setError("Your browser couldn’t complete verification.")}
        onTimeout={() => setError("Verification timed out.")}
        onUnsupported={() => setError("Please open the form in a supported browser to continue.")}
        scriptOptions={{ onError: () => setError("Verification couldn’t load. Check your connection and try again.") }}
      />
    </>}
  </div>;
}
