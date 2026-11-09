import { DemoSketch } from "@/components/demo/DemoSketch";
import { Icon } from "@/components/ui/Icon";
import { type Answers, type Industry } from "@/lib/instantWebsite";
import type { TradeKey } from "@/lib/trades";
import styles from "./instant.module.css";

const sketchTrades: Record<Industry, TradeKey> = {
  trades: "plumbing", local: "cleaning", food: "restaurant", beauty: "medspa", other: "other",
};

export function InstantSummary({ answers, quote }: { answers: Answers; quote: boolean }) {
  return (
    <aside className={styles.summary} aria-label="Your website preview and plan">
      <DemoSketch
        trade={answers.industry ? sketchTrades[answers.industry] : ""}
        business={answers.businessName}
        area={answers.area}
        template={answers.industry === "local" ? "local" : undefined}
        className={styles.signupSketch}
        caption={answers.industry ? "An example layout with your business name. We’ll design your own demo from your website brief." : "Choose your business type and watch a first idea take shape."}
      />
      <div className={styles.planDetails}>
        <h3>{quote ? "A plan built around you." : "Your website, looked after."}</h3>
        <ul className={styles.included}>
          {(quote ? ["A quote for your requirements", "No payment on this route"] : ["Hosting, SSL & maintenance", "Unlimited revisions until you’re 100% satisfied", "One small content update each month"]).map((item) => <li key={item}><Icon name="check" size={16} aria-hidden />{item}</li>)}
        </ul>
        {quote && <p className={styles.summaryFoot}>Share the features you need and we’ll put together a custom quote.</p>}
      </div>
    </aside>
  );
}
