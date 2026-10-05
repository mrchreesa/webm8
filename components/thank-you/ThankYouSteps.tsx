import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import styles from "./thankYou.module.css";

const steps = [
  {
    title: "We speak",
    body: "A quick call about your business, your current website and what you need from it.",
  },
  {
    title: "We create",
    body: "We design a personalised website demo around your business.",
  },
  {
    title: "You decide",
    body: "You only go ahead if you’re happy with what we’ve made.",
  },
];

const included = [
  "Designed for your business",
  "Built for phones",
  "Hosting included",
  "Kept secure",
  "Maintenance and support",
  "Easy updates",
];

export function ThankYouSteps() {
  return (
    <section
      aria-labelledby="steps-title"
      className="border-y border-border bg-surface py-14 md:py-20"
    >
      <div className="container-page">
        <h2
          id="steps-title"
          className="text-[clamp(1.9rem,6vw,3rem)] leading-[1.05] font-bold text-ink"
        >
          What happens next
        </h2>

        {/* A real sequence, so the steps are numbered and joined by a line:
            down the page on phones, across it from md up. */}
        <ol className="mt-9 grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className={cn(
                "relative pl-15 md:pt-16 md:pl-0",
                index < steps.length - 1 &&
                  "before:absolute before:top-12 before:bottom-[-1.5rem] before:left-[1.4rem] before:w-0.5 before:rounded-full before:bg-border md:before:top-[1.4rem] md:before:right-[-0.75rem] md:before:bottom-auto md:before:left-16 md:before:h-0.5 md:before:w-auto",
              )}
            >
              <span
                className={cn(
                  "absolute top-0 left-0 grid h-11.5 w-11.5 place-items-center rounded-full font-display text-lg font-bold",
                  index === 0 ? "bg-ink text-bg" : "bg-bg text-ink ring-2 ring-border ring-inset",
                )}
              >
                {index + 1}
              </span>
              <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xl font-bold text-ink md:text-2xl">
                {step.title}
                {index === 0 ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-info/12 px-2.5 py-1 text-xs font-semibold tracking-normal text-info-ink">
                    <span className={styles.live} aria-hidden />
                    Next
                  </span>
                ) : null}
              </h3>
              <p className="mt-1.5 max-w-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>

        <ul aria-label="Every website includes" className="mt-11 flex flex-wrap gap-2">
          {included.map((item) => (
            <li
              key={item}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-bg px-3.5 py-2 text-sm font-medium text-ink"
            >
              <Icon name="check" size={14} className="text-accent" aria-hidden />
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-6 flex items-start gap-2.5 font-semibold text-ink">
          <Icon name="shield" size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          No obligation to go ahead until you&rsquo;ve seen your demo.
        </p>
      </div>
    </section>
  );
}
