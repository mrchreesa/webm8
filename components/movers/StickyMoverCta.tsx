"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function StickyMoverCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setVisible(window.scrollY > Math.min(720, window.innerHeight * 0.85));
        frame = 0;
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
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
    >
      <Link
        href="#preview"
        data-funnel-event="mover_cta_clicked"
        data-funnel-location="mobile_sticky"
        className="shadow-cta flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3.5 text-sm font-bold text-white"
      >
        See My Homepage Before I Pay
        <Icon name="arrow" size={17} />
      </Link>
    </div>
  );
}
