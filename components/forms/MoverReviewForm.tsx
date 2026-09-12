"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { FormStatus, TextField } from "@/components/forms/FormField";
import { Icon } from "@/components/ui/Icon";
import { CalEmbed } from "@/components/movers/CalEmbed";
import { usePlanSelection } from "@/components/movers/PlanSelection";
import {
  trackAcceptedReviewRequest,
  trackEvent,
} from "@/lib/analytics";
import { reviewCalendarLink, reviewCalendarUrl } from "@/lib/movers";

type Attribution = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  referrer: string;
  pagePath: string;
};

const emptyAttribution: Attribution = {
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmContent: "",
  utmTerm: "",
  referrer: "",
  pagePath: "",
};

type Accepted = { id: string; name: string; email: string };

export function MoverReviewForm() {
  const { plan, billing } = usePlanSelection();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState<Accepted | null>(null);
  const [hasWebsite, setHasWebsite] = useState(true);
  const [attribution, setAttribution] = useState<Attribution>(emptyAttribution);
  const openedAt = useRef(Date.now());
  const started = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAttribution({
      utmSource: params.get("utm_source") ?? "",
      utmMedium: params.get("utm_medium") ?? "",
      utmCampaign: params.get("utm_campaign") ?? "",
      utmContent: params.get("utm_content") ?? "",
      utmTerm: params.get("utm_term") ?? "",
      referrer: document.referrer,
      pagePath: window.location.pathname,
    });
    openedAt.current = Date.now();
  }, []);

  function onStart() {
    if (started.current) return;
    started.current = true;
    trackEvent("mover_review_form_started", {
      utm_source: attribution.utmSource || "direct",
      utm_campaign: attribution.utmCampaign,
      plan,
      billing,
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setSubmitting(true);
    setErrors({});

    const payload = {
      contactName: String(data.get("contactName") ?? ""),
      companyName: String(data.get("companyName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      websiteUrl: String(data.get("websiteUrl") ?? ""),
      hasWebsite,
      companyWebsiteHp: String(data.get("companyWebsiteHp") ?? ""),
      elapsedMs: Date.now() - openedAt.current,
      plan,
      billing,
      ...attribution,
    };

    try {
      // The trailing slash matters: trailingSlash redirects would otherwise
      // turn this POST into an extra round trip.
      const response = await fetch("/api/mover-review/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as
        | { ok: true; id: string }
        | { ok: false; errors?: Record<string, string> }
        | null;

      if (!response.ok || !result || !result.ok) {
        const fieldErrors = (result && !result.ok && result.errors) || {
          form: "We couldn't save that just now. Please try again, or email info@webm8agency.com.",
        };
        setErrors(fieldErrors);
        trackEvent("mover_review_request_failed", {
          status: response.status,
          utm_source: attribution.utmSource || "direct",
        });
        return;
      }

      // Success is claimed only now, with a recorded request behind it.
      trackAcceptedReviewRequest(result.id, {
        utm_source: attribution.utmSource || "direct",
        utm_medium: attribution.utmMedium,
        utm_campaign: attribution.utmCampaign,
        plan,
        billing,
      });

      setAccepted({
        id: result.id,
        name: payload.contactName,
        email: payload.email,
      });
    } catch {
      setErrors({
        form: "That didn't send — check your connection and try again, or email info@webm8agency.com.",
      });
      trackEvent("mover_review_request_failed", { status: 0 });
    } finally {
      setSubmitting(false);
    }
  }

  if (accepted) return <BookingPanel accepted={accepted} />;

  return (
    <form
      onSubmit={onSubmit}
      onFocus={onStart}
      noValidate
      className="rounded-3xl border border-border bg-white p-6 shadow-card md:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Your name"
          name="contactName"
          required
          placeholder="Jamie Smith"
          autoComplete="name"
          error={errors.contactName}
        />
        <TextField
          label="Moving company"
          name="companyName"
          required
          placeholder="Example Moving Co."
          autoComplete="organization"
          error={errors.companyName}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />
        <TextField
          label="Callback number"
          name="phone"
          type="tel"
          inputMode="tel"
          required
          placeholder="(555) 123-4567"
          autoComplete="tel"
          error={errors.phone}
        />

        <div className="sm:col-span-2">
          <TextField
            label="Current website"
            name="websiteUrl"
            type="url"
            inputMode="url"
            placeholder="example.com"
            autoComplete="url"
            disabled={!hasWebsite}
            error={errors.websiteUrl}
            hint={
              hasWebsite
                ? "We'll look at it before the call."
                : "No problem — we'll talk through your services and show a relevant example instead."
            }
            wide
          />
          <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={!hasWebsite}
              onChange={(event) => setHasWebsite(!event.target.checked)}
              className="h-5 w-5 rounded border-border text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            />
            I don&rsquo;t have a website yet
          </label>
        </div>

        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label>
            Leave this field empty
            <input
              type="text"
              name="companyWebsiteHp"
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>
      </div>

      <div className="mt-7">
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Sending your request…" : "Book my free 10-minute review"}
        </Button>
      </div>

      <div className="mt-4" aria-live="polite">
        {errors.form ? (
          <FormStatus tone="error">{errors.form}</FormStatus>
        ) : Object.keys(errors).length > 0 ? (
          <FormStatus tone="error">
            Check the highlighted fields and send again.
          </FormStatus>
        ) : (
          <FormStatus tone="neutral">
            You&rsquo;ll pick a time on the next step. If you&rsquo;d rather not
            book now, we&rsquo;ll email you within one business day.
          </FormStatus>
        )}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">
        By sending this, you agree that WebM8 may contact you about your review
        request by email or phone. We don&rsquo;t sell your details. Read the{" "}
        <Link href="/privacy/" className="font-medium text-brand underline hover:text-brand-hover">
          privacy notice
        </Link>
        .
      </p>
    </form>
  );
}

function BookingPanel({ accepted }: { accepted: Accepted }) {
  const [timeZone, setTimeZone] = useState("");
  const [booked, setBooked] = useState(false);

  // Stable identity: the embed effect re-runs if this callback changes.
  const onBookingConfirmed = useCallback(() => {
    setBooked(true);
    trackEvent("mover_booking_confirmed", { location: "review_success" });
  }, []);

  useEffect(() => {
    try {
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      setTimeZone("");
    }
  }, []);

  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-card md:p-8" role="status">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
        <Icon name="check" size={24} aria-hidden />
      </span>

      <h3 className="mt-5 text-2xl font-bold text-ink">
        {booked
          ? "Your call is confirmed."
          : "Your review request is received. Choose a time to confirm your call."}
      </h3>

      <p className="mt-3 leading-relaxed text-muted">
        {booked ? (
          <>
            You&rsquo;ll get a calendar invitation by email. If you need to move
            it, use the link in that invitation.
          </>
        ) : (
          <>
            We have your request and we&rsquo;ll keep it either way. Picking a
            time below confirms the call — until you do, the request is booked
            with us but the appointment isn&rsquo;t. If you&rsquo;d rather not
            choose now, we&rsquo;ll email you within one business day.
          </>
        )}
      </p>

      {!booked && (
        <>
          <div className="mt-6">
            <LinkButton
              href={`${reviewCalendarUrl}?name=${encodeURIComponent(accepted.name)}&email=${encodeURIComponent(accepted.email)}`}
              size="lg"
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackEvent("mover_booking_link_clicked", {
                  location: "review_success",
                })
              }
            >
              Choose a time
              <Icon name="calendar" size={18} aria-hidden />
            </LinkButton>
            {timeZone && (
              <p className="mt-3 text-sm text-muted">
                Times are shown in your local time zone ({timeZone}).
              </p>
            )}
          </div>

          <div className="mt-6">
            <CalEmbed
              calLink={reviewCalendarLink}
              name={accepted.name}
              email={accepted.email}
              onBookingConfirmed={onBookingConfirmed}
            />
          </div>
        </>
      )}
    </div>
  );
}
