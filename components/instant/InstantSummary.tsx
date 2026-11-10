import { DemoSketch } from "@/components/demo/DemoSketch";
import { Icon } from "@/components/ui/Icon";
import { type Answers, type Industry } from "@/lib/instantWebsite";
import type { TradeKey } from "@/lib/trades";
import styles from "./instant.module.css";

const sketchTrades: Record<Industry, TradeKey> = {
  trades: "plumbing", local: "cleaning", food: "restaurant", beauty: "medspa", other: "other",
};

export function InstantSummary({ answers }: { answers: Answers }) {
  return (
    <aside className={styles.summary} aria-label="Your website preview">
      <DemoSketch
        trade={answers.industry ? sketchTrades[answers.industry] : ""}
        business={answers.businessName}
        area={answers.area}
        template={answers.industry === "local" ? "local" : undefined}
        className={styles.signupSketch}
        caption={answers.industry ? "An example layout with your business name. We’ll design your own demo from your website brief." : "Choose your business type and watch a first idea take shape."}
      />
    </aside>
  );
}

/** What the plan covers, in one row under the form and the phone. */
export function InstantPlan({ quote }: { quote: boolean }) {
  const items = quote
    ? ["A quote for your requirements", "No payment on this route"]
    : ["Hosting, SSL & maintenance", "Unlimited revisions until you’re 100% satisfied"];
  return (
    <div className={styles.plan}>
      <h2>{quote ? "A plan built around you." : "Your website, looked after."}</h2>
      <ul>{items.map((item) => <li key={item}><Icon name="check" size={16} aria-hidden />{item}</li>)}</ul>
    </div>
  );
}
