"use client";

import type { RefObject } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import styles from "./demo.module.css";

const isTyping = () => {
  const element = document.activeElement;
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
};

/**
 * Phones only. Once the journey card has scrolled away, a button brings the
 * visitor back to the step they were on. It hides while they are typing, so
 * it never sits on the keyboard, and for good once the request is saved.
 */
export function DemoStickyCta({
  cardRef,
  started,
  done,
}: {
  cardRef: RefObject<HTMLDivElement | null>;
  started: boolean;
  done: boolean;
}) {
  const [cardVisible, setCardVisible] = useState(true);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new IntersectionObserver(([entry]) => setCardVisible(entry.isIntersecting));
    observer.observe(card);

    const sync = () => setTyping(isTyping());
    document.addEventListener("focusin", sync);
    document.addEventListener("focusout", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", sync);
      document.removeEventListener("focusout", sync);
    };
  }, [cardRef, done]);

  if (done || cardVisible || typing) return null;

  function onClick() {
    const card = cardRef.current;
    if (!card) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
    card.querySelector<HTMLElement>("[data-demo-legend]")?.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        styles.sticky,
        "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-base font-semibold whitespace-nowrap text-brand-ink shadow-[0_14px_40px_-10px_rgb(212_255_53/0.6),0_8px_24px_-8px_rgb(0_0_0/0.5)] md:hidden",
      )}
    >
      {started ? "Continue my demo" : "Get my free demo"}
      <span aria-hidden>↑</span>
    </button>
  );
}
