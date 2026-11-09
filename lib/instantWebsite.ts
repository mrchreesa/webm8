/** Product rules for the review-only Instant Websites journey. No payment state. */
export const INSTANT_PRICE = 39;
export const INSTANT_TRIAL_DAYS = 10;
export const DRAFT_KEY = "webm8:instant-preview:v1";
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export const industries = [
  { value: "trades", label: "Trades & home services", icon: "shield" },
  { value: "local", label: "Local services", icon: "map" },
  { value: "food", label: "Restaurants & cafés", icon: "trust" },
  { value: "beauty", label: "Beauty & aesthetics", icon: "spark" },
  { value: "other", label: "Something else", icon: "support" },
] as const;

export const features = [
  { value: "information", label: "Show services, prices or a menu", hint: "Give customers the essentials." },
  { value: "enquiries", label: "Get calls, messages & enquiries", hint: "Make it easy to get in touch." },
  { value: "requests", label: "Receive booking requests", hint: "Customers request a time. You confirm it." },
  { value: "booking", label: "Link to my booking service", hint: "Connect a service you already use." },
  { value: "commerce", label: "Sell products, take orders or payments", hint: "Needs a custom quote." },
  { value: "custom", label: "Multiple pages, logins or custom features", hint: "Needs a custom quote." },
] as const;

export const scopes = [
  { value: "standard", label: "A one-page business website", hint: "Information, enquiries and bookings. £39/month." },
  { value: "commerce", label: "Online sales, orders or payments", hint: "We’ll prepare a custom quote." },
  { value: "custom", label: "Multiple pages or custom features", hint: "We’ll prepare a custom quote." },
] as const;

export const contactMethods = [
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Enquiry form" },
  { value: "request", label: "Booking request" },
  { value: "booking", label: "Existing booking link" },
] as const;

export type Step = "business" | "checkout" | "brief" | "complete" | "quote" | "quote-complete";
export type Scope = (typeof scopes)[number]["value"];
export type Feature = (typeof features)[number]["value"];
export type ContactMethod = (typeof contactMethods)[number]["value"];
export type Industry = (typeof industries)[number]["value"];
export type Answers = {
  scope: Scope | "";
  industry: Industry | "";
  features: Feature[];
  businessName: string;
  area: string;
  hasWebsite: "yes" | "no" | "";
  website: string;
  links: string[];
  name: string;
  email: string;
  deliveryPhone: string;
  services: string;
  contacts: ContactMethod[];
  phone: string;
  whatsapp: string;
  samePhone: boolean;
  enquiryEmail: string;
  bookingUrl: string;
  bookingLater: boolean;
  difference: string;
  colours: string;
  notes: string;
  address: string;
  hours: string;
  menuUrl: string;
  quoteDetails: string;
  checkoutAcknowledged: boolean;
};
export type Errors = Record<string, string>;

export function emptyAnswers(): Answers {
  return {
    scope: "standard", industry: "", features: [], businessName: "", area: "", hasWebsite: "", website: "", links: [""],
    name: "", email: "", deliveryPhone: "", services: "", contacts: [], phone: "", whatsapp: "", samePhone: false,
    enquiryEmail: "", bookingUrl: "", bookingLater: false, difference: "", colours: "", notes: "",
    address: "", hours: "", menuUrl: "", quoteDetails: "", checkoutAcknowledged: false,
  };
}

export function needsQuote(answers: Pick<Answers, "scope" | "features">) {
  return answers.scope === "commerce" || answers.scope === "custom" || answers.features.includes("commerce") || answers.features.includes("custom");
}

