"use client";

import { useEffect, useId, useState } from "react";

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
 * Cal.com's official loader, transcribed from their embed snippet.
 *
 * It has to be this shape: embed.js reads `Cal.ns` and `Cal.q` off the global
 * it finds and throws if they are missing, so a simpler stub breaks the embed.
 */
function installCalLoader() {
  if (window.Cal) return window.Cal;

  const queue = (api: CalApi, args: IArguments | unknown[]) => {
    (api.q ||= []).push(args);
  };

  const cal = function (...args: unknown[]) {
    const self = window.Cal as CalApi;

    if (!self.loaded) {
      self.ns = {};
      self.q = self.q || [];
      const script = document.createElement("script");
      script.src = EMBED_SCRIPT;
      document.head.appendChild(script);
      self.loaded = true;
    }

    if (args[0] === "init") {
      const namespace = args[1];
      if (typeof namespace === "string") {
        const api = function (...inner: unknown[]) {
          queue(api as CalApi, inner);
        } as CalApi;
        api.q = api.q || [];
        self.ns![namespace] = self.ns![namespace] || api;
        queue(self.ns![namespace] as CalApi, args);
        queue(self, ["initNamespace", namespace]);
      } else {
        queue(self, args);
      }
      return;
    }

    queue(self, args);
  } as CalApi;

  window.Cal = cal;
  return cal;
}

/**
 * Inline Cal.com booking calendar.
 *
 * The caller always renders a plain booking link as well, so a visitor whose
 * browser blocks this script — Meta's in-app browser, an ad blocker — still has
 * a working way to book. This component only ever adds the richer option, and
 * removes itself if the calendar never renders.
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
  const containerId = `cal-${useId().replace(/:/g, "")}`;
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const Cal = installCalLoader();

    Cal("init", NAMESPACE, { origin: "https://app.cal.com" });
    const ns = Cal.ns?.[NAMESPACE];
    if (!ns) {
      setHidden(true);
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
      let confirmed = false;
      ns("on", {
        action: "bookingSuccessful",
        callback: () => {
          if (confirmed) return;
          confirmed = true;
          onBookingConfirmed();
        },
      });
    }

    // If the script is blocked the container stays empty. Rather than leave a
    // blank panel under the booking link, take it away.
    const timer = window.setTimeout(() => {
      const container = document.getElementById(containerId);
      if (container && container.childElementCount === 0) setHidden(true);
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [calLink, containerId, email, name, onBookingConfirmed]);

  if (hidden) return null;

  return (
    <div
      id={containerId}
      className="min-h-[28rem] w-full overflow-hidden rounded-2xl border border-border bg-white"
    />
  );
}
