import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { FinalCta } from "@/components/home/FinalCta";
import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Pricing: Get a fast estimate",
  description:
    "Every WebM8 project is quoted to the business. Tell us what you need and we'll send a straight number within one business day. No large upfront website cost.",
  path: "/pricing/",
});

const reasons = [
  {
    title: "Scope is never the same twice",
    body: "A four-page site for a mobile detailer and a multi-location HVAC company with service pages for every town are different jobs. A single sticker price would overcharge one and underbuild the other.",
  },
  {
    title: "You only pay for what moves the needle",
    body: "Some businesses need the lead CRM and automated review requests on day one. Others just need a clean, fast site that makes the phone ring. We quote the work you'll actually use.",
  },
  {
    title: "No large upfront website cost",
    body: "Whatever the scope, it's a monthly plan with hosting, domain, and support included. Month to month, cancel anytime, no long contracts.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={
          <>
            Every Project Is
            <br />
            <span className="text-brand">Quoted To The Business</span>
          </>
        }
        subtitle="Tell us what you need and we'll send a number within one business day. No sales call required, no obligation."
      />

      <Section
        eyebrow="Why there's no sticker price"
        title="Because a fair number depends on what you actually need."
        align="center"
      >
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {reasons.map((reason, i) => (
            <Reveal key={reason.title} delay={i * 80}>
              <article className="shadow-card hover:shadow-card-hover flex h-full flex-col rounded-2xl border border-border bg-white p-6 transition-all duration-300 hover:-translate-y-1">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon name="check" size={20} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {reason.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={240}>
          <div className="mt-12 flex flex-col items-center gap-4">
            <LinkButton href="/contact/" size="lg">
              Get a Fast Estimate
              <Icon name="arrow" size={18} />
            </LinkButton>
            <p className="text-sm text-muted">
              Takes about two minutes. We reply within one business day.
            </p>
          </div>
        </Reveal>
      </Section>

      <FinalCta />
    </>
  );
}