export function safeUrl(value: string): string | null {
  if (!value.trim()) return null;
  try {
    const parsed = new URL(/^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`);
    if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password || !parsed.hostname.includes(".") || /\s/.test(value)) return null;
    return parsed.href;
  } catch { return null; }
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isPhone = (value: string) => /^[+\d\s().-]+$/.test(value.trim()) && value.replace(/\D/g, "").length >= 7 && value.replace(/\D/g, "").length <= 15;

export function validateStep(step: Step, a: Answers): Errors {
  const errors: Errors = {};
  const required = (field: keyof Answers, message: string) => { if (!String(a[field]).trim()) errors[field] = message; };
  if (step === "business") {
    required("name", "Enter your name.");
    if (!isEmail(a.email)) errors.email = "Enter an email address, such as you@example.co.uk.";
    if (!isPhone(a.deliveryPhone)) errors.deliveryPhone = "Enter a valid phone number for WhatsApp, including the country code if outside the UK.";
    required("businessName", "Enter your business name.");
    required("area", "Enter a town, postcode or the area you serve.");
    if (!industries.some((i) => i.value === a.industry)) errors.industry = "Choose the closest business type. Something else is fine too.";
  }
  if (step === "brief") {
    if (!a.hasWebsite) errors.hasWebsite = "Choose whether you already have a website.";
    if (a.hasWebsite === "yes" && a.website && !safeUrl(a.website)) errors.website = "Enter a website address, such as example.co.uk, or leave it blank.";
    a.links.forEach((link, i) => { if (link && !safeUrl(link)) errors[`link-${i}`] = "Enter a full website or profile link, or leave it blank."; });
  }
  if (step === "checkout" || step === "quote") {
    if (step === "checkout" && !a.checkoutAcknowledged) errors.checkoutAcknowledged = "Confirm you understand the free trial and monthly price after it ends.";
    if (step === "quote" && (a.scope === "custom" || a.features.includes("custom"))) required("quoteDetails", "Briefly describe the extra pages or features you need.");
    if (step === "quote" && a.phone && !isPhone(a.phone)) errors.phone = "Enter a valid phone number, or leave it blank.";
  }
  if (step === "brief") {
    required("services", "Add at least one service, product or a short description.");
    if (!a.contacts.length) errors.contacts = "Choose at least one way customers can contact you.";
    if (a.contacts.includes("phone") && !isPhone(a.phone)) errors.phone = "Enter a business phone number, including its area code.";
    if (a.contacts.includes("whatsapp") && !isPhone(a.samePhone && a.contacts.includes("phone") ? a.phone : a.whatsapp)) errors.whatsapp = "Enter the number customers can use on WhatsApp.";
    if ((a.contacts.includes("email") || a.contacts.includes("request") || (a.contacts.includes("booking") && a.bookingLater)) && !isEmail(a.enquiryEmail)) errors.enquiryEmail = "Confirm the email address that should receive enquiries.";
    if (a.contacts.includes("booking") && !a.bookingLater && !safeUrl(a.bookingUrl)) errors.bookingUrl = "Add your booking link, or choose to add it later.";
  }
  if (step === "brief" && a.industry === "food" && a.menuUrl && !safeUrl(a.menuUrl)) errors.menuUrl = "Enter a link to your menu, or leave it blank.";
  return errors;
}

export function suggestedContacts(a: Answers): ContactMethod[] {
  const result: ContactMethod[] = [];
  if (a.features.includes("enquiries")) result.push("email");
  if (a.features.includes("requests")) result.push("request");
  if (a.features.includes("booking")) result.push("booking");
  return result.length ? result : ["email"];
}

/** Illustrative date only; production trial timing must come from confirmed checkout. */
export function trialEndDate(isoDate: string): string {
  const end = new Date(`${isoDate}T12:00:00Z`);
  end.setUTCDate(end.getUTCDate() + INSTANT_TRIAL_DAYS);
  return end.toISOString().slice(0, 10);
}

export type Draft = { version: 1; savedAt: number; step: Step; answers: Answers; checkoutPreviewed: boolean };

/** Storage is untrusted; restore only bounded values and reachable screens. */
export function readDraft(raw: string | null, now = Date.now()): Draft | null {
  if (!raw || raw.length > 50000) return null;
  try {
    const d = JSON.parse(raw);
    if (d.version !== 1 || typeof d.savedAt !== "number" || d.savedAt > now + 60000 || now - d.savedAt > DRAFT_TTL_MS || !d.answers || typeof d.answers !== "object") return null;
    const a = emptyAnswers();
    for (const key of Object.keys(a) as (keyof Answers)[]) {
      if (typeof a[key] === "string" && typeof d.answers[key] === "string") (a as unknown as Record<string, unknown>)[key] = d.answers[key].slice(0, 3000);
    }
    a.industry = industries.some((i) => i.value === a.industry) ? a.industry : "";
    a.hasWebsite = a.hasWebsite === "yes" || a.hasWebsite === "no" ? a.hasWebsite : "";
    a.features = Array.isArray(d.answers.features) ? features.filter((f) => d.answers.features.includes(f.value)).map((f) => f.value) : [];
    // The one-page package is implicit. Preserve existing quote drafts, while
    // earlier drafts with an unanswered scope can continue without a hidden field.
    a.scope = scopes.some((s) => s.value === d.answers.scope) ? d.answers.scope : a.features.includes("custom") ? "custom" : a.features.includes("commerce") ? "commerce" : "standard";
    a.contacts = Array.isArray(d.answers.contacts) ? contactMethods.filter((c) => d.answers.contacts.includes(c.value)).map((c) => c.value) : [];
    a.links = Array.isArray(d.answers.links) ? d.answers.links.filter((v: unknown) => typeof v === "string").slice(0, 4).map((v: string) => v.slice(0, 1000)) : [""];
    if (!a.links.length) a.links = [""];
    a.samePhone = d.answers.samePhone === true;
    a.bookingLater = d.answers.bookingLater === true;
    a.checkoutAcknowledged = d.answers.checkoutAcknowledged === true;
    const validSteps: Step[] = ["business", "checkout", "brief", "complete", "quote", "quote-complete"];
    let step: Step = d.step === "extras" ? "brief" : validSteps.includes(d.step) ? d.step : "business";
    const checkoutPreviewed = d.checkoutPreviewed === true;
    if (Object.keys(validateStep("business", a)).length) step = "business";
    else if (needsQuote(a) && step !== "business") {
      step = step === "quote-complete" && !Object.keys(validateStep("quote", a)).length ? "quote-complete" : "quote";
    } else if (["quote", "quote-complete"].includes(step)) step = "business";
    else if (["brief", "complete"].includes(step) && (!checkoutPreviewed || Object.keys(validateStep("checkout", a)).length)) step = "checkout";
    else if (step === "complete" && Object.keys(validateStep("brief", a)).length) step = "brief";
    return { version: 1, savedAt: d.savedAt, step, answers: a, checkoutPreviewed };
  } catch { return null; }
}

export function validateAttachment(file: Pick<File, "name" | "size" | "type">) {
  if (!/\.(jpe?g|png|webp|pdf)$/i.test(file.name) || !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) return "Choose a JPG, PNG, WebP or PDF file.";
  if (!file.size) return "This file is empty. Choose another file.";
  if (file.size > 10 * 1024 * 1024) return "This file is over 10 MB. Choose a smaller file.";
  return null;
}
