"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { usePlanSelection } from "@/components/movers/PlanSelection";
import { cn } from "@/lib/cn";
import { trackEvent } from "@/lib/analytics";
import {
  annualEquivalentMonthly,
  annualSaving,
  formatUsd,
  formatUsdPrecise,
  moverPlans,
  type BillingCycle,
  type MoverPlan,
} from "@/lib/movers";

const planHighlights: Record<MoverPlan["id"], string[]> = {
  standard: [
    "Custom website design and copy",
    "Mobile quote requests sent to your inbox",
    "Your reviews, photos and business details",
    "Hosting, security and small content updates",
    "SEO setup, analytics and monthly reporting",
  ],
  growth: [
    "Everything in Standard",
    "Google Business Profile optimization",
    "One new or improved page each month",
    "Review requests and follow-up integrations",
    "Monthly conversion work and performance review",
  ],
};

export function MoverPricing() {
  const { billing, setBilling, chooseAndRequest } = usePlanSelection();

  function changeBilling(next: BillingCycle) {
    if (next === billing) return;
    setBilling(next);
    trackEvent("mover_billing_changed", { billing: next });
  }

  return (
    <section
      id="pricing"
      aria-labelledby="mover-plans-heading"
      className="scroll-mt-20 bg-bg py-16 md:py-20"
    >
      <div className="container-page">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h2
            id="mover-plans-heading"
            className="text-4xl font-bold tracking-tight text-ink md:text-5xl"
          >
            Plans
          </h2>
          <BillingToggle billing={billing} onChange={changeBilling} />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 md:gap-6">
          {moverPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billing={billing}
              onChoose={() => {
                trackEvent("mover_plan_selected", { plan: plan.id, billing });
                chooseAndRequest(plan.id);
              }}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-ink">
          {["$0 setup fee", "No minimum contract term", "No payment to book"].map((item) => (
            <span key={item} className="inline-flex items-center gap-2">
              <Icon name="check" size={15} className="text-info-ink" aria-hidden />
              {item}
            </span>
          ))}
        </div>

        <details className="group mt-6 rounded-2xl border border-border bg-white">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
            Compare everything included
            <span
              className="text-xl leading-none transition-transform group-open:rotate-45"
              aria-hidden
            >
              +
            </span>
          </summary>
          <div className="grid gap-6 border-t border-border px-5 py-6 md:grid-cols-2 md:gap-10 md:px-8">
            {moverPlans.map((plan) => (
              <div key={plan.id}>
                <h3 className="font-bold text-ink">{plan.name}</h3>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                      <Icon name="check" size={15} className="mt-1 shrink-0 text-info-ink" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>

        <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-relaxed text-muted sm:text-sm">
          Ad spend, third-party software, and phone or text usage cost extra where
          applicable. Costs are agreed before anything starts.
        </p>
      </div>
    </section>
  );
}

function BillingToggle({
  billing,
  onChange,
}: {
  billing: BillingCycle;
  onChange: (next: BillingCycle) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Billing"
      className="inline-flex w-fit max-w-full rounded-full border border-border bg-white p-1"
    >
      <ToggleOption
        selected={billing === "monthly"}
        onSelect={() => onChange("monthly")}
      >
        Monthly
      </ToggleOption>
      <ToggleOption
        selected={billing === "annual"}
        onSelect={() => onChange("annual")}
      >
        Annual
        <span
          className={cn(
            "ml-2 rounded-full px-2 py-0.5 text-xs font-semibold",
            billing === "annual"
              ? "bg-white/20 text-white"
              : "bg-accent/15 text-accent",
          )}
        >
          2 months free
        </span>
      </ToggleOption>
    </div>
  );
}

function ToggleOption({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative cursor-pointer">
      <input
        type="radio"
        name="mover-billing"
        checked={selected}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span
        className={cn(
          "flex min-h-11 items-center rounded-full px-3.5 text-sm font-semibold transition-colors sm:px-5",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink",
          selected ? "bg-ink text-white" : "text-muted hover:text-ink",
        )}
      >
        {children}
      </span>
    </label>
  );
}

function PlanCard({
  plan,
  billing,
  onChoose,
}: {
  plan: MoverPlan;
  billing: BillingCycle;
  onChoose: () => void;
}) {
  const annual = billing === "annual";
  const growth = plan.id === "growth";

  return (
    <article
      aria-labelledby={`mover-plan-${plan.id}`}
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 shadow-card md:p-8",
        growth ? "border-ink bg-ink text-white" : "border-border bg-white text-ink",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={cn("text-xs font-semibold uppercase tracking-wider", growth ? "text-info" : "text-muted")}>
            {plan.label}
          </p>
          <h3 id={`mover-plan-${plan.id}`} className="mt-2 text-2xl font-bold tracking-tight">
            {plan.name}
          </h3>
        </div>
        <span
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            growth ? "bg-info/15 text-info" : "bg-ink/5 text-ink",
          )}
        >
          <Icon name={growth ? "chart" : "device"} size={21} aria-hidden />
        </span>
      </div>

      <div className={cn("mt-6 border-b pb-6", growth ? "border-white/15" : "border-border")}>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-5xl font-bold tracking-tight tabular-nums lg:text-[3.5rem]">
            {formatUsd(annual ? plan.annualPrice : plan.monthlyPrice)}
          </span>
          <span className={cn("text-sm", growth ? "text-muted-invert" : "text-muted")}>
            {annual ? "/ year" : "/ month"}
          </span>
        </div>
        <p className={cn("mt-2 text-sm leading-relaxed", growth ? "text-muted-invert" : "text-muted")}>
          {annual
            ? `Billed yearly · ${formatUsdPrecise(annualEquivalentMonthly(plan))}/mo equivalent`
            : "Billed monthly"}
        </p>
        {annual && (
          <p className={cn("mt-1 text-sm font-semibold", growth ? "text-info" : "text-info-ink")}>
            Save {formatUsd(annualSaving(plan))} a year
          </p>
        )}
      </div>

      <ul className="my-6 space-y-3">
        {planHighlights[plan.id].map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm leading-6">
            <span className={cn(
              "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
              growth ? "bg-info/15 text-info" : "bg-info-ink/10 text-info-ink",
            )}>
              <Icon name="check" size={12} strokeWidth={2.5} aria-hidden />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <Button
          size="lg"
          className="w-full"
          onClick={onChoose}
          aria-label={`Book a free demo for the ${plan.name} plan`}
        >
          Book my free demo
          <Icon name="arrow" size={17} aria-hidden />
        </Button>
        <p className={cn("mt-3 text-center text-xs", growth ? "text-muted-invert" : "text-muted")}>
          Free 10-minute call. No obligation.
        </p>
      </div>
    </article>
  );
}
