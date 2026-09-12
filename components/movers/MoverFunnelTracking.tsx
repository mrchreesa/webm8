"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

const watchedSections = [
  { id: "how-it-works", event: "mover_demo_viewed" },
  { id: "pricing", event: "mover_pricing_viewed" },
  { id: "review-request", event: "mover_review_form_viewed" },
];

/**
 * Funnel instrumentation for /movers/.
 *
 * Every event here is a step, never a completion: a click-to-call is a click,
 * not a phone call, and a calendar click is not a booking. The only completion
 * events are fired elsewhere, after the server accepts a request and after
 * Cal.com confirms a booking.
 */
export function MoverFunnelTracking() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    trackEvent("mover_landing_viewed", {
      utm_source: params.get("utm_source") || "direct",
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_content: params.get("utm_content"),
    });

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;

      const phone = target?.closest<HTMLAnchorElement>('a[href^="tel:"]');
      if (phone) {
        trackEvent("mover_call_link_clicked", {
          location: phone.dataset.funnelLocation || "unknown",
        });
        return;
      }

      const element = target?.closest<HTMLElement>("[data-funnel-event]");
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
