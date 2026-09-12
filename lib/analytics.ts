export type AnalyticsValue = string | number | boolean;

export type AnalyticsDetails = Record<
  string,
  AnalyticsValue | null | undefined
>;

declare global {
  interface Window {
    mixpanel?: {
      track: (name: string, details?: Record<string, AnalyticsValue>) => void;
    };
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    __webm8AnalyticsQueue?: Array<{
      name: string;
      details: Record<string, AnalyticsValue>;
    }>;
  }
}

/**
 * Send one useful business event to whichever analytics tools are configured.
 * Never pass names, email addresses, phone numbers, or form answers here.
 */
export function trackEvent(name: string, details: AnalyticsDetails = {}) {
  if (typeof window === "undefined") return;

  const safeName = name.trim().slice(0, 50);
  if (!safeName) return;

  const safeDetails = Object.fromEntries(
    Object.entries(details)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .slice(0, 50)
      .map(([key, value]) => [key.slice(0, 50), normalizeValue(value!)]),
  );

  if (window.mixpanel) {
    window.mixpanel.track(safeName, safeDetails);
  } else {
    const queue = (window.__webm8AnalyticsQueue ||= []);
    queue.push({ name: safeName, details: safeDetails });
    if (queue.length > 50) queue.shift();
  }
  window.gtag?.("event", safeName, safeDetails);

  window.fbq?.("trackCustom", safeName, safeDetails);
}

/**
 * Fire the Meta standard `Lead` event for one accepted review request.
 *
 * Only a request the server has accepted and recorded reaches this function,
 * and the request id guarantees it counts once even if the success panel
 * re-renders. A calendar click is not a booking and a click-to-call is not a
 * completed call, so neither of those ever reaches this path.
 */
export function trackAcceptedReviewRequest(
  requestId: string,
  details: AnalyticsDetails = {},
) {
  if (typeof window === "undefined" || !requestId) return;
  if (firedLeadRequestIds.has(requestId)) return;
  firedLeadRequestIds.add(requestId);

  trackEvent("mover_review_request_accepted", details);
  window.fbq?.("track", "Lead", {
    content_name: "Mover free 10-minute review",
  });
}

const firedLeadRequestIds = new Set<string>();

export function flushAnalyticsQueue() {
  if (typeof window === "undefined" || !window.mixpanel) return;

  const queue = window.__webm8AnalyticsQueue || [];
  window.__webm8AnalyticsQueue = [];
  queue.forEach(({ name, details }) => window.mixpanel?.track(name, details));
}

function normalizeValue(value: AnalyticsValue): AnalyticsValue {
  return typeof value === "string" ? value.slice(0, 500) : value;
}
