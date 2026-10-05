import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { MascotEyes } from "@/components/ui/MascotEyes";
import { brand } from "@/lib/site";
import styles from "./thankYou.module.css";

const headline = ["Thanks —", "we’ve received", "your details."];

// Fixed values, so the server and the browser render the same bubbles. Sizes
// and distances are in cqw, a share of the mascot's width, so the burst
// scales with it.
const BUBBLES = [
  { left: "8%", size: 11, delay: 0.35, duration: 1.6, drift: -20, rise: -95 },
  { left: "22%", size: 7, delay: 0.5, duration: 1.3, drift: -10, rise: -75 },
  { left: "36%", size: 15, delay: 0.42, duration: 1.9, drift: -12, rise: -115 },
  { left: "52%", size: 6, delay: 0.62, duration: 1.2, drift: 4, rise: -70 },
  { left: "60%", size: 12, delay: 0.3, duration: 1.8, drift: 16, rise: -105 },
  { left: "74%", size: 8, delay: 0.55, duration: 1.4, drift: 22, rise: -85 },
  { left: "84%", size: 5, delay: 0.7, duration: 1.1, drift: 10, rise: -60 },
];

/**
 * Confirmation first, with one welcome sequence. The visitor has just sent
 * their details, so the hero reassures and points at the work; it never asks
 * or sells again.
 */
export function ThankYouHero() {
  return (
    <section className="surface-dark relative -mt-16 overflow-hidden bg-night pt-16 text-bg md:-mt-20 md:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_85%_0%,rgb(27_74_128/0.7),transparent_60%)]"
      />

      <div className="container-page relative grid pt-8 pb-12 md:grid-cols-[1.25fr_0.75fr] md:items-center md:gap-10 md:pt-14 md:pb-20">
        <div
          aria-hidden
          className={`${styles.mascot} md:col-start-2 md:row-start-1`}
          style={{ containerType: "inline-size" }}
        >
          <div className={styles.glow} />
          <div className="absolute inset-0 motion-reduce:hidden">
            {BUBBLES.map((bubble) => (
              <span
                key={bubble.left}
                className={styles.bubble}
                style={
                  {
                    left: bubble.left,
                    width: `${bubble.size}cqw`,
                    height: `${bubble.size}cqw`,
                    "--delay": `${bubble.delay}s`,
                    "--duration": `${bubble.duration}s`,
                    "--drift": `${bubble.drift}cqw`,
                    "--rise": `${bubble.rise}cqw`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <div className={styles.surface}>
            <div className={styles.wave}>
              <MascotEyes
                priority
                sizes="(min-width: 768px) 304px, 152px"
                className="animate-float"
              />
            </div>
          </div>
        </div>

        <div className="max-w-2xl md:col-start-1 md:row-start-1">
          <p
            className={`${styles.badge} inline-flex items-center gap-2.5 rounded-full bg-white/8 py-1.5 pr-4 pl-1.5 text-sm font-semibold text-brand ring-1 ring-white/12`}
          >
            <span className={styles.check}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 12.5 10 17l9-10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.badgeText}>Details received</span>
          </p>

          <h1 className="relative mt-5 text-[clamp(2.4rem,9vw,4.6rem)] leading-[1] font-bold">
            {headline.map((line, index) => (
              <span key={line} className={styles.line}>
                <span style={{ "--i": index } as CSSProperties}>{line}</span>
              </span>
            ))}
          </h1>

          <p
            className={`${styles.after} mt-5 text-lg leading-relaxed text-muted-invert md:text-xl`}
            style={{ "--delay": "0.4s" } as CSSProperties}
          >
            We&rsquo;ll give you a quick call shortly to learn about your
            business and what you&rsquo;d like from your website.
          </p>

          {brand.phone ? (
            <p
              className={`${styles.after} mt-5 flex items-center gap-2.5 text-base text-bg`}
              style={{ "--delay": "0.48s" } as CSSProperties}
            >
              <Icon name="phone" size={18} className="shrink-0 text-brand" aria-hidden />
              <span>
                Your call will come from{" "}
                <a
                  href={`tel:${brand.phone}`}
                  data-lead-event="call_clicked"
                  data-lead-placement="hero"
                  className="font-bold whitespace-nowrap text-link-invert underline-offset-4 hover:underline"
                >
                  {brand.phoneLabel || brand.phone}
                </a>
              </span>
            </p>
          ) : null}

          <a
            href="#examples"
            className={`${styles.after} group mt-8 flex items-center justify-between gap-4 rounded-2xl bg-white/6 p-4 pl-5 ring-1 ring-white/12 transition-colors hover:bg-white/10 md:inline-flex md:pr-4`}
            style={{ "--delay": "0.56s" } as CSSProperties}
          >
            <span className="text-base leading-snug font-medium">
              While you wait, take a look at some of the websites we can build.
            </span>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-brand-ink transition-transform group-hover:translate-y-0.5">
              <Icon name="arrow" size={18} className="rotate-90" aria-hidden />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
