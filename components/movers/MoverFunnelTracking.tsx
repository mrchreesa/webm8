"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

const watchedSections = [
  { id: "pricing", event: "mover_pricing_viewed" },
  { id: "preview", event: "mover_preview_viewed" },
];

export function MoverFunnelTracking() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const element = (event.target as Element | null)?.closest<HTMLElement>(
        "[data-funnel-event]",
      );

      if (!element) return;

      trackEvent(element.dataset.funnelEvent || "mover_cta_clicked", {
        location: element.dataset.funnelLocation || "unknown",
      });
    };

    document.addEventListener("click", onClick);

    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || seen.has(entry.target.id)) return;

          const section = watchedSections.find(
            (item) => item.id === entry.target.id,
          );
          if (!section) return;

          seen.add(section.id);
          trackEvent(section.event, { section: section.id });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 },
    );

    watchedSections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      document.removeEventListener("click", onClick);
      observer.disconnect();
    };
  }, []);

  return null;
}
