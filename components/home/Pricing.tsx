import { Section } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { plans } from "@/lib/site";

type PricingProps = {
  variant?: "section" | "bare";
  showReassurance?: boolean;
};

export function Pricing({
  variant = "section",
  showReassurance = true,
}: PricingProps) {
  const body = (
    <>
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:gap-8">
        {plans.map((plan, i) => (
          <Reveal key={plan.id} delay={i * 100}>
            <article
              className={cn(
                "relative flex h-full flex-col rounded-3xl p-7 transition-all duration-300 md:p-8",
                plan.highlighted
                  ? "shadow-cta border-2 border-brand bg-white md:scale-[1.02]"
                  : "shadow-card hover:shadow-card-hover border border-border bg-white",
              )}
            >
              {plan.badge && (
                <span className="absolute -top-3 right-7 inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow">
                  <Icon name="spark" size={12} />
                  {plan.badge}
                </span>
              )}
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-2xl font-bold text-ink">{plan.name}</h3>
              </div>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-5xl font-black tracking-tight text-ink">
                  ${plan.price}
                </span>
                <span className="pb-2 font-mono text-sm font-medium text-muted">
                  /{plan.period}
                </span>
              </div>
              <p className="mt-4 text-base leading-relaxed text-muted">
                {plan.summary}
              </p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-ink"
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <Icon name="check" size={12} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <LinkButton
                  href={`/contact?plan=${plan.id}`}
                  size="lg"
                  variant={plan.highlighted ? "primary" : "ghost"}
                  className="w-full"
                >
                  {plan.ctaLabel}
                </LinkButton>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {showReassurance && (
        <Reveal delay={200}>
          <p className="mt-10 text-center text-sm text-muted">
            No large upfront website cost. Monthly support included. Cancel
            anytime.
          </p>
        </Reveal>
      )}
    </>
  );

  if (variant === "bare") {
    return body;
  }

  return (
    <Section
      id="pricing"
      eyebrow="Pricing"
      title="Simple Monthly Website Plans"
      subtitle="Get a professional website without a large upfront cost. Choose the plan that fits your business goals."
      align="center"
      tone="tint"
    >
      {body}
    </Section>
  );
}
