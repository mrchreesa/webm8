import type { CSSProperties, ReactNode } from "react";
import styles from "@/components/thank-you/thankYou.module.css";

const headline = ["See your new", "website before", "you pay a thing."];

/** The badge, headline and line under it that open both demo heroes. */
export function DemoIntro({ children }: { children: ReactNode }) {
  return (
    <>
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
        {children}
      </p>
    </>
  );
}
