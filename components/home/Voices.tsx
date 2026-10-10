"use client";

import { analyticsName } from "@/lib/analyticsNames";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { testimonials } from "@/lib/site";

export function Voices() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timer = useRef(0);

  const choose = (next: number) => {
    if (next === index) return;
    window.clearTimeout(timer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIndex(next);
      return;
    }
    setVisible(false);
    timer.current = window.setTimeout(() => {
      setIndex(next);
      setVisible(true);
    }, 220);
  };

  const current = testimonials[index];

  return (
    <section data-analytics-section="Testimonials" aria-labelledby="voices-title" className="surface-dark bg-ink-deep py-28 text-white md:py-36">
      <div className="container-page">
        <h2 id="voices-title" className="sr-only">
          What owners say
        </h2>
        <figure aria-live="polite">
          <blockquote
            className={cn(
              "min-h-[4.8em] max-w-4xl font-display text-[clamp(1.6rem,3.2vw,2.7rem)] leading-[1.18] font-semibold tracking-[-0.025em] text-balance transition-opacity duration-300",
              visible ? "opacity-100" : "opacity-0",
            )}
          >
            <p>&ldquo;{current.quote}&rdquo;</p>
          </blockquote>
          <figcaption className="sr-only">
            {current.name}, {current.role}, {current.company}
          </figcaption>
        </figure>
        <div role="group" aria-label="Choose a review" className="mt-9 flex flex-wrap gap-2.5">
          {testimonials.map((testimonial, i) => (
            <button data-analytics-id={analyticsName(`Read ${testimonial.company} review`)}
              key={testimonial.name}
              type="button"
              aria-pressed={i === index}
              onClick={() => choose(i)}
              className={cn(
                "flex items-center gap-3 rounded-full py-2 pr-4.5 pl-2 text-left transition-colors",
                i === index ? "bg-white/12 text-white" : "bg-white/5 text-muted-invert hover:text-white",
              )}
            >
              <span
                className={cn(
                  "grid h-9.5 w-9.5 place-items-center rounded-full font-mono text-xs font-semibold",
                  i === index ? "bg-brand text-brand-ink" : "bg-ink-raised text-white",
                )}
              >
                {testimonial.initials}
              </span>
              <span className="text-sm leading-tight">
                {testimonial.name}
                <small className="block text-xs opacity-80">
                  {testimonial.role}, {testimonial.company}
                </small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
