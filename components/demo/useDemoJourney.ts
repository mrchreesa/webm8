"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackAcceptedDemoRequest, trackEvent } from "@/lib/analytics";
import {
  demoStepCount,
  demoStepFields,
  emptyDemoAnswers,
  firstNameOf,
  validateDemoAnswers,
  validateDemoStep,
  type DemoAnswers,
  type DemoErrors,
  type DemoField,
  type DemoStep,
} from "@/lib/demoRequest";
import { rememberAttribution, type Attribution } from "@/lib/leadAttribution";
import { parseTrade, type TradeKey } from "@/lib/trades";

/**
 * The /demo/ journey's state. Answers are kept in sessionStorage for this tab
 * until the request is saved, so a reload or an accidental Back loses
 * nothing; after that, the success record replaces them. Nothing turns to
 * success until /api/demo-request/ confirms the request is saved.
 */

const STORAGE_KEY = "webm8:demo-journey";

export type DemoDone = {
  id: string;
  trade: TradeKey;
  business: string;
  area: string;
  firstName: string;
  phone: string;
  email: string;
};

type Stored =
  | { v: 1; step: DemoStep; answers: DemoAnswers; submissionKey: string; startedAt: number }
  | { v: 1; done: DemoDone };

export type JourneyStatus = "editing" | "sending" | "done";

/** A v4 UUID, made once per journey, so a retried submit is recognised as the same request. */
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
    if (![1, 2, 3, 4].includes(data.step) || typeof data.submissionKey !== "string") return null;
    return { ...data, answers: { ...emptyDemoAnswers, ...data.answers } };
  } catch {
    return null;
  }
}

function write(value: Stored) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Private browsing can refuse storage; the journey then lasts this page view.
  }
}

const stepOf = (field: DemoField): DemoStep =>
  (Number(Object.entries(demoStepFields).find(([, fields]) => fields.includes(field))?.[0]) || 1) as DemoStep;

export function useDemoJourney() {
  const [answers, setAnswers] = useState<DemoAnswers>(emptyDemoAnswers);
  const [step, setStep] = useState<DemoStep>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [errors, setErrors] = useState<DemoErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<JourneyStatus>("editing");
  const [done, setDone] = useState<DemoDone | null>(null);
  /** Bumped on every step change the visitor makes, so the view can move focus. */
  const [moves, setMoves] = useState(0);
  /** Bumped whenever a check finds errors, so the view can focus the first one. */
  const [checks, setChecks] = useState(0);

  const answersRef = useRef(answers);
  const stepRef = useRef(step);
  const keyRef = useRef("");
  const startedAt = useRef(0);
  const attribution = useRef<Attribution>({});
  const restored = useRef(false);

  useEffect(() => {
    attribution.current = rememberAttribution();
    const stored = read();
    if (stored && "done" in stored) {
      setDone(stored.done);
      setStatus("done");
    } else if (stored) {
      answersRef.current = stored.answers;
      stepRef.current = stored.step;
      keyRef.current = stored.submissionKey;
      startedAt.current = stored.startedAt;
      setAnswers(stored.answers);
      setStep(stored.step);
    }
    if (!keyRef.current) keyRef.current = newKey();
    if (!startedAt.current) startedAt.current = Date.now();
    restored.current = true;
  }, []);

  const persist = useCallback((nextStep: DemoStep, nextAnswers: DemoAnswers) => {
    if (!restored.current) return;
    write({ v: 1, step: nextStep, answers: nextAnswers, submissionKey: keyRef.current, startedAt: startedAt.current });
  }, []);

  const setAnswer = useCallback(
    (field: DemoField, value: string) => {
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
      persist(stepRef.current, next);
    },
    [persist],
  );

  const moveTo = useCallback(
    (target: DemoStep, from: DemoStep) => {
      stepRef.current = target;
      setDirection(target > from ? 1 : -1);
      setStep(target);
      setMoves((value) => value + 1);
      persist(target, answersRef.current);
    },
    [persist],
  );

  /** Checks this step and moves on. Returns false when it found errors. */
  const next = useCallback(() => {
    const current = stepRef.current;
    const found = validateDemoStep(current, answersRef.current);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setChecks((value) => value + 1);
      return false;
    }
    if (current < demoStepCount) {
      trackEvent("demo_step_completed", { step: current, trade: answersRef.current.trade });
      moveTo((current + 1) as DemoStep, current);
    }
    return true;
  }, [moveTo]);

  const back = useCallback(() => {
    const current = stepRef.current;
    if (current > 1) {
      setErrors({});
      setFormError(null);
      moveTo((current - 1) as DemoStep, current);
    }
  }, [moveTo]);

  const submit = useCallback(
    async (honeypot: string) => {
      const checked = validateDemoAnswers(answersRef.current);
      if (!checked.ok) {
        setErrors(checked.errors);
        setChecks((value) => value + 1);
        const first = (Object.keys(checked.errors) as DemoField[])[0];
        if (first && stepOf(first) !== stepRef.current) moveTo(stepOf(first), stepRef.current);
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
          area: checked.request.area,
          firstName: firstNameOf(checked.request.name),
          phone: checked.request.phone,
          email: checked.request.email,
        };
        write({ v: 1, done: record });
        setDone(record);
        setStatus("done");
        trackAcceptedDemoRequest(data.id, { trade: checked.request.trade, ...attribution.current });
        return;
      }

      setStatus("editing");
      const { form, ...fields } = data.errors ?? {};
      const firstField = (Object.keys(fields) as DemoField[])[0];
      if (firstField) {
        setErrors(fields);
        setChecks((value) => value + 1);
        if (stepOf(firstField) !== stepRef.current) moveTo(stepOf(firstField), stepRef.current);
      }
      if (form || !firstField) setFormError(form ?? "That didn't go through. Please try again.");
      trackEvent("demo_request_failed", {
        reason: response.status === 429 ? "rate_limited" : response.status === 400 ? "validation" : "server",
        trade,
      });
    },
    [moveTo],
  );

  const trade: TradeKey | null = parseTrade(answers.trade);

  return { answers, step, direction, errors, checks, formError, status, done, moves, trade, setAnswer, next, back, submit };
}
