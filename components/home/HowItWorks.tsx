"use client";

import { useEffect, useRef } from "react";
import { processSteps } from "@/lib/site";

/** The four steps, with a neon line that follows reading position. */
export function HowItWorks() {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const steps = [...list.querySelectorAll<HTMLElement>("[data-step]")];
    let raf = 0;

    const update = () => {
      raf = 0;
      const box = list.getBoundingClientRect();
      const line = window.innerHeight * 0.6;
      const fill = box.height > 0 ? Math.min(1, Math.max(0, (line - box.top) / box.height)) : 0;
      list.style.setProperty("--fill", fill.toFixed(3));
      steps.forEach((step) => step.toggleAttribute("data-on", step.getBoundingClientRect().top < line));
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    let listening = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !listening) {
          listening = true;
          window.addEventListener("scroll", schedule, { passive: true });
          schedule();
        } else if (!entry.isIntersecting && listening) {
          listening = false;
          window.removeEventListener("scroll", schedule);
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(list);
    window.addEventListener("resize", schedule);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="surface-dark bg-night py-28 text-white md:py-36">
      <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <header className="lg:sticky lg:top-36 lg:self-start">
          <h2 id="how-title" className="text-[clamp(2.3rem,5vw,4.4rem)] leading-[0.96] font-bold">
            How it works.
          </h2>
          <p className="mt-4 max-w-md text-lg text-muted-invert">
            You&apos;ll always know what&apos;s happening, what we need from you, and what happens after launch.
          </p>
        </header>

        <div ref={listRef} className="relative pl-11">
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-3.5 w-0.5 bg-white/10" />
          <span
            aria-hidden="true"
            className="absolute top-2 left-3.5 w-0.5 bg-brand shadow-[0_0_12px_rgb(212_255_53/0.6)]"
            style={{ height: "calc((100% - 1rem) * var(--fill, 0))" }}
          />
          <ol className="grid gap-16">
            {processSteps.map((step) => (
              <li key={step.number} data-step className="group relative">
                <span
                  aria-hidden="true"
                  className="absolute top-0 -left-11 grid h-7.5 w-7.5 place-items-center rounded-full bg-night font-mono text-xs font-semibold text-muted-invert ring-2 ring-white/20 ring-inset transition-colors group-data-[on]:bg-brand group-data-[on]:text-brand-ink group-data-[on]:ring-0"
                >
                  {step.number}
                </span>
                <h3 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-bold text-muted-invert transition-colors group-data-[on]:text-white">
                  {step.title}
                </h3>
                <p className="mt-2.5 max-w-lg text-muted-invert">{step.body}</p>
                <p className="mt-3.5 inline-block rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white ring-1 ring-white/10 ring-inset">
                  From you: {step.need}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
