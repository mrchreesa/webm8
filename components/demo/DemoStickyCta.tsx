"use client";

import type { RefObject } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import styles from "./demo.module.css";

const isTyping = () => {
  const element = document.activeElement;
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement;
};

/**
 * Phones only. Once the visitor has scrolled past the form, a button brings
 * them back up to it. Above the form, the hero's own button leads down to
 * it, so this stays hidden there. It hides while they are typing, so it never
 * sits on the keyboard, and for good once the request is saved.
 */
export function DemoStickyCta({ formRef, done }: { formRef: RefObject<HTMLElement | null>; done: boolean }) {
  const [passed, setPassed] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const observer = new IntersectionObserver(([entry]) =>
      setPassed(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    observer.observe(form);

    const sync = () => setTyping(isTyping());
    document.addEventListener("focusin", sync);
    document.addEventListener("focusout", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", sync);
      document.removeEventListener("focusout", sync);
    };
  }, [formRef]);

  if (done || !passed || typing) return null;

  function onClick() {
    const form = formRef.current;
    if (!form) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    form.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
    form.querySelector<HTMLElement>("[data-demo-focus]")?.focus({ preventScroll: true });
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
      Get my free demo
      <span aria-hidden>↑</span>
    </button>
  );
}
