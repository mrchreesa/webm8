import { cleanAttribution, type Attribution } from "./leadAttribution.ts";
import { normaliseLink, validateBusinessAnswers } from "./demoRequest.ts";

export const contactPlans = {
  standard: "Standard",
  growth: "Growth",
  unsure: "Not sure yet",
} as const;
export type ContactAnswers = {
  business: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  plan: string;
  message: string;
};
export type ContactErrors = Partial<
  Record<keyof ContactAnswers | "form", string>
>;
export type ContactSubmission = Omit<ContactAnswers, "website" | "plan"> & {
  formType: "contact";
  plan: keyof typeof contactPlans;
  link: string | null;
  submissionKey: string;
  attribution: Attribution;
  referrer: string | null;
  pagePath: string;
};
const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export function validateContactAnswers(
  input: unknown,
): { ok: false; errors: ContactErrors } | { ok: true; value: ContactAnswers } {
  const raw = (input && typeof input === "object" ? input : {}) as Record<
    string,
    unknown
  >;
  const value: ContactAnswers = {
    business: text(raw.business),
    name: text(raw.name),
    email: text(raw.email),
    phone: text(raw.phone),
    website: text(raw.website),
    plan: text(raw.plan),
    message: text(raw.message),
  };
  const { link, ...common } = validateBusinessAnswers({
    ...value,
    link: value.website,
  });
  const errors: ContactErrors = {
    ...common,
    ...(link ? { website: link } : {}),
  };
  if (!Object.hasOwn(contactPlans, value.plan))
    errors.plan = "Choose a plan, or select Not sure yet.";
  if (value.message.length > 3000)
    errors.message = "Keep your message under 3,000 characters.";
  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, value };
}

export function validateContactSubmission(
  input: unknown,
):
  | { ok: false; errors: ContactErrors }
  | { ok: true; value: ContactSubmission } {
  const result = validateContactAnswers(input);
  if (!result.ok) return result;
  const raw = input as Record<string, unknown>;
  if (
    text(raw.website_hp) ||
    !Number.isFinite(raw.elapsedMs) ||
    Number(raw.elapsedMs) < 1500
  )
    return {
      ok: false,
      errors: { form: "That request could not be accepted. Please try again." },
    };
  const submissionKey = text(raw.submissionKey);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      submissionKey,
    )
  )
    return { ok: false, errors: { form: "Reload the page and try again." } };
  const { website, plan, ...answers } = result.value;
  return {
    ok: true,
    value: {
      ...answers,
      formType: "contact",
      plan: plan as ContactSubmission["plan"],
      link: normaliseLink(website) || null,
      submissionKey,
      attribution: cleanAttribution(raw.attribution),
      referrer: text(raw.referrer).slice(0, 300) || null,
      pagePath: "/contact/",
    },
  };
}
