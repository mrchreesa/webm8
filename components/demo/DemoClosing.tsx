import type { CSSProperties } from "react";
import { DemoCtaButton } from "@/components/demo/DemoCtaButton";
import { MascotEyes } from "@/components/ui/MascotEyes";
import { demoSteps } from "@/lib/site";

// Fixed values, so the server and the browser render the same bubbles.
const BUBBLES = [
  { left: "6%", size: 14, duration: 15, delay: -2, drift: 18 },
  { left: "14%", size: 8, duration: 11, delay: -7, drift: -12 },
  { left: "22%", size: 20, duration: 18, delay: -11, drift: 24 },
  { left: "31%", size: 10, duration: 13, delay: -4, drift: -20 },
  { left: "43%", size: 16, duration: 16, delay: -9, drift: 10 },
  { left: "52%", size: 7, duration: 10, delay: -1, drift: -8 },
  { left: "61%", size: 18, duration: 17, delay: -13, drift: 22 },
  { left: "69%", size: 9, duration: 12, delay: -6, drift: -16 },
  { left: "77%", size: 13, duration: 14, delay: -3, drift: 14 },
  { left: "85%", size: 22, duration: 19, delay: -15, drift: -24 },
  { left: "92%", size: 8, duration: 11, delay: -8, drift: 12 },
];

/** The Free Personalised Website Demo close, shared by every marketing page. */
export function DemoClosing() {
  return (
    <section
      id="demo-closing"
      aria-labelledby="demo-closing-title"
      className="surface-dark relative overflow-hidden bg-night py-28 text-center text-white md:py-36"
      style={{ backgroundImage: "radial-gradient(80% 60% at 50% 100%, rgb(43 108 252 / 0.35), transparent 70%)" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 motion-reduce:hidden">
        {BUBBLES.map((bubble) => (
          <span
            key={bubble.left}
            className="animate-bubble absolute -bottom-5 rounded-full ring-1 ring-inset ring-muted-invert/35"
            style={
              {
                left: bubble.left,
                width: bubble.size,
                height: bubble.size,
                animationDuration: `${bubble.duration}s`,
                animationDelay: `${bubble.delay}s`,
                "--drift": `${bubble.drift}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="container-page relative">
        <MascotEyes className="animate-float mx-auto mb-7 w-[200px]" />
        <h2
          id="demo-closing-title"
          className="text-[clamp(2.6rem,6.4vw,5.4rem)] leading-[0.96] font-bold text-balance"
        >
          Let’s get your phone ringing.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-invert">
          Start with a Free Personalised Website Demo. We design a homepage for your business and show it to you, before you spend a cent.
        </p>

        <ol className="mx-auto mt-9 grid max-w-4xl gap-3.5 text-left md:grid-cols-3 md:gap-4.5">
          {demoSteps.map((step, index) => (
            <li key={step.title} className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-inset ring-white/10">
              <span className="mb-3.5 grid h-7.5 w-7.5 place-items-center rounded-full bg-brand font-mono text-[0.82rem] font-semibold text-brand-ink">
                {index + 1}
              </span>
              <h3 className="text-[1.04rem] font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-invert">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-9 flex flex-col items-center gap-3">
          <DemoCtaButton placement="closing" size="lg">
            Get my free personalised demo
          </DemoCtaButton>
          <p className="text-sm text-muted-invert">No payment. No obligation. We call you the same day.</p>
        </div>
      </div>
    </section>
  );
}
