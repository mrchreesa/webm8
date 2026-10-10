"use client";

import { useEffect, useState } from "react";
import { cardOffset } from "@/lib/demoDeck";

/**
 * Mount images near the active card, including across the wrapping boundary.
 * Keep visited images mounted so returning to a card never restarts its load.
 * Nearby cards are eligible during render, without waiting for an effect.
 */
export function useDeckImages(active: number, count: number, radius: number, enabled = true) {
  const [requested, setRequested] = useState<ReadonlySet<number>>(() => new Set());

  useEffect(() => {
    if (!enabled) return;
    setRequested((previous) => {
      const next = new Set(previous);
      for (let index = 0; index < count; index++) {
        if (Math.abs(cardOffset(index, active, count)) <= radius) next.add(index);
      }
      return next.size === previous.size ? previous : next;
    });
  }, [active, count, radius, enabled]);

  return (index: number) =>
    requested.has(index) || (enabled && Math.abs(cardOffset(index, active, count)) <= radius);
}
