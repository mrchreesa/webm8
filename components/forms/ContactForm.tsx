"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  TextField,
  TextAreaField,
  SelectField,
  FormStatus,
} from "@/components/forms/FormField";
import {
  contactPlans,
  validateContactAnswers,
  type ContactErrors,
} from "@/lib/contactRequest";
import {
  rememberAttribution,
  rememberLandingReferrer,
} from "@/lib/leadAttribution";
import { trackEvent } from "@/lib/analytics";

export function ContactForm() {
  const params = useSearchParams();
  const plan = params?.get("plan");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [checks, setChecks] = useState(0);
  const [status, setStatus] = useState<"editing" | "sending" | "saved">(
    "editing",
  );
  const [message, setMessage] = useState("We reply within one business day.");
  const [dirty, setDirty] = useState(false);
  const busy = useRef(false);
  const started = useRef(false);
  const startedAt = useRef(0);
  const attempt = useRef({ answers: "", key: "" });
  const controller = useRef<AbortController | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    rememberAttribution();
    rememberLandingReferrer();
    return () => controller.current?.abort();
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    const first = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );
    first?.focus();
  }, [checks]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || status === "saved") return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const checked = validateContactAnswers(data);
    if (!checked.ok) {
      setErrors(checked.errors);
      setChecks((value) => value + 1);
      setMessage("Please check the highlighted fields.");
      window.WebM8Analytics?.form("contact_enquiry", "validation_error", {
        code: "validation",
      });
      return;
    }
    setErrors({});
    const serialized = JSON.stringify(checked.value);
    if (attempt.current.answers !== serialized)
      attempt.current = { answers: serialized, key: crypto.randomUUID() };
    busy.current = true;
    setStatus("sending");
    setMessage("Sending your enquiry…");
    window.WebM8Analytics?.form("contact_enquiry", "step_complete", { step: 1, steps: 1 });
    window.WebM8Analytics?.form("contact_enquiry", "submit");
    const abort = new AbortController();
    controller.current = abort;
    const timeout = window.setTimeout(() => abort.abort(), 20_000);
    try {
      const response = await fetch("/api/contact-request/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.signal,
        body: JSON.stringify({
          ...checked.value,
          submissionKey: attempt.current.key,
          website_hp: data.website_hp,
          elapsedMs: Date.now() - startedAt.current,
          attribution: rememberAttribution(),
          referrer: rememberLandingReferrer(),
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        id?: string;
        errors?: ContactErrors;
      };
      if (!response.ok || result.ok !== true || !result.id) {
        setErrors(result.errors || {});
        setChecks((value) => value + 1);
        setMessage(
          result.errors?.form ||
            "We couldn't confirm it was saved. Please try again; your answers are still here.",
        );
        setStatus("editing");
        window.WebM8Analytics?.form("contact_enquiry", "submission_error", {
          code: "server",
        });
        return;
      }
      setStatus("saved");
      setDirty(false);
      setMessage(
        "Your enquiry has been received. We’ll reply within one business day.",
      );
      window.WebM8Analytics?.form("contact_enquiry", "success");
      trackEvent("contact_enquiry_accepted");
    } catch {
      if (!form.isConnected) return;
      setStatus("editing");
      setMessage(
        "We couldn't confirm it was saved. Check your connection and try again; your answers are still here.",
      );
      window.WebM8Analytics?.form("contact_enquiry", "submission_error", {
        code: "network",
      });
    } finally {
      window.clearTimeout(timeout);
      busy.current = false;
    }
  }

  return (
    <form
      ref={formRef}
      data-analytics-section="Contact form"
      onSubmit={onSubmit}
      noValidate
      aria-busy={status === "sending"}
      onChange={(event) => {
        setDirty(true);
        if (!started.current) {
          started.current = true;
          window.WebM8Analytics?.form("contact_enquiry", "start");
          window.WebM8Analytics?.form("contact_enquiry", "step_view", { step: 1, steps: 1 });
        }
        const field = (event.target as HTMLInputElement)
          .name as keyof ContactErrors;
        if (errors[field]) {
          const checked = validateContactAnswers(
            Object.fromEntries(new FormData(event.currentTarget)),
          );
          setErrors((previous) => ({
            ...previous,
            [field]: checked.ok ? undefined : checked.errors[field],
          }));
        }
      }}
      className="shadow-card rounded-3xl border border-border bg-white p-6 md:p-8"
    >
      <fieldset
        disabled={status !== "editing"}
        className="grid min-w-0 gap-5 border-0 p-0 sm:grid-cols-2"
      >
        <legend className="sr-only">Your enquiry</legend>
        <TextField
          label="Business name"
          name="business"
          required
          autoComplete="organization"
          error={errors.business}
        />
        <TextField
          label="Your name"
          name="name"
          required
          autoComplete="name"
          error={errors.name}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          error={errors.email}
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          error={errors.phone}
        />
        <SelectField
          label="Interested in"
          name="plan"
          defaultValue={
            plan === "standard" || plan === "growth" ? plan : "unsure"
          }
          options={Object.entries(contactPlans).map(([value, label]) => ({
            value,
            label,
          }))}
          wide
          error={errors.plan}
        />
        <TextField
          label="Current website (optional)"
          name="website"
          type="url"
          placeholder="https://example.com"
          wide
          error={errors.website}
        />
        <TextAreaField
          label="How can we help? (optional)"
          name="message"
          rows={5}
          error={errors.message}
          hint="Up to 3,000 characters."
          placeholder="Tell us about your business and what you want the website to do."
        />
        <div hidden aria-hidden="true">
          <label>
            Leave this empty
            <input name="website_hp" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </fieldset>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          data-analytics-id="Send enquiry"
          type="submit"
          size="lg"
          disabled={status !== "editing"}
          aria-busy={status === "sending"}
          className="min-w-40 shrink-0 whitespace-nowrap"
        >
          {status === "sending"
            ? "Sending…"
            : status === "saved"
              ? "Enquiry received"
              : "Send enquiry"}
        </Button>
        <div role="status" aria-live="polite" aria-atomic="true">
          <FormStatus
            tone={
              status === "saved"
                ? "success"
                : Object.values(errors).some(Boolean) ||
                    message.startsWith("We couldn't")
                  ? "error"
                  : "neutral"
            }
          >
            {message}
          </FormStatus>
        </div>
      </div>
    </form>
  );
}
