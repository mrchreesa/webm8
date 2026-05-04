import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Pricing } from "@/components/home/Pricing";
import { FinalCta } from "@/components/home/FinalCta";
import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Pricing — Simple monthly website plans",
  description:
    "Simple monthly plans for US local businesses. Standard $197/month for a professional site. Growth $297/month for lead generation and performance tracking.",
  path: "/pricing/",
});

const compare: {
  label: string;
  standard: string | boolean;
  growth: string | boolean;
}[] = [
  { label: "Professional design", standard: true, growth: true },
  { label: "Mobile-friendly layout", standard: true, growth: true },
  { label: "Homepage, services, about, contact", standard: true, growth: true },
  { label: "Contact form + click-to-call", standard: true, growth: true },
  { label: "Hosting & support included", standard: true, growth: true },
  { label: "Domain name included", standard: true, growth: true },
  {
    label: "Basic SEO (titles, meta, LocalBusiness schema)",
    standard: true,
    growth: true,
  },
  { label: "Google Business Profile setup", standard: false, growth: true },
  {
    label: "Advanced SEO (service & location pages, FAQ schema)",
    standard: false,
    growth: true,
  },
  {
    label:
      "GEO / LLM optimization (ChatGPT, Claude, Gemini, Perplexity etc. visibility)",
    standard: false,
    growth: true,
  },
  {
    label: "Google Analytics + monthly performance report",
    standard: false,
    growth: true,
  },
  {
    label: "Lead CRM (forms & customers in one place)",
    standard: false,
    growth: true,
  },
  {
    label: "Automated email + post-job review requests",
    standard: false,
    growth: true,
  },
  { label: "Conversion-focused page structure", standard: false, growth: true },
];

const faqs = [
  {
    q: "Is there a setup or upfront fee?",
    a: "No large upfront website cost. You pay the monthly plan price and we start the build.",
  },
  {
    q: "Can I switch from Standard to Growth later?",
    a: "Yes. Most businesses start on Standard and move to Growth once they want service & location pages, a lead CRM, and automated review follow-ups.",
  },
  {
    q: "Do you own the website or do I?",
    a: "You own the content and domain. The site is designed, hosted, and maintained by us as part of the monthly plan.",
  },
  {
    q: "Can I cancel?",
    a: "Yes. Month-to-month, cancel anytime. No long contracts.",
  },
  {
    q: "How long does a build take?",
    a: "Most sites launch inside 2–3 weeks from the first strategy session, depending on how quickly we get content and photos.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={
          <>
            Simple Monthly Website Plans
            <br />
            <span className="text-brand">from $197/month</span>
          </>
        }
        subtitle="Get a professional website without a large upfront cost. Choose the plan that fits your business goals."
      />

      <section className="py-16 md:py-20">
        <div className="container-page">
          <Pricing variant="bare" showReassurance />
        </div>
      </section>

      <Section
        tone="surface"
        eyebrow="What's different"
        title="Standard vs. Growth at a glance"
        subtitle="Both plans include a professional, mobile-first website. Growth is built for businesses that want more leads and clearer tracking."
      >
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-bg font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                  <th className="px-5 py-4">Feature</th>
                  <th className="px-5 py-4 text-center">Standard</th>
                  <th className="px-5 py-4 text-center text-brand">Growth</th>
                </tr>
              </thead>
              <tbody>
                {compare.map((row, i) => (
                  <tr
                    key={row.label}
                    className={cn(
                      "transition-colors hover:bg-brand/5",
                      i % 2 === 0 ? "bg-white" : "bg-bg/40",
                    )}
                  >
                    <td className="px-5 py-4 font-medium text-ink">
                      {row.label}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Cell value={row.standard} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Cell value={row.growth} highlight />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Section>

      <Section
        eyebrow="FAQs"
        title="Questions owners usually ask first"
        align="center"
      >
        <div className="mx-auto grid max-w-3xl gap-3">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <details className="group rounded-2xl border border-border bg-white p-5 transition-all duration-300 open:border-brand/30 hover:border-ink/20">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink marker:content-none">
                  {f.q}
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink transition-transform duration-300 group-open:rotate-45 group-open:bg-brand group-open:text-white">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <LinkButton href="/contact" size="lg" variant="ghost">
            Ask us a question
          </LinkButton>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}

function Cell({
  value,
  highlight,
}: {
  value: string | boolean;
  highlight?: boolean;
}) {
  if (typeof value === "string") {
    return <span className="text-sm text-ink">{value}</span>;
  }
  if (value) {
    return (
      <span
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-full",
          highlight ? "bg-brand text-white" : "bg-accent/15 text-accent",
        )}
      >
        <Icon name="check" size={14} />
      </span>
    );
  }
  return <span className="inline-block text-muted/40">—</span>;
}
