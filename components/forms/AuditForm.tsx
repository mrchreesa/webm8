"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  TextField,
  TextAreaField,
  FormStatus,
} from "@/components/forms/FormField";
import { buildMailtoHref } from "@/lib/mailto";
import { intakeEmail } from "@/lib/site";

type Status = {
  tone: "neutral" | "error" | "success";
  message: string;
};

const initial: Status = {
  tone: "neutral",
  message: "This opens a prefilled email draft using your default mail client.",
};

export function AuditForm() {
  const [status, setStatus] = useState<Status>(initial);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "").trim();

    const business = get("business");
    const name = get("name");
    const email = get("email");
    const website = get("website");

    if (!business || !name || !email || !website) {
      setStatus({
        tone: "error",
        message:
          "Add business name, your name, email, and website URL to request the audit.",
      });
      return;
    }

    const href = buildMailtoHref(
      intakeEmail,
      `Website audit request from ${business}`,
      {
        Business: business,
        Name: name,
        Email: email,
        Phone: get("phone"),
        "Primary location": get("location"),
        Website: website,
        "What feels weakest right now": get("notes"),
        Source: "WebM8 marketing site · /audit",
      },
    );

    setStatus({
      tone: "success",
      message: "Opening your default mail client with the audit request…",
    });
    window.location.href = href;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="shadow-card rounded-3xl border border-border bg-white p-6 md:p-8"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Business name"
          name="business"
          required
          placeholder="Precision HVAC"
          autoComplete="organization"
        />
        <TextField
          label="Your name"
          name="name"
          required
          placeholder="Jamie Smith"
          autoComplete="name"
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
        <TextField
          label="Phone (optional)"
          name="phone"
          type="tel"
          placeholder="(555) 123-4567"
          autoComplete="tel"
        />
        <TextField
          label="Primary location / service area"
          name="location"
          placeholder="Austin, TX"
          wide
        />
        <TextField
          label="Current website URL"
          name="website"
          type="url"
          required
          placeholder="https://example.com"
          wide
        />
        <TextAreaField
          label="What feels weakest right now?"
          name="notes"
          rows={4}
          placeholder="Example: not enough calls from the site, weak on mobile, reviews not visible, unclear services"
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg">
          Request Free Audit
        </Button>
        <FormStatus tone={status.tone}>{status.message}</FormStatus>
      </div>
    </form>
  );
}
