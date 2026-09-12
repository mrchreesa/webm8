/**
 * Validation for a free 10-minute review request.
 *
 * Runs on the server, in the route handler, before anything is written and
 * before the browser is ever told the request succeeded. The browser runs its
 * own lighter check for helpful inline messages; this one is the authority.
 */

import {
  isBillingCycle,
  isMoverPlanId,
  type BillingCycle,
  type MoverPlanId,
} from "./movers.ts";

export type ReviewRequestFields = {
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  websiteUrl: string | null;
  hasWebsite: boolean;
  plan: MoverPlanId | null;
  billing: BillingCycle | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrer: string | null;
  pagePath: string | null;
};

export type ValidationResult =
  | { ok: true; value: ReviewRequestFields }
  | { ok: false; errors: Record<string, string> };

/** Shortest time a person plausibly takes to fill in five fields. */
const MIN_ELAPSED_MS = 1500;

const MAX_LENGTHS = {
  contactName: 120,
  companyName: 200,
  email: 254,
  phone: 40,
  websiteUrl: 300,
  attribution: 200,
} as const;

export function validateReviewRequest(input: unknown): ValidationResult {
  const raw = (input ?? {}) as Record<string, unknown>;

  // Bot traps. These are never shown to a person, so they get one flat error
  // rather than a field message.
  if (text(raw.companyWebsiteHp)) {
    return { ok: false, errors: { form: "That request could not be accepted." } };
  }
  const elapsed = Number(raw.elapsedMs);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < MIN_ELAPSED_MS) {
    return { ok: false, errors: { form: "That request could not be accepted." } };
  }

  const errors: Record<string, string> = {};

  const contactName = cap(text(raw.contactName), MAX_LENGTHS.contactName);
  if (!contactName) errors.contactName = "Tell us your name.";

  const companyName = cap(text(raw.companyName), MAX_LENGTHS.companyName);
  if (!companyName) errors.companyName = "Tell us the moving company's name.";

  const email = cap(text(raw.email), MAX_LENGTHS.email).toLowerCase();
  if (!email) errors.email = "We need an email address to send the details to.";
  else if (!isEmail(email)) errors.email = "Check that email address.";

  const phone = cap(text(raw.phone), MAX_LENGTHS.phone);
  if (!phone) errors.phone = "We need a number to call you back on.";
  else if (countDigits(phone) < 7) errors.phone = "Check that phone number.";

  // An unchecked box, a missing key, or anything other than an explicit false
  // means the company does have a website.
  const hasWebsite = !isFalse(raw.hasWebsite);
  const websiteUrl = hasWebsite
    ? normalizeUrl(cap(text(raw.websiteUrl), MAX_LENGTHS.websiteUrl))
    : null;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      contactName,
      companyName,
      email,
      phone,
      websiteUrl,
      hasWebsite,
      plan: isMoverPlanId(raw.plan) ? raw.plan : null,
      billing: isBillingCycle(raw.billing) ? raw.billing : null,
      utmSource: attribution(raw.utmSource),
      utmMedium: attribution(raw.utmMedium),
      utmCampaign: attribution(raw.utmCampaign),
      utmContent: attribution(raw.utmContent),
      utmTerm: attribution(raw.utmTerm),
      referrer: attribution(raw.referrer),
      pagePath: attribution(raw.pagePath),
    },
  };
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cap(value: string, max: number) {
  return value.length > max ? value.slice(0, max) : value;
}

function attribution(value: unknown) {
  const trimmed = cap(text(value), MAX_LENGTHS.attribution);
  return trimmed || null;
}

function isFalse(value: unknown) {
  return value === false || value === "false" || value === "0";
}

function countDigits(value: string) {
  let digits = 0;
  for (const character of value) if (character >= "0" && character <= "9") digits += 1;
  return digits;
}

function isEmail(value: string) {
  // Deliberately permissive: reject the obviously wrong, accept the unusual.
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value);
}

function normalizeUrl(value: string) {
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (!url.hostname.includes(".")) return null;
    return cap(url.toString().replace(/\/$/, ""), MAX_LENGTHS.websiteUrl);
  } catch {
    return null;
  }
}
