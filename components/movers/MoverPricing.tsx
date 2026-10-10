"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { usePlanSelection } from "@/components/movers/PlanSelection";
import { cn } from "@/lib/cn";
import { trackEvent } from "@/lib/analytics";
import { moverPlans, type MoverPlan } from "@/lib/movers";

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
  const { chooseAndRequest } = usePlanSelection();

  return (
    <section
      id="pricing"
      aria-labelledby="mover-plans-heading"
      className="scroll-mt-20 bg-bg py-16 md:py-20"
    >
      <div className="container-page">
        <div className="max-w-2xl">
          <h2
            id="mover-plans-heading"
            className="text-4xl font-bold tracking-tight text-ink md:text-5xl"
          >
            Plans
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Every website is quoted to the business, so you only pay for what
            you need.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 md:gap-6">
          {moverPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onChoose={() => {
                trackEvent("mover_plan_selected", { plan: plan.id });
                chooseAndRequest(plan.id);
              }}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-ink">
          {["No setup fee", "No minimum contract term", "No payment to book"].map((item) => (
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

function PlanCard({
  plan,
  onChoose,
}: {
  plan: MoverPlan;
  onChoose: () => void;
}) {
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
        <p className="text-4xl font-bold tracking-tight lg:text-5xl">
          Custom quote
        </p>
        <p className={cn("mt-2 text-sm leading-relaxed", growth ? "text-muted-invert" : "text-muted")}>
          {plan.summary}
        </p>
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
