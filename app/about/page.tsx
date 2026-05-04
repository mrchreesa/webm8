import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { Process } from "@/components/home/Process";
import { FinalCta } from "@/components/home/FinalCta";
import { Reveal } from "@/components/ui/Reveal";
import { valueProps } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "About: Websites built for local business growth",
  description:
    "WebM8 is a web design agency focused on US local businesses. We build professional, conversion-focused websites that help owners win more calls, bookings, and customers.",
  path: "/about/",
});

const industries = [
  "Contractors",
  "Landscapers",
  "HVAC & Plumbing",
  "Roofers",
  "Cleaners",
  "Salons & Spas",
  "Restaurants",
  "Dental & Med",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About WebM8"
        title={
          <>
            Websites that help local businesses{" "}
            <span className="text-brand">make more money</span>.
          </>
        }
        subtitle="We don't sell beautiful websites. We sell websites that bring in calls, bookings, quote requests, and paying customers for US local businesses."
      />

      <Section
        tone="surface"
        eyebrow="Our focus"
        title="A better website is a business asset, not a brochure."
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {valueProps.map((v, i) => (
            <Reveal key={v.title} delay={i * 80}>
              <article className="shadow-card hover:shadow-card-hover flex h-full flex-col rounded-2xl border border-border bg-white p-6 transition-all duration-300 hover:-translate-y-1">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon name="check" size={20} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {v.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Who we build for"
        title="Local service businesses that rely on their website to generate real enquiries."
      >
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {industries.map((industry, i) => (
            <Reveal key={industry} delay={i * 40}>
              <div className="rounded-2xl border border-border bg-white px-5 py-4 text-center text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:text-brand">
                {industry}
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Process />

      <FinalCta />
    </>
  );
}
