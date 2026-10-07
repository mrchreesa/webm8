"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackAcceptedDemoRequest, trackEvent } from "@/lib/analytics";
import {
  emptyDemoAnswers,
  firstNameOf,
  validateDemoAnswers,
  type DemoAnswers,
  type DemoErrors,
  type DemoField,
} from "@/lib/demoRequest";
import { rememberAttribution, type Attribution } from "@/lib/leadAttribution";
import { parseTrade, type TradeKey } from "@/lib/trades";

/**
 * The /free-demo/ form's state. Answers are kept in sessionStorage for this
 * tab until the request is saved, so a reload or an accidental Back loses
 * nothing; after that, the success record replaces them. Nothing turns to
 * success until /api/demo-request/ confirms the request is saved.
 */

const STORAGE_KEY = "webm8:demo-request";

export type DemoDone = {
  id: string;
  trade: TradeKey;
  business: string;
  firstName: string;
  phone: string;
  email: string;
};

type Stored =
  | { v: 1; answers: DemoAnswers; submissionKey: string; startedAt: number }
  | { v: 1; done: DemoDone };

export type DemoRequestStatus = "editing" | "sending" | "done";

/** A v4 UUID, made once per request, so a retried submit is recognised as the same request. */
function newKey() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function read(): Stored | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Stored;
    if (data?.v !== 1) return null;
    if ("done" in data) return data.done?.id && parseTrade(data.done.trade) ? data : null;
    if (typeof data.submissionKey !== "string") return null;
    return { ...data, answers: { ...emptyDemoAnswers, ...data.answers } };
  } catch {
    return null;
  }
}

function write(value: Stored) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Private browsing can refuse storage; the answers then last this page view.
  }
}

export function useDemoRequest() {
  const [answers, setAnswers] = useState<DemoAnswers>(emptyDemoAnswers);
  const [errors, setErrors] = useState<DemoErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<DemoRequestStatus>("editing");
  const [done, setDone] = useState<DemoDone | null>(null);
  /** True once a request is saved in this page view; false when a reload restores one. */
  const [justSaved, setJustSaved] = useState(false);
  /** Bumped whenever a check finds errors, so the view can focus the first one. */
  const [checks, setChecks] = useState(0);

  const answersRef = useRef(answers);
  const keyRef = useRef("");
  const startedAt = useRef(0);
  const attribution = useRef<Attribution>({});
  const restored = useRef(false);
  const started = useRef(false);

  useEffect(() => {
    attribution.current = rememberAttribution();
    const stored = read();
    if (stored && "done" in stored) {
      setDone(stored.done);
      setStatus("done");
    } else if (stored) {
      answersRef.current = stored.answers;
      keyRef.current = stored.submissionKey;
      startedAt.current = stored.startedAt;
      setAnswers(stored.answers);
    }
    if (!keyRef.current) keyRef.current = newKey();
    if (!startedAt.current) startedAt.current = Date.now();
    restored.current = true;
  }, []);

  const setAnswer = useCallback((field: DemoField, value: string) => {
    const next = { ...answersRef.current, [field]: value };
    answersRef.current = next;
    setAnswers(next);
    setErrors((current) => {
      if (!current[field]) return current;
      const rest = { ...current };
      delete rest[field];
      return rest;
    });
    setFormError(null);
    if (!restored.current) return;
    write({ v: 1, answers: next, submissionKey: keyRef.current, startedAt: startedAt.current });
    if (!started.current) {
      started.current = true;
      trackEvent("demo_form_started");
    }
  }, []);

  const submit = useCallback(async (honeypot: string) => {
    const checked = validateDemoAnswers(answersRef.current);
    if (!checked.ok) {
      setErrors(checked.errors);
      setChecks((value) => value + 1);
      return;
    }

    setStatus("sending");
    setFormError(null);
    const trade = answersRef.current.trade;

    let response: Response;
    try {
      response = await fetch("/api/demo-request/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...answersRef.current,
          submissionKey: keyRef.current,
          elapsedMs: Date.now() - startedAt.current,
          website_hp: honeypot,
          attribution: attribution.current,
          referrer: document.referrer,
          pagePath: window.location.pathname,
        }),
      });
    } catch {
      setStatus("editing");
      setFormError("That didn't go through. Check your connection and try again.");
      trackEvent("demo_request_failed", { reason: "network", trade });
      return;
    }

    const data = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      id?: string;
      errors?: DemoErrors & { form?: string };
    };

    if (response.ok && data.ok && data.id) {
      const record: DemoDone = {
        id: data.id,
        trade: checked.request.trade,
        business: checked.request.business,
        firstName: firstNameOf(checked.request.name),
        phone: checked.request.phone,
        email: checked.request.email,
      };
      write({ v: 1, done: record });
      setDone(record);
      setStatus("done");
      setJustSaved(true);
      trackAcceptedDemoRequest(data.id, { trade: checked.request.trade, ...attribution.current });
      return;
    }

    setStatus("editing");
    const { form, ...fields } = data.errors ?? {};
    const hasFieldErrors = Object.keys(fields).length > 0;
    if (hasFieldErrors) {
      setErrors(fields);
      setChecks((value) => value + 1);
    }
    if (form || !hasFieldErrors) setFormError(form ?? "That didn't go through. Please try again.");
    trackEvent("demo_request_failed", {
      reason: response.status === 429 ? "rate_limited" : response.status === 400 ? "validation" : "server",
      trade,
    });
  }, []);

  return { answers, errors, checks, formError, status, done, justSaved, setAnswer, submit };
}
