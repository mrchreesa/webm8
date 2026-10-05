"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  parseStoredAttribution,
  pickAttribution,
  readAttribution,
  withUtm,
  type Attribution,
} from "@/lib/leadAttribution";

const storageKey = "webm8:lead-attribution";

/**
 * Engagement tracking for /thank-you/.
 *
 * The visitor has already submitted a Meta Instant Form, and Meta counted that
 * lead there. Nothing on this page fires Meta's `Lead` event: every event is a
 * custom one, carrying campaign attribution and never personal details.
 *
 * Any element with `data-lead-event` is tracked on click, with its
 * `data-lead-placement`, `data-lead-example` and `data-lead-position`.
 */
export function ThankYouTracking() {
  const viewed = useRef(false);

  useEffect(() => {
    const attribution = pickAttribution(
      readAttribution(window.location.search),
      readStored(),
    );
    store(attribution);

    if (!viewed.current) {
      viewed.current = true;
      trackEvent("thank_you_page_view", attribution);
    }

    document
      .querySelectorAll<HTMLAnchorElement>('a[data-lead-event="booking_clicked"]')
      .forEach((link) => {
        link.href = withUtm(link.href, attribution);
      });

    const onClick = (event: MouseEvent) => {
      const element = (event.target as Element | null)?.closest<HTMLElement>(
        "[data-lead-event]",
      );
      if (!element?.dataset.leadEvent) return;

      trackEvent(element.dataset.leadEvent, {
        ...attribution,
        placement: element.dataset.leadPlacement,
        example: element.dataset.leadExample,
        position: element.dataset.leadPosition
          ? Number(element.dataset.leadPosition)
          : undefined,
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}

function readStored() {
  try {
    return parseStoredAttribution(window.sessionStorage.getItem(storageKey));
  } catch {
    return null;
  }
}

function store(attribution: Attribution) {
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(attribution));
  } catch {
    // Private browsing can refuse storage; attribution then lasts this page view.
  }
}
