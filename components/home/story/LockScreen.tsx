import { cn } from "@/lib/cn";
import type { Trade } from "@/lib/trades";
import { GlobeIcon, MailIcon, SignalIcon } from "./icons";
import styles from "./story.module.css";

/** The owner's phone, after the story turns it around. */
export function LockScreen({ trade }: { trade: Trade }) {
  return (
    <div className={styles.lock}>
      <div className={styles.status}>
        <span />
        <SignalIcon />
      </div>
      <div className={styles.lockTime}>
        <small>Thursday, October 2</small>
        <b>9:43</b>
      </div>
      <div className={styles.notes}>
        <div data-story="note-0" className={cn(styles.note, styles.noteNew)}>
          <span className={styles.noteIcon}><GlobeIcon /></span>
          <div>
            <div className={styles.noteHead}><span>Website enquiry</span><span>now</span></div>
            <b>{trade.notification.title}</b>
            <p>{trade.notification.body}</p>
          </div>
        </div>
        <div data-story="note-1" className={styles.note}>
          <span className={cn(styles.noteIcon, styles.noteIconMail)}><MailIcon /></span>
          <div>
            <div className={styles.noteHead}><span>Mail</span><span>now</span></div>
            <b>Your customer got their confirmation</b>
            <p>We sent the details to the customer for you.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
