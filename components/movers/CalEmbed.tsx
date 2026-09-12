"use client";

import { useEffect, useId, useRef, useState } from "react";

type CalApi = ((...args: unknown[]) => void) & {
  ns?: Record<string, (...args: unknown[]) => void>;
  loaded?: boolean;
  q?: unknown[];
};

declare global {
  interface Window {
    Cal?: CalApi;
  }
}

const EMBED_SCRIPT = "https://app.cal.com/embed/embed.js";
const NAMESPACE = "review";

/**
 * Inline Cal.com booking calendar.
 *
 * The caller always renders a plain booking link as well, so a visitor whose
 * browser blocks this script — Meta's in-app browser, an ad blocker — still has
 * a working way to book. This component only ever adds the richer option.
 */
export function CalEmbed({
  calLink,
  name,
  email,
  onBookingConfirmed,
}: {
  calLink: string;
  name?: string;
  email?: string;
  onBookingConfirmed?: () => void;
}) {
  const containerId = useId().replace(/:/g, "");
  const [failed, setFailed] = useState(false);
  const confirmed = useRef(false);

  useEffect(() => {
    let cancelled = false;

    function loadScript() {
      return new Promise<void>((resolve, reject) => {
        if (window.Cal) return resolve();

        const existing = document.querySelector<HTMLScriptElement>(
          `script[src="${EMBED_SCRIPT}"]`,
        );
        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener("error", () => reject(), { once: true });
          return;
        }

        // Minimal stand-in for Cal's own loader: queue calls until the real
        // script replaces it.
        const api = function (...args: unknown[]) {
          (api.q ||= []).push(args);
        } as CalApi;
        api.q = [];
        window.Cal = api;

        const script = document.createElement("script");
        script.src = EMBED_SCRIPT;
        script.async = true;
        script.addEventListener("load", () => resolve(), { once: true });
        script.addEventListener("error", () => reject(), { once: true });
        document.head.appendChild(script);
      });
    }

    loadScript()
      .then(() => {
        if (cancelled) return;
        const Cal = window.Cal;
        if (!Cal) {
          setFailed(true);
          return;
        }

        Cal("init", NAMESPACE, { origin: "https://app.cal.com" });
        const ns = Cal.ns?.[NAMESPACE];
        if (!ns) {
          setFailed(true);
          return;
        }

        ns("inline", {
          elementOrSelector: `#${containerId}`,
          calLink,
          config: {
            layout: "month_view",
            ...(name ? { name } : {}),
            ...(email ? { email } : {}),
          },
        });

        ns("ui", { hideEventTypeDetails: false, layout: "month_view" });

        if (onBookingConfirmed) {
          ns("on", {
            action: "bookingSuccessful",
            callback: () => {
              if (confirmed.current) return;
              confirmed.current = true;
              onBookingConfirmed();
            },
          });
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [calLink, containerId, email, name, onBookingConfirmed]);

  if (failed) return null;

  return (
    <div
      id={containerId}
      className="min-h-[28rem] w-full overflow-hidden rounded-2xl border border-border bg-white"
    />
  );
}
