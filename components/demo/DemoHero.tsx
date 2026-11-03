"use client";

import type { ReactNode } from "react";
import { DemoIntro } from "./DemoIntro";
import { DemoWall } from "./DemoWall";
import demo from "./demo.module.css";

/** Stable "random" points of light, the same on the server and in the browser. */
const LIGHTS = (() => {
  let seed = 11;
  const next = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: 28 }, (_, i) => ({ left: next() * 100, top: next() * 100, delay: -next() * 9, neon: i % 6 === 0 }));
})();

/**
 * The hero on /free-demo/ and /demo/: the promise on the left, in front of a
 * wall of the real demos that fills the hero (DemoWall); stacked on a phone,
 * the wall takes whatever height the intro leaves. `line` is the sentence
 * under the headline; `children` sit beneath it (on /free-demo/, the button
 * down to the form).
 */
export function DemoHero({ line, children }: { line: ReactNode; children?: ReactNode }) {
  return (
    <section data-analytics-section="Demo introduction"
      aria-labelledby="demo-title"
      className="surface-dark relative -mt-16 flex min-h-svh flex-col overflow-hidden bg-night pt-16 text-white md:-mt-20 md:pt-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_80%_0%,rgb(27_74_128/0.75),transparent_65%),radial-gradient(60%_50%_at_10%_100%,rgb(43_108_252/0.22),transparent_70%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={demo.heroFloor} />
        {LIGHTS.map((light, i) => (
          <span
            key={i}
            className={`${demo.heroDot}${light.neon ? ` ${demo.neon}` : ""}`}
            style={{ left: `${light.left}%`, top: `${light.top}%`, animationDelay: `${light.delay}s` }}
          />
        ))}
      </div>

      {/* Beside the wall, the empty half of the grid lets the pointer through to it. */}
      <div className="container-page relative z-10 w-full pt-3 pb-4 md:pt-10 md:pb-8 lg:pointer-events-none lg:grid lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:pb-20">
        <div className="lg:pointer-events-auto">
          <DemoIntro>{line}</DemoIntro>
          {children}
        </div>
      </div>

      <DemoWall />
    </section>
  );
}
