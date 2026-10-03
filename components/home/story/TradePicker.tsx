"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BUSINESS_NAME_MAX, defaultTrade, parseTrade, tradeGroups, trades, type TradeKey } from "@/lib/trades";
import { ChevronDownIcon } from "./icons";
import styles from "./story.module.css";

type TradePickerProps = {
  tradeKey: TradeKey;
  business: string;
  onTradeChange: (key: TradeKey) => void;
  onBusinessChange: (value: string) => void;
};

/** "Show me how it works for my [trade]", plus an optional business name. */
export function TradePicker({ tradeKey, business, onTradeChange, onBusinessChange }: TradePickerProps) {
  const selectId = useId();
  const nameId = useId();
  const hintId = useId();
  const measureRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>();

  // Size the select to the chosen label so the sentence reads naturally.
  useEffect(() => {
    const update = () => {
      const measure = measureRef.current;
      if (measure) setWidth(Math.ceil(measure.offsetWidth) + 30);
    };
    update();
    void document.fonts?.ready.then(update);
  }, [tradeKey]);

  return (
    <div className={styles.picker}>
      <label htmlFor={selectId} className="block text-[1.02rem] leading-normal font-medium md:text-lg">
        Show me how it works for my{" "}
        <span className={styles.selectWrap}>
          <select
            id={selectId}
            value={tradeKey}
            onChange={(event) => onTradeChange(parseTrade(event.target.value) ?? defaultTrade)}
            className={styles.select}
            style={width ? { width } : undefined}
          >
            {tradeGroups.map(({ group, keys }) => (
              <optgroup key={group} label={group}>
                {keys.map((key) => (
                  <option key={key} value={key}>
                    {trades[key].label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDownIcon className={styles.chevron} />
          <span ref={measureRef} aria-hidden="true" className={styles.measure}>
            {trades[tradeKey].label}
          </span>
        </span>
      </label>
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
          placeholder="e.g. Reyes Plumbing"
          aria-describedby={hintId}
          className={styles.nameInput}
        />
      </div>
      <p id={hintId} className={styles.pickerHint}>
        This stays in your browser until you ask for your demo.
      </p>
    </div>
  );
}
