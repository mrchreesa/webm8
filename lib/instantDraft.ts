/** Draft snapshots deliberately exclude payment, consent, uploads and arbitrary keys. */
export const DRAFT_FIELDS: Record<string, { label: string; max: number; array?: boolean }> = {
  name: { label: "Name", max: 200 }, email: { label: "Email", max: 200 },
  deliveryPhone: { label: "Delivery phone / WhatsApp", max: 200 },
  businessName: { label: "Business name", max: 200 }, area: { label: "Service area", max: 200 },
  industry: { label: "Business type", max: 100 }, scope: { label: "Website type", max: 100 },
  features: { label: "Website features", max: 100, array: true },
  hasWebsite: { label: "Has a website", max: 20 }, website: { label: "Existing website", max: 1000 },
  links: { label: "Business links", max: 1000, array: true }, services: { label: "Services", max: 2000 },
  contacts: { label: "Website contact methods", max: 100, array: true }, phone: { label: "Public phone", max: 200 },
  whatsapp: { label: "Public WhatsApp", max: 200 }, enquiryEmail: { label: "Website enquiry email", max: 200 },
  bookingUrl: { label: "Booking link", max: 1000 }, difference: { label: "Business highlights", max: 2000 },
  colours: { label: "Design preferences", max: 200 }, notes: { label: "Additional notes", max: 2000 },
  address: { label: "Public address", max: 200 }, hours: { label: "Opening hours", max: 200 },
  menuUrl: { label: "Menu link", max: 1000 }, quoteDetails: { label: "Custom requirements", max: 2000 },
};
export type DraftAnswers = Record<string, string | string[] | boolean>;
const visitId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function validDraftVisitKey(key: unknown): key is string {
  return typeof key === "string" && key.length === 73 && key[36] === "/" &&
    visitId.test(key.slice(0, 36)) && visitId.test(key.slice(37));
}
export function draftVisitKey(context?: { siteId: string; visitorId: string; sessionId: string } | null) {
  if (context?.siteId !== "ea003967-7c28-47a1-a4a8-6b0b2713879c") return null;
  const key = `${context.visitorId}/${context.sessionId}`;
  return validDraftVisitKey(key) ? key : null;
}
export const DRAFT_STEPS = ["business", "checkout", "brief", "quote"] as const;
export function draftAnswers(input: unknown): DraftAnswers {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid draft");
  const source = input as Record<string, unknown>;
  const result: DraftAnswers = {};
  for (const [key, rule] of Object.entries(DRAFT_FIELDS)) {
    const value = source[key];
    if (rule.array) {
      if (Array.isArray(value)) result[key] = value.filter((v): v is string => typeof v === "string").slice(0, 6).map(v => v.slice(0, rule.max)).filter(v => v.trim());
    } else if (typeof value === "string" && value.trim()) result[key] = value.slice(0, rule.max);
  }
  for (const key of ["samePhone", "bookingLater"]) if (source[key] === true) result[key] = true;
  return result;
}
export function hasDraftContent(answers: DraftAnswers) {
  return Object.entries(answers).some(([key, value]) => key !== "scope" && (Array.isArray(value) ? value.length > 0 : value === true || (typeof value === "string" && value.trim().length > 0)));
}
