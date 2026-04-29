import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { testimonials } from "@/lib/site";

export function Testimonials() {
  return (
    <Section
      eyebrow="What owners say"
      title="Trusted by Local Business Owners"
      subtitle="Real businesses using their websites to win more calls, bookings, and customers."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 90}>
            <article className="shadow-card hover:shadow-card-hover flex h-full flex-col rounded-2xl border border-border bg-white p-7 transition-all duration-300 hover:-translate-y-1">
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Icon key={j} name="star-filled" size={16} />
                ))}
              </div>
              <p className="mt-4 text-base leading-relaxed text-ink">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-hover font-mono text-sm font-bold text-white">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">{t.name}</div>
                  <div className="text-xs text-muted">
                    {t.role} · {t.company}
                  </div>
                </div>
              </footer>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
