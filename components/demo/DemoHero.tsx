"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { DemoDeck } from "./DemoDeck";
import { DemoIntro } from "./DemoIntro";

/**
 * The hero on /free-demo/ and /demo/: the promise on the left, the real demos
 * on the right, stacked on a phone. `line` is the sentence under the headline;
 * `children` sit beneath it (on /free-demo/, the button down to the form).
 */
export function DemoHero({ line, children }: { line: ReactNode; children?: ReactNode }) {
  const [deckIndex, setDeckIndex] = useState(0);

  return (
    <section data-analytics-section="Demo introduction"
      aria-labelledby="demo-title"
      className="surface-dark relative -mt-16 overflow-hidden bg-night pt-16 text-white md:-mt-20 md:pt-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_80%_0%,rgb(27_74_128/0.75),transparent_65%),radial-gradient(60%_50%_at_10%_100%,rgb(43_108_252/0.22),transparent_70%)]"
      />

      <div className="container-page relative grid gap-x-12 gap-y-4 pt-3 pb-14 md:gap-y-6 md:pt-10 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:pb-20">
        <div>
          <DemoIntro>{line}</DemoIntro>
          {children}
        </div>

        <div className="-mx-5 overflow-hidden px-5 pt-1 lg:mx-0 lg:overflow-visible lg:px-0">
          <DemoDeck active={deckIndex} onActiveChange={setDeckIndex} />
        </div>
      </div>
    </section>
  );
}
