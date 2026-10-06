/**
 * The Free Personalised Website Demo request on /demo/. The form checks each
 * step with validateDemoStep before moving on; /api/demo-request/ checks the
 * whole submission with validateDemoSubmission before saving it.
 */

import { cleanAttribution, type Attribution } from "./leadAttribution.ts";
import { parseTrade, type TradeKey } from "./trades.ts";

export type DemoAnswers = {
  trade: string;
  /** What the business does, when trade is "other". */
  tradeOther: string;
  business: string;
  area: string;
  /** Optional: their website, Google profile or Facebook page. */
  link: string;
  name: string;
  phone: string;
  email: string;
};

export type DemoField = keyof DemoAnswers;

export type DemoErrors = Partial<Record<DemoField, string>>;

export const emptyDemoAnswers: DemoAnswers = {
  trade: "",
  tradeOther: "",
  business: "",
  area: "",
  link: "",
  name: "",
  phone: "",
  email: "",
};

export type DemoStep = 1 | 2 | 3 | 4;

export const demoStepCount = 4;

export const demoStepFields: Record<DemoStep, DemoField[]> = {
  1: ["trade", "tradeOther"],
  2: ["business"],
  3: ["area", "link"],
  4: ["name", "phone", "email"],
};

export const demoLimits = {
  tradeOther: 80,
  business: 120,
  area: 120,
  link: 500,
  name: 120,
  phone: 40,
  email: 254,
} as const;

/** A request that passed validation, tidied and ready to save. */
export type DemoRequest = {
  trade: TradeKey;
  tradeOther: string | null;
  business: string;
  area: string;
  link: string | null;
  name: string;
  phone: string;
  email: string;
};

export type DemoSubmission = DemoRequest & {
  submissionKey: string;
  attribution: Attribution;
  referrer: string | null;
  pagePath: string | null;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[\d\s().-]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NOT_OWN_SITE = /(facebook\.com|fb\.com|instagram\.com|maps\.app\.goo\.gl|g\.page|google\.[^/]+\/maps)/i;

/** Faster than this from first step to submit is a script, not a person. */
const MIN_ELAPSED_MS = 1500;

const tidy = (value: string) => value.replace(/\s+/g, " ").trim();

const tooLong = (limit: number) => `Keep this under ${limit} characters.`;

/** The link with https:// added when it has no scheme, "" when empty, or null when it is not a web address. */
export function normaliseLink(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/\s/.test(trimmed)) return null;
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** True when the link is the business's own site rather than a social page or a map listing. */
export function hasOwnWebsite(link: string | null): boolean {
  return Boolean(link && !NOT_OWN_SITE.test(link));
}

export function firstNameOf(name: string): string {
  return tidy(name).split(" ")[0] ?? "";
}

function checkField(field: DemoField, answers: DemoAnswers): string | undefined {
  switch (field) {
    case "trade":
      return parseTrade(answers.trade) ? undefined : "Choose the kind of business you run.";
    case "tradeOther": {
      if (answers.trade !== "other") return undefined;
      const value = tidy(answers.tradeOther);
      if (!value) return "Tell us what your business does.";
      return value.length > demoLimits.tradeOther ? tooLong(demoLimits.tradeOther) : undefined;
    }
    case "business": {
      const value = tidy(answers.business);
      if (!value) return "Add your business name.";
      return value.length > demoLimits.business ? tooLong(demoLimits.business) : undefined;
    }
    case "area": {
      const value = tidy(answers.area);
      if (!value) return "Add the town, city or area you work in.";
      return value.length > demoLimits.area ? tooLong(demoLimits.area) : undefined;
    }
    case "link": {
      if (answers.link.trim().length > demoLimits.link) return tooLong(demoLimits.link);
      return normaliseLink(answers.link) === null
        ? "That link doesn't look right. Check it, or leave it empty."
        : undefined;
    }
    case "name": {
      const value = tidy(answers.name);
      if (!value) return "Add your name.";
      return value.length > demoLimits.name ? tooLong(demoLimits.name) : undefined;
    }
    case "phone": {
      const value = tidy(answers.phone);
      if (!value) return "Add a phone number so we can call you.";
      const digits = value.replace(/\D/g, "").length;
      if (value.length > demoLimits.phone || !PHONE_PATTERN.test(value) || digits < 7 || digits > 15) {
        return "Check your phone number, including the area code.";
      }
      return undefined;
    }
    case "email": {
      const value = answers.email.trim();
      if (!value) return "Add your email address.";
      if (value.length > demoLimits.email || !EMAIL_PATTERN.test(value)) {
        return "Check your email address. It should look like name@example.com.";
      }
      return undefined;
    }
  }
}

function check(fields: DemoField[], answers: DemoAnswers): DemoErrors {
  const errors: DemoErrors = {};
  for (const field of fields) {
    const error = checkField(field, answers);
    if (error) errors[field] = error;
  }
  return errors;
}

/** Errors for one step's fields only. Empty when the step can move on. */
export function validateDemoStep(step: DemoStep, answers: DemoAnswers): DemoErrors {
  return check(demoStepFields[step], answers);
}

export function validateDemoAnswers(
  answers: DemoAnswers,
): { ok: true; request: DemoRequest } | { ok: false; errors: DemoErrors } {
  const errors = check(Object.keys(emptyDemoAnswers) as DemoField[], answers);
  const trade = parseTrade(answers.trade);
  if (!trade || Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    request: {
      trade,
      tradeOther: trade === "other" ? tidy(answers.tradeOther) : null,
      business: tidy(answers.business),
      area: tidy(answers.area),
      link: normaliseLink(answers.link) || null,
      name: tidy(answers.name),
      phone: tidy(answers.phone),
      email: answers.email.trim(),
    },
  };
}

const text = (value: unknown) => (typeof value === "string" ? value : "");

/** The whole submission, as /api/demo-request/ receives it from the form. */
export function validateDemoSubmission(
  input: unknown,
): { ok: true; value: DemoSubmission } | { ok: false; errors: DemoErrors & { form?: string } } {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;

  const elapsed = Number(raw.elapsedMs);
  if (text(raw.website_hp) || (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < MIN_ELAPSED_MS)) {
    return { ok: false, errors: { form: "That request could not be accepted." } };
  }

  const answers = Object.fromEntries(
    (Object.keys(emptyDemoAnswers) as DemoField[]).map((field) => [field, text(raw[field])]),
  ) as DemoAnswers;
  const result = validateDemoAnswers(answers);
  if (!result.ok) return result;

  const submissionKey = text(raw.submissionKey);
  if (!UUID_PATTERN.test(submissionKey)) {
    return { ok: false, errors: { form: "That request could not be read. Reload the page and try again." } };
  }

  const referrer = text(raw.referrer).trim().slice(0, 300) || null;
  const path = text(raw.pagePath).trim();
  const pagePath = path.startsWith("/") && !path.startsWith("//") ? path.slice(0, 200) : null;

  return {
    ok: true,
    value: {
      ...result.request,
      submissionKey,
      attribution: cleanAttribution(raw.attribution),
      referrer,
      pagePath,
    },
  };
}
