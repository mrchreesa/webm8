/**
 * Campaign attribution for /thank-you/, the page Meta Instant Form leads land
 * on after they have already submitted. Only campaign and ad identifiers are
 * kept. Names, email addresses and phone numbers stay in the lead form, so
 * nothing here can carry one into analytics.
 */

export const attributionKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  // Meta's dynamic URL parameters, e.g. ad_id={{ad.id}}.
  "campaign_id",
  "adset_id",
  "ad_id",
  "placement",
  "site_source_name",
] as const;

export type AttributionKey = (typeof attributionKeys)[number];

export type Attribution = Partial<Record<AttributionKey, string>> & {
  /**
   * Meta adds fbclid to outbound clicks. Its value is left to the Pixel, which
   * keeps it in the _fbc cookie for the Conversions API to match on later.
   */
  has_fbclid?: boolean;
};

const maxValueLength = 100;

export function readAttribution(search: string): Attribution {
  const params = new URLSearchParams(search);
  return collect((key) => params.get(key), Boolean(params.get("fbclid")));
}

/** A fresh landing replaces stored attribution whole, so two campaigns never mix. */
export function pickAttribution(
  fromUrl: Attribution,
  stored: Attribution | null,
): Attribution {
  return Object.keys(fromUrl).length > 0 ? fromUrl : stored ?? {};
}

export function parseStoredAttribution(raw: string | null): Attribution | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  return cleanAttribution(parsed);
}

/** Attribution sent from a browser, kept only where it passes the same rules as the URL. */
export function cleanAttribution(value: unknown): Attribution {
  if (!value || typeof value !== "object") return {};
  const record = value as Record<string, unknown>;
  return collect(
    (key) => (typeof record[key] === "string" ? (record[key] as string) : null),
    record.has_fbclid === true,
  );
}

export const attributionStorageKey = "webm8:lead-attribution";

/**
 * Browser only. This visit's attribution: the URL's when it has any, or else
 * what an earlier page of the visit stored. Kept for the rest of the session.
 */
export function rememberAttribution(): Attribution {
  let stored: Attribution | null = null;
  try {
    stored = parseStoredAttribution(window.sessionStorage.getItem(attributionStorageKey));
  } catch {
    // Storage can be blocked; the URL is then the only source.
  }
  const attribution = pickAttribution(readAttribution(window.location.search), stored);
  try {
    window.sessionStorage.setItem(attributionStorageKey, JSON.stringify(attribution));
  } catch {
    // Private browsing can refuse storage; attribution then lasts this page view.
  }
  return attribution;
}

/** Carries the utm_* values to the booking page, so a booking can be traced to its campaign. */
export function withUtm(url: string, attribution: Attribution): string {
  const target = new URL(url);
  for (const key of attributionKeys) {
    const value = attribution[key];
    if (key.startsWith("utm_") && value) target.searchParams.set(key, value);
  }
  return target.toString();
}

/** A wa.me link with a message ready to send, or null when no number is configured. */
export function whatsappHref(number: string, message: string): string | null {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function collect(
  get: (key: AttributionKey) => string | null,
  hasFbclid: boolean,
): Attribution {
  const attribution: Attribution = {};
  for (const key of attributionKeys) {
    const value = cleanValue(get(key));
    if (value) attribution[key] = value;
  }
  if (hasFbclid) attribution.has_fbclid = true;
  return attribution;
}

function cleanValue(raw: string | null) {
  const value = raw?.trim();
  if (!value) return null;
  // A macro Meta did not expand ("{{ad.id}}") says nothing.
  if (value.includes("{{")) return null;
  // No campaign value contains an email address, so refuse anything that might be one.
  if (value.includes("@")) return null;
  return value.slice(0, maxValueLength);
}
