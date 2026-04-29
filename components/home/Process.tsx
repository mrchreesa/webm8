import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { processSteps } from "@/lib/site";

export function Process() {
  return (
    <Section
      eyebrow="How it works"
      title="From Audit to Launch to Ongoing Growth"
      subtitle="A clear, repeatable process that takes the guesswork out of getting a website that actually brings you customers."
      tone="surface"
    >
      <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {processSteps.map((step, i) => (
          <Reveal key={step.number} as="li" delay={i * 100}>
            <div className="relative flex h-full flex-col gap-3 rounded-2xl border border-border bg-bg p-6 transition-colors hover:border-ink/20">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-mono text-sm font-black text-white">
                  0{step.number}
                </span>
                {i < processSteps.length - 1 && (
                  <span className="hidden h-px flex-1 translate-x-4 bg-gradient-to-r from-border to-transparent lg:block" />
                )}
              </div>
              <h3 className="text-lg font-bold text-ink">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
