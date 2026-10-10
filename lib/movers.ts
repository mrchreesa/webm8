/**
 * Single source of truth for the /movers/ campaign offer.
 *
 * Like /pricing/, the plans carry no price: every website is quoted to the
 * business. Leaving the figures out of the data means no component or JSON-LD
 * can publish one.
 */

export type BillingCycle = "monthly" | "annual";

export type MoverPlanId = "standard" | "growth";

export const moverServiceValues = [
  "local-moving",
  "long-distance-moving",
  "packing",
  "commercial-moving",
  "labor-only",
  "other",
] as const;

export type MoverService = (typeof moverServiceValues)[number];

export const moverServiceOptions: { value: MoverService; label: string }[] = [
  { value: "local-moving", label: "Local moving" },
  { value: "long-distance-moving", label: "Long-distance moving" },
  { value: "packing", label: "Packing" },
  { value: "commercial-moving", label: "Commercial moving" },
  { value: "labor-only", label: "Labor-only" },
  { value: "other", label: "Other" },
];

export const moverSiteFeelValues = [
  "clean-professional",
  "warm-friendly",
  "bold-energetic",
  "calm-minimal",
  "premium-polished",
  "fun-playful",
] as const;

export type MoverSiteFeel = (typeof moverSiteFeelValues)[number];

export const moverSiteFeelOptions: { value: MoverSiteFeel; label: string }[] = [
  { value: "clean-professional", label: "Clean and professional" },
  { value: "warm-friendly", label: "Warm and friendly" },
  { value: "bold-energetic", label: "Bold and energetic" },
  { value: "calm-minimal", label: "Calm and minimal" },
  { value: "premium-polished", label: "Premium and polished" },
  { value: "fun-playful", label: "Fun and playful" },
];

export type MoverPlan = {
  id: MoverPlanId;
  name: string;
  /** Honest descriptor of what the plan is, shown above the name. */
  label: string;
  summary: string;
  features: string[];
  footnote: string;
};

export const moverPlans: MoverPlan[] = [
  {
    id: "standard",
    name: "Standard",
    label: "Managed website",
    summary:
      "A professional moving-company website, built and looked after for you, with quote requests arriving in your inbox.",
    features: [
      "Website design and copy written for your company, services and real service area",
      "Responsive layout with visible phone buttons and a straightforward estimate form",
      "Quote requests delivered to your email",
      "Trust sections built from your genuine reviews, photos and licence and insurance details",
      "Hosting, security, backups and maintenance",
      "Foundational on-page SEO and analytics setup",
      "Routine small content edits",
      "A simple monthly website and enquiry summary",
    ],
    footnote: "Everything you need to collect estimate requests properly.",
  },
  {
    id: "growth",
    name: "Growth",
    label: "Ongoing growth support",
    summary:
      "Everything in Standard, plus month-by-month work on local visibility, new pages, follow-up and conversion.",
    features: [
      "Everything in Standard, plus:",
      "Google Business Profile support and optimization, with your access and approval",
      "One new or substantially improved service or location page each month",
      "Review-request and enquiry-follow-up workflows using supported integrations",
      "One useful conversion improvement each month, informed by evidence where available",
      "A monthly performance review covering enquiries, sources and the next practical actions",
    ],
    footnote: "For companies that want the website worked on, not just kept online.",
  },
];

/** The public Cal.com page for the free 15-minute website-preview call. */
export const reviewCalendarUrl = "https://cal.com/webm8/review";

/** Cal.com namespace used by the inline embed on the success panel. */
export const reviewCalendarLink = "webm8/review";

export const previewCallMinutes = 15;
export const previewCalendarEventTypeId = 7042719;
export const previewCalendarProvider = "Cal.com";
export const previewCallFormat = "Cal.com video call";

export function isMoverPlanId(value: unknown): value is MoverPlanId {
  return value === "standard" || value === "growth";
}

export function isBillingCycle(value: unknown): value is BillingCycle {
  return value === "monthly" || value === "annual";
}
