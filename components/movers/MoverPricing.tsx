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

export function MoverPricing() {
  const { billing, setBilling, chooseAndRequest } = usePlanSelection();

  function changeBilling(next: BillingCycle) {
    if (next === billing) return;
    setBilling(next);
    trackEvent("mover_billing_changed", { billing: next });
  }

  return (
    <section id="pricing" className="relative bg-surface py-20 md:py-28">
      <div className="container-page">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
            Two ways to work with us.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted md:text-xl">
            Standard keeps a professional website running and brings the quote
            requests to you. Growth adds the monthly work — new pages, local
            visibility, follow-up and conversion.
          </p>
        </div>

        <BillingToggle billing={billing} onChange={changeBilling} />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
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

        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">
          Ad spend, paid software from other companies, and phone or text message
          usage are billed separately where they apply. We tell you the cost
          before any of it starts.
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
      className="mt-10 inline-flex rounded-full border border-border bg-bg p-1"
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
              : "bg-accent/15 text-emerald-700",
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
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex min-h-11 items-center rounded-full px-5 text-sm font-semibold transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        selected ? "bg-brand text-white" : "text-muted hover:text-ink",
      )}
    >
      {children}
    </button>
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

  return (
    <article className="flex h-full flex-col rounded-3xl border border-border bg-white p-7 shadow-card md:p-9">
      <p className="text-sm font-semibold text-brand">{plan.label}</p>
      <h3 className="mt-1 text-2xl font-bold text-ink">{plan.name}</h3>
      <p className="mt-3 leading-relaxed text-muted">{plan.summary}</p>

      <div className="mt-7 border-y border-border py-6">
        {annual ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight text-ink tabular-nums">
                {formatUsd(plan.annualPrice)}
              </span>
              <span className="text-muted">billed once a year</span>
            </div>
            <p className="mt-3 leading-relaxed text-muted">
              Pay for 10 months, get 12. That works out at{" "}
              <span className="font-semibold text-ink tabular-nums">
                {formatUsdPrecise(annualEquivalentMonthly(plan))}
              </span>{" "}
              a month, and saves{" "}
              <span className="font-semibold text-ink tabular-nums">
                {formatUsd(annualSaving(plan))}
              </span>{" "}
              against paying monthly.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight text-ink tabular-nums">
                {formatUsd(plan.monthlyPrice)}
              </span>
              <span className="text-muted">a month</span>
            </div>
            <p className="mt-3 leading-relaxed text-muted">
              Pay for the year up front instead and you get 2 months free —{" "}
              <span className="font-semibold text-ink tabular-nums">
                {formatUsd(plan.annualPrice)}
              </span>{" "}
              for 12 months of service.
            </p>
          </>
        )}
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-ink">
          <span>$0 setup fee</span>
          <span>No minimum contract term</span>
        </p>
      </div>

      <ul className="mt-7 grid gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 leading-relaxed text-ink">
            <Icon
              name="check"
              size={16}
              className="mt-1 shrink-0 text-accent"
              aria-hidden
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm leading-relaxed text-muted">{plan.footnote}</p>

      <div className="mt-7 pt-1">
        <Button size="lg" className="w-full" onClick={onChoose}>
          Book my free 10-minute review
        </Button>
        <p className="mt-3 text-center text-sm text-muted">
          No payment now. The review is a conversation, not a sales call.
        </p>
      </div>
    </article>
  );
}
