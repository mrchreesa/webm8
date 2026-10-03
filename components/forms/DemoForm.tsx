"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  FormStatus,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/forms/FormField";
import { trackEvent } from "@/lib/analytics";
import {
  demoRequestMailFields,
  demoRequestSubject,
  readDemoPrefill,
  resolveDemoTrade,
  validateDemoRequest,
  type DemoRequestField,
  type DemoRequestInput,
} from "@/lib/demoRequest";
import { buildMailtoHref } from "@/lib/mailto";
import { intakeEmail } from "@/lib/site";
import { capitalise, tradeGroups, trades } from "@/lib/trades";

const tradeOptionGroups = tradeGroups.map(({ group, keys }) => ({
  label: group,
  options: keys.map((key) => ({ value: key, label: capitalise(trades[key].label) })),
}));

const FIELDS: DemoRequestField[] = ["business", "trade", "name", "email", "phone", "area", "website", "goal"];

type Prefill = { trade: string; business: string };

export function DemoForm() {
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const [errors, setErrors] = useState<Partial<Record<DemoRequestField, string>>>({});
  const [opened, setOpened] = useState(false);

  // Read after hydration: the page is static, and only the browser knows
  // what the visitor picked on the homepage.
  useEffect(() => {
    const stored = readDemoPrefill();
    setPrefill({
      trade: resolveDemoTrade(window.location.search, stored) ?? "",
      business: stored.business,
    });
  }, []);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input = Object.fromEntries(
      FIELDS.map((field) => [field, String(data.get(field) ?? "")]),
    ) as DemoRequestInput;

    const result = validateDemoRequest(input);
    if (!result.ok) {
      setErrors(result.errors);
      setOpened(false);
      const first = FIELDS.find((field) => result.errors[field]);
      if (first) event.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setErrors({});
    setOpened(true);
    trackEvent("demo_request_email_opened", { trade: result.request.trade });
    window.location.href = buildMailtoHref(
      intakeEmail,
      demoRequestSubject(result.request),
      demoRequestMailFields(result.request),
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      // Remount once the stored prefill is known, so defaultValue applies.
      key={prefill ? "prefilled" : "initial"}
      onSubmit={onSubmit}
      noValidate
      className="shadow-card rounded-3xl border border-border bg-white p-6 md:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Business name" name="business" required autoComplete="organization" placeholder="Reyes Plumbing" defaultValue={prefill?.business} error={errors.business} />
        <SelectField label="Type of business" name="trade" required groups={tradeOptionGroups} placeholder="Choose one" defaultValue={prefill?.trade ?? ""} error={errors.trade} />
        <TextField label="Your name" name="name" required autoComplete="name" placeholder="Jamie Smith" error={errors.name} />
        <TextField label="Email" name="email" type="email" inputMode="email" required autoComplete="email" placeholder="you@example.com" error={errors.email} />
        <TextField label="Phone (optional)" name="phone" type="tel" autoComplete="tel" placeholder="Best number to reach you" />
        <TextField label="City or service area" name="area" required placeholder="Austin, TX or West London" error={errors.area} />
        <TextField label="Current website (optional)" name="website" type="url" inputMode="url" placeholder="yourbusiness.com" wide />
        <TextAreaField label="What do you want more of? (optional)" name="goal" rows={3} placeholder="Calls, bookings, quote requests…" />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Button type="submit" size="lg" className="w-full sm:w-fit">
          Get my free personalised demo
        </Button>
        {opened ? (
          <FormStatus tone="success">
            Your email app should open with your request filled in. Press send and we&apos;ll reply within one business day. No email app? Write to{" "}
            <a className="font-semibold underline" href={`mailto:${intakeEmail}`}>
              {intakeEmail}
            </a>
            .
          </FormStatus>
        ) : hasErrors ? (
          <FormStatus tone="error">Check the highlighted fields.</FormStatus>
        ) : null}
      </div>
    </form>
  );
}
