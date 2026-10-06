"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "@/components/thank-you/thankYou.module.css";
import { DemoDeck } from "./DemoDeck";
import { DemoJourney } from "./DemoJourney";
import { DemoSketch } from "./DemoSketch";
import { DemoStickyCta } from "./DemoStickyCta";
import { useDemoJourney } from "./useDemoJourney";

const headline = ["See your new", "website before", "you pay a thing."];

/**
 * The /demo/ hero. Meta ad visitors land here on a phone: the promise first,
 * then the deck (real demos, with their own sketch dealt on top as they
 * answer), then the four-step journey. On desktop the journey sits beside a
 * large deck.
 */
export function DemoHero() {
  const journey = useDemoJourney();
  const [deckIndex, setDeckIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const lastStatus = useRef(journey.status);

  const done = journey.done;
  const trade = done?.trade ?? journey.trade;
  const business = done?.business ?? journey.answers.business;
  const area = done?.area ?? journey.answers.area;

  // The deck comes back to the sketch when it first appears, on every step
  // change and on success, even if the visitor swiped away.
  useEffect(() => {
    if (trade) setDeckIndex(0);
  }, [trade, journey.step, journey.status]);

  // The moment a request is saved, bring the stamped sketch into view. A
  // reload that restores the success screen stays where it is.
  useEffect(() => {
    const sent = lastStatus.current === "sending" && journey.status === "done";
    lastStatus.current = journey.status;
    if (!sent) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    deckRef.current?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
  }, [journey.status]);

  return (
    <section
      aria-labelledby="demo-title"
      className="surface-dark relative -mt-16 overflow-hidden bg-night pt-16 text-white md:-mt-20 md:pt-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_80%_0%,rgb(27_74_128/0.75),transparent_65%),radial-gradient(60%_50%_at_10%_100%,rgb(43_108_252/0.22),transparent_70%)]"
      />

      <div className="container-page relative grid gap-x-12 gap-y-4 pt-3 pb-14 md:gap-y-6 md:pt-10 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:pb-20">
        <div className="lg:col-start-1 lg:row-start-1">
          <p
            className={`${styles.badge} inline-flex items-center gap-2 rounded-full bg-white/8 py-1.5 pr-3.5 pl-3 text-[0.78rem] font-semibold tracking-[0.04em] text-brand uppercase ring-1 ring-white/12`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_10px_var(--color-brand)]" aria-hidden />
            Free demo · No obligation
          </p>
          <h1 id="demo-title" className="mt-3.5 text-[clamp(2.15rem,9.2vw,4.4rem)] leading-[0.98] font-bold md:mt-4">
            {headline.map((line, index) => (
              <span key={line} className={styles.line}>
                <span style={{ "--i": index } as CSSProperties}>
                  {index === 1 ? (
                    <>
                      website <em className="text-brand not-italic">before</em>
                    </>
                  ) : (
                    line
                  )}
                </span>
              </span>
            ))}
          </h1>
          <p className={`${styles.after} mt-2.5 text-[0.95rem] text-balance text-muted-invert md:mt-5 md:text-lg`} style={{ "--delay": "0.35s" } as CSSProperties}>
            Two minutes now. Your demo 48 hours after our call.
          </p>
        </div>

        <div
          ref={deckRef}
          className="-mx-5 scroll-mt-20 overflow-hidden px-5 pt-1 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:self-center lg:overflow-visible lg:px-0"
        >
          <DemoDeck
            sketch={trade ? <DemoSketch trade={trade} business={business} area={area} /> : null}
            sketchKey={trade ?? "none"}
            active={deckIndex}
            onActiveChange={setDeckIndex}
            stamp={done ? done.business : null}
          />
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <DemoJourney journey={journey} cardRef={cardRef} onSeeMore={() => setDeckIndex(trade ? 1 : 0)} />
        </div>
      </div>

      <DemoStickyCta cardRef={cardRef} started={journey.step > 1} done={journey.status === "done"} />
    </section>
  );
}
