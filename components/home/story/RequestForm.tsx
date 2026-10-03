import { cn } from "@/lib/cn";
import { initialOf, type Trade } from "@/lib/trades";
import { CheckIcon } from "./icons";
import { StatusBar } from "./StatusBar";
import styles from "./story.module.css";

/** The trade's booking or quote form. StoryHero types the values in. */
export function RequestForm({ trade, name }: { trade: Trade; name: string }) {
  return (
    <div data-slot="form" className={cn(styles.slot, styles.form)}>
      <StatusBar time="9:42" />
      <div className={styles.formHead}>
        <span className={styles.formLogo}>{initialOf(name)}</span>
        <b>{name}</b>
      </div>
      <div className={styles.formBody}>
        <p className={styles.formTitle}>{trade.form.title}</p>
        <p className={styles.formSub}>{trade.form.sub}</p>
        {trade.form.fields.map((field, index) => (
          <div key={index} data-story="field" className={styles.field}>
            <span className={styles.fieldLabel}>{field.label}</span>
            <span data-story="field-value" className={styles.fieldValue} />
          </div>
        ))}
        <span data-story="form-button" className={styles.formButton}>
          {trade.form.button}
          <i data-story="tap-3" className={styles.tap} style={{ left: "50%", top: "50%" }} />
        </span>
      </div>
      <div data-story="done" className={styles.done}>
        <span className={styles.doneIcon}><CheckIcon /></span>
        <b>Request sent</b>
        <p>{name} {trade.form.done}</p>
      </div>
    </div>
  );
}
