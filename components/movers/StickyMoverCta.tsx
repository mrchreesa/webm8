"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Mobile-only shortcut back to the request form.
 *
 * It hides itself once the form section is on screen, so it can never sit on
 * top of the fields a visitor is trying to fill in.
 */
export function StickyMoverCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById("review-request");

    let formInView = false;
    let scrolledPastHero = false;

    const apply = () => setVisible(scrolledPastHero && !formInView);

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        scrolledPastHero =
          window.scrollY > Math.min(720, window.innerHeight * 0.9);
        apply();
        frame = 0;
      });
    };

    const observer = target
      ? new IntersectionObserver(
          ([entry]) => {
            formInView = entry.isIntersecting;
            apply();
          },
          { rootMargin: "0px 0px -20% 0px" },
        )
      : null;

    if (target && observer) observer.observe(target);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer?.disconnect();
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-4 bottom-4 z-40 transition-all duration-300 md:hidden",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0",
      )}
      aria-hidden={!visible}
    >
      <Link
        href="#review-request"
        tabIndex={visible ? undefined : -1}
        data-funnel-event="mover_cta_clicked"
        data-funnel-location="mobile_sticky"
        className="flex min-h-12 items-center justify-center rounded-full bg-brand px-5 text-sm font-bold text-white shadow-cta"
      >
        Book my free 10-minute review
      </Link>
    </div>
  );
}
