import { whatYouGet } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { BrowserMockup } from "@/components/ui/BrowserMockup";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";

export function WhatYouGet() {
  const half = Math.ceil(whatYouGet.length / 2);
  const col1 = whatYouGet.slice(0, half);
  const col2 = whatYouGet.slice(half);

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-20">
        <Reveal>
          <Eyebrow>Everything included</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink md:text-5xl">
            Everything Your Local Business Website Needs to Convert
          </h2>
          <p className="mt-5 text-lg text-muted">
            A complete, conversion-focused website system built for the way
            local customers actually search, compare, and decide.
          </p>

          <div className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {[col1, col2].map((col, i) => (
              <ul key={i} className="space-y-3">
                {col.map((feature, j) => (
                  <Reveal
                    key={feature}
                    as="li"
                    delay={(i * col.length + j) * 40}
                    className="flex items-start gap-3 text-base text-ink"
                  >
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <Icon name="check" size={14} />
                    </span>
                    <span className="font-medium">{feature}</span>
                  </Reveal>
                ))}
              </ul>
            ))}
          </div>
        </Reveal>

        <Reveal variant="slide-right" delay={120}>
          <div className="relative">
            <div
              aria-hidden
              className="animate-drift-slow-alt absolute -inset-6 rounded-[32px] bg-gradient-to-br from-accent/10 to-brand/15 blur-2xl"
            />
            <div className="relative rotate-1">
              <BrowserMockup
                palette="green"
                industry="Services"
                title="Clear services, clear next step."
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
