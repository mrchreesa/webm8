/**
 * Single source of truth for the /movers/ campaign offer.
 *
 * Every price shown on the page is derived from `monthlyPrice` and
 * `annualPrice` here. Nothing about the pricing is written out by hand in a
 * component, so the two can never drift apart.
 */

export type BillingCycle = "monthly" | "annual";

export type MoverPlanId = "standard" | "growth";

export type MoverPlan = {
  id: MoverPlanId;
  name: string;
  /** Honest descriptor of what the plan is, shown above the name. */
  label: string;
  summary: string;
  monthlyPrice: number;
  annualPrice: number;
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
    monthlyPrice: 197,
    annualPrice: 1970,
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
    monthlyPrice: 297,
    annualPrice: 2970,
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

/** The public Cal.com page for the free 10-minute review. */
export const reviewCalendarUrl = "https://cal.com/webm8/review";

/** Cal.com namespace used by the inline embed on the success panel. */
export const reviewCalendarLink = "webm8/review";

export function getMoverPlan(id: MoverPlanId): MoverPlan {
  const plan = moverPlans.find((item) => item.id === id);
  if (!plan) throw new Error(`Unknown mover plan: ${id}`);
  return plan;
}

/**
 * What the annual charge works out at per month. Never presented as the amount
 * actually billed each month — the annual charge is taken once, up front.
 */
export function annualEquivalentMonthly(plan: MoverPlan) {
  return Math.round((plan.annualPrice / 12) * 100) / 100;
}

/** Two months of the monthly price, saved by paying for the year up front. */
export function annualSaving(plan: MoverPlan) {
  return plan.monthlyPrice * 12 - plan.annualPrice;
}

/** How many months are paid for under the annual price. */
export function annualMonthsPaid(plan: MoverPlan) {
  return plan.annualPrice / plan.monthlyPrice;
}

const wholeDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const preciseDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUsd(amount: number) {
  return wholeDollars.format(amount);
}

export function formatUsdPrecise(amount: number) {
  return preciseDollars.format(amount);
}

export function isMoverPlanId(value: unknown): value is MoverPlanId {
  return value === "standard" || value === "growth";
}

export function isBillingCycle(value: unknown): value is BillingCycle {
  return value === "monthly" || value === "annual";
}
