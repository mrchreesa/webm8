"use client";

import { useEffect, useId, useRef } from "react";
import { BUSINESS_NAME_MAX, heroTradeOrder, trades, type TradeKey } from "@/lib/trades";
import { TradeIcon } from "./TradeIcon";
import styles from "./story.module.css";

const CHIPS: readonly TradeKey[] = [...heroTradeOrder, "other"];

type TradeChipsProps = {
  /** The trade on the phone right now. */
  shownKey: TradeKey;
  /** True once the visitor picked a trade; the story then stays on it. */
  chosen: boolean;
  business: string;
  onPick: (key: TradeKey) => void;
  onBusinessChange: (value: string) => void;
};

/**
 * Every trade the story covers. While the story moves through them the
 * playing one is lit; picking one keeps the story on it and offers the
 * business name field.
 */
export function TradeChips({ shownKey, chosen, business, onPick, onBusinessChange }: TradeChipsProps) {
  const labelId = useId();
  const nameId = useId();
  const hintId = useId();
  const listRef = useRef<HTMLDivElement>(null);

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
        See it for your trade
      </p>
      <div ref={listRef} role="group" aria-labelledby={labelId} data-story="chips" className={styles.chips}>
        {CHIPS.map((key) => (
          <button
            key={key}
            type="button"
            data-trade={key}
            data-live={!chosen && key === shownKey ? "" : undefined}
            aria-pressed={chosen && key === shownKey}
            className={styles.chip}
            onClick={() => onPick(key)}
          >
            <TradeIcon trade={key} className={styles.chipIcon} />
            {trades[key].short}
          </button>
        ))}
      </div>
      {chosen ? (
        <div className={styles.nameBlock}>
          <label htmlFor={nameId} className="text-sm text-muted-invert">
            Your business name <span className="opacity-75">(optional)</span>
          </label>
          <input
            id={nameId}
            type="text"
            value={business}
            onChange={(event) => onBusinessChange(event.target.value)}
            maxLength={BUSINESS_NAME_MAX}
            autoComplete="organization"
            placeholder={`e.g. ${trades[shownKey].exampleName}`}
            aria-describedby={hintId}
            className={styles.nameInput}
          />
          <p id={hintId} className={styles.pickerHint}>
            This stays in your browser until you ask for your demo.
          </p>
        </div>
      ) : null}
    </div>
  );
}
