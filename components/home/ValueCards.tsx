import { Section } from "@/components/ui/Section";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { valueCards } from "@/lib/site";

export function ValueCards() {
  return (
    <Section
      eyebrow="Why your website matters"
      title="Your Website Should Help You Get More Customers"
      subtitle="A strong website helps local customers trust your business, understand your services, and take action faster. We design websites around the actions that matter most: calls, bookings, quote requests, and enquiries."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {valueCards.map((card, i) => (
          <Reveal key={card.title} delay={i * 80}>
            <article className="shadow-card hover:shadow-card-hover group relative flex h-full flex-col rounded-2xl border border-border bg-white p-7 transition-all duration-300 hover:-translate-y-1">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                <Icon name={card.icon as IconName} size={24} />
              </span>
              <h3 className="mt-5 text-xl font-bold text-ink">{card.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted">
                {card.body}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
