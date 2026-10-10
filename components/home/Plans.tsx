
import { analyticsName } from "@/lib/analyticsNames";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { plans } from "@/lib/site";

export function Plans() {
  return (
    <section data-analytics-section="Website plans" id="plans" aria-labelledby="plans-title" className="bg-bg py-28 text-ink-deep md:py-36">
      <div className="container-page">
        <header className="mb-14 max-w-2xl">
          <h2 id="plans-title" className="text-[clamp(2.3rem,5vw,4.4rem)] leading-[0.96] font-bold">
            Two plans. Priced for your business.
          </h2>
          <p className="mt-4 text-lg text-muted">
            Every project is quoted to the business, so you only pay for what you need. Pick the plan that fits and we&apos;ll send you a number.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 md:gap-7">
          {plans.map((plan) => {
            const featured = plan.highlighted;
            return (
              <article
                key={plan.id}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-[28px] p-9",
                  featured
                    ? "surface-dark bg-ink-deep text-white shadow-[0_40px_80px_-40px_rgb(7_26_51/0.6)]"
                    : "bg-white ring-1 ring-border ring-inset",
                )}
              >
                {featured && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-30 -right-30 h-90 w-90 rounded-full bg-[radial-gradient(circle,rgb(43_108_252/0.5),transparent_65%)]"
                  />
                )}
                <div className="relative flex items-center justify-between gap-3">
                  <h3 className="font-display text-[2.4rem] leading-none font-bold tracking-[-0.035em]">{plan.name}</h3>
                  {plan.badge && (
                    <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-ink">{plan.badge}</span>
                  )}
                </div>
                <p className={cn("relative mt-3.5 mb-6", featured ? "text-muted-invert" : "text-muted")}>{plan.summary}</p>
                <ul className="relative mb-8 grid gap-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-[0.96rem]">
                      <Icon name="check" size={16} className={cn("mt-1 shrink-0", featured ? "text-brand" : "text-accent")} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <LinkButton data-analytics-id={analyticsName(`Get ${plan.name} estimate`)}
                  href={`/contact/?plan=${plan.id}`}
                  size="lg"
                  variant={featured ? "primary" : "ghost"}
                  className="relative mt-auto w-full"
                >
                  {plan.ctaLabel}
                </LinkButton>
              </article>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          No large upfront website cost. Monthly support included. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
