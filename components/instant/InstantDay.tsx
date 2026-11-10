import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./instant.module.css";

const steps = [
  { title: "Your details", text: "Your name, business and town." },
  { title: "Free trial", text: "Add a card. £0 due today." },
  { title: "Website details", text: "Services, contacts and photos." },
  { title: "Your website", text: "Sent on WhatsApp within one working day." },
];

/**
 * Under the hero: the four steps from the form to a finished website, on one
 * low track. When it scrolls into view (Reveal sets data-state="in") the
 * track fills from the first step to the last, each node lighting as the
 * line reaches it. On phones only the step names show, to keep it short.
 */
export function InstantDay() {
  return (
    <section className={styles.day} aria-labelledby="instant-day-title">
      <div className={styles.dayInner}>
        <h2 id="instant-day-title">From your details to a finished website in one working day.</h2>
        <Reveal as="ol" variant="fade" className={styles.daySteps}>
          {steps.map((step, index) => (
            <li key={step.title} style={{ "--i": index } as CSSProperties}>
              <span className={styles.node}>{index === steps.length - 1 ? <Icon name="check" size={16} aria-hidden /> : index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
          <li className={styles.spark} aria-hidden="true" />
        </Reveal>
      </div>
    </section>
  );
}
