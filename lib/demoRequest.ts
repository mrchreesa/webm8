/**
 * The Free Personalised Website Demo request. Validation and the email draft
 * for /demo/, and the small handover that carries a visitor's trade and
 * business name from the homepage to the form (sessionStorage, never a URL).
 */

import {
  capitalise,
  cleanBusinessName,
  parseTrade,
  trades,
  type TradeKey,
} from "./trades.ts";

export type DemoRequestInput = {
  business: string;
  trade: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  website: string;
  goal: string;
};

export type DemoRequestField = keyof DemoRequestInput;

export type DemoRequest = Omit<DemoRequestInput, "trade"> & { trade: TradeKey };

export type DemoRequestResult =
  | { ok: true; request: DemoRequest }
  | { ok: false; errors: Partial<Record<DemoRequestField, string>> };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const tidy = (value: string) => value.replace(/\s+/g, " ").trim();

export function validateDemoRequest(input: DemoRequestInput): DemoRequestResult {
  const value = {
    business: tidy(input.business),
    name: tidy(input.name),
    email: input.email.trim(),
    phone: tidy(input.phone),
    area: tidy(input.area),
    website: input.website.trim(),
    goal: input.goal.trim(),
  };
  const trade = parseTrade(input.trade);
  const errors: Partial<Record<DemoRequestField, string>> = {};

  if (!value.business) errors.business = "Add your business name.";
  if (!trade) errors.trade = "Choose the kind of business you run.";
  if (!value.name) errors.name = "Add your name.";
  if (!value.email) errors.email = "Add your email address.";
  else if (!EMAIL_PATTERN.test(value.email)) errors.email = "Check your email address. It should look like name@example.com.";
  if (!value.area) errors.area = "Add your city or the area you serve.";

  if (!trade || Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, request: { ...value, trade } };
}

export function demoRequestSubject(request: DemoRequest): string {
  return `Website demo request from ${request.business}`;
}

/** Ordered fields for buildMailtoHref, which drops the empty ones. */
export function demoRequestMailFields(request: DemoRequest): Record<string, string> {
  return {
    Business: request.business,
    "Type of business": capitalise(trades[request.trade].label),
    Name: request.name,
    Email: request.email,
    Phone: request.phone,
    "City or service area": request.area,
    "Current website": request.website,
    "Wants more of": request.goal,
    Source: "WebM8 marketing site, /demo",
  };
}

export const DEMO_PREFILL_KEY = "webm8:demo-prefill";

export type DemoPrefill = { trade: TradeKey | null; business: string };

export const emptyDemoPrefill: DemoPrefill = { trade: null, business: "" };

export function parseDemoPrefill(raw: string | null | undefined): DemoPrefill {
  if (!raw) return { ...emptyDemoPrefill };
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return { ...emptyDemoPrefill };
    const record = data as Record<string, unknown>;
    return {
      trade: typeof record.trade === "string" ? parseTrade(record.trade) : null,
      business: typeof record.business === "string" ? cleanBusinessName(record.business) : "",
    };
  } catch {
    return { ...emptyDemoPrefill };
  }
}

export function serializeDemoPrefill(prefill: DemoPrefill): string {
  return JSON.stringify({ trade: prefill.trade, business: cleanBusinessName(prefill.business) });
}

function sessionStore(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readDemoPrefill(storage: Pick<Storage, "getItem"> | null = sessionStore()): DemoPrefill {
  if (!storage) return { ...emptyDemoPrefill };
  try {
    return parseDemoPrefill(storage.getItem(DEMO_PREFILL_KEY));
  } catch {
    return { ...emptyDemoPrefill };
  }
}

export function writeDemoPrefill(prefill: DemoPrefill, storage: Pick<Storage, "setItem"> | null = sessionStore()): void {
  if (!storage) return;
  try {
    storage.setItem(DEMO_PREFILL_KEY, serializeDemoPrefill(prefill));
  } catch {
    // Storage can be full or blocked (private browsing). The form then starts empty.
  }
}

/** The trade for /demo/: a valid ?trade= wins over what the homepage stored. */
export function resolveDemoTrade(search: string, stored: DemoPrefill): TradeKey | null {
  return parseTrade(new URLSearchParams(search).get("trade")) ?? stored.trade;
}
