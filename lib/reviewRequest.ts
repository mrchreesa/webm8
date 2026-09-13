/** Server-side validation for the movers personalized-preview intake. */

import {
  isBillingCycle,
  isMoverPlanId,
  moverServiceValues,
  type BillingCycle,
  type MoverPlanId,
  type MoverService,
} from "./movers.ts";

export type PreviewRequestFields = {
  contactName: string;
  companyName: string;
  email: string;
  phone: string | null;
  mainCityState: string;
  services: MoverService[];
  businessLink: string | null;
  submissionKey: string;
  plan: MoverPlanId | null;
  billing: BillingCycle;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrer: string | null;
  pagePath: string | null;
};

export type ValidationResult =
  | { ok: true; value: PreviewRequestFields }
  | { ok: false; errors: Record<string, string> };

const MIN_ELAPSED_MS = 1500;

const MAX_LENGTHS = {
  contactName: 120,
  companyName: 200,
  email: 254,
  phone: 40,
  mainCityState: 160,
  businessLink: 500,
  attribution: 300,
} as const;

export function validateReviewRequest(input: unknown): ValidationResult {
  const raw = (input ?? {}) as Record<string, unknown>;

  if (text(raw.companyWebsiteHp)) {
    return { ok: false, errors: { form: "That request could not be accepted." } };
  }
  const elapsed = Number(raw.elapsedMs);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < MIN_ELAPSED_MS) {
    return { ok: false, errors: { form: "That request could not be accepted." } };
  }

  const errors: Record<string, string> = {};

  const contactName = cap(text(raw.contactName), MAX_LENGTHS.contactName);
  if (!contactName) errors.contactName = "Enter your full name.";

  const companyName = cap(text(raw.companyName), MAX_LENGTHS.companyName);
  if (!companyName) errors.companyName = "Enter your moving company name.";

  const email = cap(text(raw.email), MAX_LENGTHS.email).toLowerCase();
  if (!email) errors.email = "Enter your email address.";
  else if (!isEmail(email)) errors.email = "Enter a valid email address.";

  const phoneValue = cap(text(raw.phone), MAX_LENGTHS.phone);
  const phone = phoneValue || null;
  if (phone && countDigits(phone) < 7) {
    errors.phone = "Enter a valid phone number or leave this blank.";
  }

  const mainCityState = cap(
    text(raw.mainCityState),
    MAX_LENGTHS.mainCityState,
  );
  if (!mainCityState) errors.mainCityState = "Enter your main city and state.";

  const services = uniqueStrings(raw.services).filter(
    (service): service is MoverService =>
      moverServiceValues.includes(service as MoverService),
  );
  if (services.length === 0) {
    errors.services = "Select at least one service.";
  }

  const rawBusinessLink = cap(
    text(raw.businessLink),
    MAX_LENGTHS.businessLink,
  );
  const businessLink = normalizeBusinessLink(rawBusinessLink);
  if (rawBusinessLink && !businessLink) {
    errors.businessLink =
      "Enter a valid website, Google Maps, Facebook, or Instagram link.";
  }

  const submissionKey = text(raw.submissionKey).toLowerCase();
  if (!isUuid(submissionKey)) {
    errors.form = "Please refresh the page and try again.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      contactName,
      companyName,
      email,
      phone,
      mainCityState,
      services,
      businessLink,
      submissionKey,
      plan: isMoverPlanId(raw.plan) ? raw.plan : null,
      billing: isBillingCycle(raw.billing) ? raw.billing : "monthly",
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

export function normalizeBusinessLink(value: string) {
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(withScheme);
    if (!url.hostname.includes(".")) return null;
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    return cap(url.toString().replace(/\/$/, ""), MAX_LENGTHS.businessLink);
  } catch {
    return null;
  }
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function uniqueStrings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(value.filter((item): item is string => typeof item === "string")),
  ];
}

function cap(value: string, max: number) {
  return value.length > max ? value.slice(0, max) : value;
}

function attribution(value: unknown) {
  const trimmed = cap(text(value), MAX_LENGTHS.attribution);
  return trimmed || null;
}

function countDigits(value: string) {
  return [...value].filter((character) => /[0-9]/.test(character)).length;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
    value,
  );
}
