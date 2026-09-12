"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import {
  FormStatus,
  TextAreaField,
  TextField,
} from "@/components/forms/FormField";
import { Icon } from "@/components/ui/Icon";
import { trackEvent } from "@/lib/analytics";

type FormState = {
  tone: "neutral" | "error" | "success";
  message: string;
};

type TrackingData = {
  source: string;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
};

const initialStatus: FormState = {
  tone: "neutral",
  message: "We reply within one business day. No sales pressure.",
};

const initialTracking: TrackingData = {
  source: "WebM8 mover landing page",
  referrer: "",
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
  utm_term: "",
};

export function MoverPreviewForm() {
  const [status, setStatus] = useState<FormState>(initialStatus);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tracking, setTracking] = useState<TrackingData>(initialTracking);
  const started = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTracking({
      source: "WebM8 mover landing page",
      referrer: document.referrer,
      utm_source: params.get("utm_source") ?? "",
      utm_medium: params.get("utm_medium") ?? "",
      utm_campaign: params.get("utm_campaign") ?? "",
      utm_content: params.get("utm_content") ?? "",
      utm_term: params.get("utm_term") ?? "",
    });
  }, []);

  function onStart() {
    if (started.current) return;
    started.current = true;
    trackEvent("mover_preview_started", {
      source: tracking.utm_source || "direct",
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const endpoint = process.env.NEXT_PUBLIC_MOVERS_FORM_ENDPOINT;

    trackEvent("mover_preview_submit_attempted", {
      source: tracking.utm_source || "direct",
      campaign: tracking.utm_campaign,
    });

    if (!endpoint) {
      trackEvent("mover_preview_failed", { reason: "endpoint_missing" });
      setStatus({
        tone: "error",
        message:
          "The form is being connected. For now, email info@webm8agency.com.",
      });
      return;
    }

    setSubmitting(true);
    setStatus({ tone: "neutral", message: "Sending your request…" });

    const formData = new FormData(form);
    for (const [key, value] of Object.entries(tracking)) {
      formData.set(key, value);
    }
    formData.set("form_name", "Mover homepage preview");
    formData.set("page_url", window.location.href);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Form endpoint rejected the request");

      trackEvent("mover_preview_submitted", {
        source: tracking.utm_source || "direct",
        campaign: tracking.utm_campaign,
      });
      form.reset();
      setSubmitted(true);
      setStatus({
        tone: "success",
        message: "Request received. We’ll review your business and get in touch.",
      });
    } catch {
      trackEvent("mover_preview_failed", { reason: "request_failed" });
      setStatus({
        tone: "error",
        message:
          "That didn’t send. Please try again or email info@webm8agency.com.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    const calendarUrl = process.env.NEXT_PUBLIC_CALENDAR_URL;

    return (
      <div
        className="shadow-card rounded-3xl border border-emerald-200 bg-white p-7 md:p-9"
        role="status"
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Icon name="check" size={24} />
        </span>
        <h3 className="mt-5 text-2xl font-bold text-ink">
          Your preview request is in.
        </h3>
        <p className="mt-3 leading-relaxed text-muted">
          We’ll review your company, website and local market, then contact you
          within one business day to confirm the preview details.
        </p>
        {calendarUrl && (
          <div className="mt-6">
            <LinkButton
              href={calendarUrl}
              size="lg"
              target="_blank"
              onClick={() =>
                trackEvent("mover_calendar_clicked", {
                  location: "preview_success",
                })
              }
            >
              Choose a quick call time
              <Icon name="calendar" size={18} />
            </LinkButton>
          </div>
        )}
        <button
          type="button"
          className="mt-6 text-sm font-semibold text-brand hover:text-brand-hover"
          onClick={() => {
            setSubmitted(false);
            setStatus(initialStatus);
          }}
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      onFocus={onStart}
      className="shadow-card rounded-3xl border border-border bg-white p-6 md:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Moving company"
          name="business"
          required
          placeholder="Example Moving Co."
          autoComplete="organization"
        />
        <TextField
          label="Primary service area"
          name="service_area"
          required
          placeholder="Austin, TX"
          autoComplete="address-level2"
        />
        <TextField
          label="Your name"
          name="name"
          required
          placeholder="Jamie Smith"
          autoComplete="name"
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          required
          placeholder="(555) 123-4567"
          autoComplete="tel"
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          wide
        />
        <TextField
          label="Current website (optional)"
          name="website"
          type="url"
          placeholder="https://example.com"
          autoComplete="url"
          wide
        />
        <TextAreaField
          label="Services and biggest website challenge (optional)"
          name="details"
          rows={4}
          placeholder="Local moves, long-distance, packing… We need more estimate requests from mobile visitors."
        />
        <label className="absolute -left-[9999px]" aria-hidden="true">
          Leave this field empty
          <input
            type="text"
            name="_gotcha"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="mt-6">
        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto"
          disabled={submitting}
        >
          {submitting ? "Sending…" : "Request My Free Homepage Preview"}
          {!submitting && <Icon name="arrow" size={18} />}
        </Button>
      </div>

      <div className="mt-4" aria-live="polite">
        <FormStatus tone={status.tone}>{status.message}</FormStatus>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        By submitting, you agree that WebM8 may contact you about this request.
        We don’t sell your details. Read our{" "}
        <Link href="/privacy/" className="underline hover:text-brand">
          privacy notice
        </Link>
        .
      </p>
    </form>
  );
}
