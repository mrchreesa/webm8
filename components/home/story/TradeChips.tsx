"use client";

import { useEffect, useId, useRef } from "react";
import { heroTradeOrder, trades, type TradeKey } from "@/lib/trades";
import { TradeIcon } from "./TradeIcon";
import styles from "./story.module.css";

/** Every trade the story plays, with the one on the phone right now lit. Picking one plays it next. */
export function TradeChips({ shownKey, onPick }: { shownKey: TradeKey; onPick: (key: TradeKey) => void }) {
  const labelId = useId();
  const listRef = useRef<HTMLUListElement>(null);

  // On phones the chips scroll sideways: bring the lit one into view
  // without moving the page.
  useEffect(() => {
    const list = listRef.current;
    const chip = list?.querySelector<HTMLElement>(`[data-trade="${shownKey}"]`);
    if (!list || !chip || list.scrollWidth <= list.clientWidth) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({
      left: chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [shownKey]);

  return (
    <div className={styles.chipsBlock}>
      <p id={labelId} className={styles.chipsLabel}>
        Built for businesses like yours
      </p>
      <ul ref={listRef} aria-labelledby={labelId} data-story="chips" className={styles.chips}>
        {heroTradeOrder.map((key) => (
          <li key={key} data-trade={key} className={styles.chipItem}>
            <button
              type="button"
              data-live={key === shownKey ? "" : undefined}
              aria-pressed={key === shownKey}
              className={styles.chip}
              onClick={() => onPick(key)}
            >
              <TradeIcon trade={key} className={styles.chipIcon} />
              {trades[key].short}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
