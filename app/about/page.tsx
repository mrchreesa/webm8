import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { Process } from "@/components/home/Process";
import { FinalCta } from "@/components/home/FinalCta";
import { Reveal } from "@/components/ui/Reveal";
import { valueProps } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "About: Websites built for local business growth",
  description:
    "WebM8 builds and looks after professional websites that help US local businesses get more calls, bookings, and customers.",
  path: "/about/",
});

const faqs = [
  {
    q: "Can you help AI search tools understand my business?",
    a: "Yes. People now ask tools such as ChatGPT, Gemini, and Perplexity for local recommendations. We write clear business information and arrange the website so these tools can understand your services and the places you cover. We cannot promise that any tool will recommend a particular business.",
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
    a: "Most sites launch within 2–3 weeks of the first planning call. The timing also depends on how quickly we receive the words, photos, and business details we need.",
  },
];

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
        subtitle="We build websites that look professional, explain the business clearly, and make it easy for customers to call, book, or ask for a quote."
      />

      <Section
        tone="surface"
        eyebrow="Our focus"
        title="A better website should do more than look good."
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
        title="Local businesses that use their website to bring in real customer requests."
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

      <Section
        tone="surface"
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
          <LinkButton href="/contact/" size="lg" variant="ghost">
            Ask us a question
          </LinkButton>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
