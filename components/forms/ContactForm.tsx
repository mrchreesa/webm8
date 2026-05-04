"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  TextField,
  TextAreaField,
  SelectField,
  FormStatus,
} from "@/components/forms/FormField";
import { buildMailtoHref } from "@/lib/mailto";
import { intakeEmail } from "@/lib/site";

const planOptions = [
  { value: "standard", label: "Standard: $197/month" },
  { value: "growth", label: "Growth: $297/month" },
  { value: "unsure", label: "Not sure yet" },
];

type Status = {
  tone: "neutral" | "error" | "success";
  message: string;
};

const initial: Status = {
  tone: "neutral",
  message: "This opens a prefilled email draft using your default mail client.",
};

export function ContactForm() {
  const params = useSearchParams();
  const planFromUrl = params?.get("plan");
  const defaultPlan =
    planFromUrl === "standard" || planFromUrl === "growth"
      ? planFromUrl
      : "unsure";

  const [status, setStatus] = useState<Status>(initial);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "").trim();

    const business = get("business");
    const name = get("name");
    const email = get("email");
    const phone = get("phone");
    const plan = get("plan");

    if (!business || !name || !email || !phone) {
      setStatus({
        tone: "error",
        message:
          "Add business name, your name, email, and phone before sending.",
      });
      return;
    }

    const href = buildMailtoHref(
      intakeEmail,
      `New enquiry from ${business}${plan ? ` (${plan})` : ""}`,
      {
        Business: business,
        Name: name,
        Email: email,
        Phone: phone,
        "Interested plan": plan,
        "Current website": get("website"),
        Message: get("message"),
        Source: "WebM8 marketing site · /contact",
      },
    );

    setStatus({
      tone: "success",
      message: "Opening your default mail client with the enquiry…",
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
          autoComplete="organization"
        />
        <TextField
          label="Your name"
          name="name"
          required
          autoComplete="name"
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
        />
        <SelectField
          label="Interested in"
          name="plan"
          defaultValue={defaultPlan}
          options={planOptions}
          wide
        />
        <TextField
          label="Current website (optional)"
          name="website"
          type="url"
          placeholder="https://example.com"
          wide
        />
        <TextAreaField
          label="How can we help?"
          name="message"
          rows={4}
          placeholder="Tell us about your business and what you want the website to do."
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg">
          Send enquiry
        </Button>
        <FormStatus tone={status.tone}>{status.message}</FormStatus>
      </div>
    </form>
  );
}
