import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DemoClosing } from "@/components/demo/DemoClosing";
import { DemoCtaButton } from "@/components/demo/DemoCtaButton";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { analyticsName } from "@/lib/analyticsNames";
import { projects } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";
import styles from "./about.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "About Us: Web Design for Local Businesses",
  description:
    "Your website. Our day job. WebM8 designs, builds and looks after websites for local businesses in the US and UK, from the first sketch to ongoing support.",
  path: "/about/",
  shareCard: "about",
});

const demoSlugs = ["dps-gasworks", "stitch-house", "aesthetic-nacre"];
const demoProjects = demoSlugs.map((slug) => projects.find((project) => project.slug === slug)!);

const principles = [
  {
    title: "Start with your customers.",
    body: "What do they need to know? What would help them trust you? How should they get in touch? Those answers shape the pages, the words and the design.",
  },
  {
    title: "Keep things straightforward.",
    body: "We explain what we’re building and why, in plain English. You get a clear quote for your business and a chance to see a custom demo before you decide.",
  },
  {
    title: "Stay involved after launch.",
    body: "Your website needs looking after as your business changes. Hosting, maintenance and ongoing support are part of the monthly plan.",
  },
];

const responsibilities = [
  {
    title: "You know your business.",
    label: "What you bring",
    body: "Your services, your customers and what makes you different. Share your business details, logo and photos, and give us feedback along the way.",
  },
  {
    title: "We take care of the website.",
    label: "What we handle",
    body: "The words, design and build. Making it work on phones. Getting it online, hosting it and helping with changes when you need them.",
  },
];

const faqs = [
  {
    q: "What kinds of businesses do you work with?",
    a: "We focus on local businesses in the US and UK: trades, salons, clinics, restaurants, shops and other service businesses. If your website needs to help people understand what you do and take the next step, we can talk through what would work for you.",
  },
  {
    q: "What happens after the website launches?",
    a: "We host and maintain the site, with ongoing support as part of your monthly plan. When your services, photos or business details change, get in touch. We’ll explain what’s covered by your plan and quote for any additional work before it starts.",
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

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <section aria-labelledby="about-title" className="pt-10 pb-16 sm:pt-14 sm:pb-20 lg:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <header>
            <Eyebrow>About WebM8</Eyebrow>
            <h1 id="about-title" className="mt-5 text-[clamp(2.75rem,13vw,3.25rem)] leading-[1.02] font-bold tracking-[-0.045em] text-ink sm:text-[clamp(3.25rem,6.2vw,5.5rem)]">
              Your website.<br />
              <span className="text-link">Our day job.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted sm:text-xl">
              We’re a web design agency for local businesses in the US and UK.
              We design, build and look after your website, so you can get on
              with running your business.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <DemoCtaButton placement="hero" size="lg">
                Get my free demo <Icon name="arrow" size={18} aria-hidden />
              </DemoCtaButton>
              <Link href="/contact/" data-analytics-id="About contact" className="inline-flex min-h-11 items-center gap-2 font-semibold text-link underline-offset-4 hover:underline">
                Talk to us <Icon name="arrow" size={17} aria-hidden />
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">See a design for your business. No payment, no obligation.</p>
          </header>

          <figure className="min-w-0">
            <Link href="/work/" data-analytics-id="About demo designs" aria-label="Explore our demo website designs" className={`surface-dark group ${styles.showcase}`}>
              <div className={styles.phones}>
                {demoProjects.map((project, index) => (
                  <div key={project.slug} className={styles.phone}>
                    <Image
                      src={project.screenshots.mobile}
                      alt={`${project.name} demo website on a phone`}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1023px) 240px, 23vw"
                      className="object-cover object-top"
                      priority={index === 1}
                      loading={index === 1 ? undefined : "eager"}
                    />
                  </div>
                ))}
              </div>
              <span className={styles.showcaseLink}>
                Different businesses.<br />Their own look.
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 transition-colors group-hover:bg-white/10">
                  <Icon name="arrow" size={22} aria-hidden />
                </span>
              </span>
            </Link>
            <figcaption className="mt-3 text-center text-xs leading-relaxed text-muted">
              A few of our demo designs. Explore the work to see more.
            </figcaption>
          </figure>
        </div>
      </section>

      <section aria-labelledby="approach-title" data-analytics-section="About approach" className="border-y border-border bg-surface py-16 sm:py-24">
        <div className="container-page">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>Why WebM8</Eyebrow>
              <h2 id="approach-title" className="mt-4 max-w-lg text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl">
                One less job<br className="hidden sm:block" /> on your list.
              </h2>
            </div>
            <p className="max-w-xl self-end text-lg leading-relaxed text-muted">
              Running a local business already means wearing plenty of hats.
              The website shouldn’t be another job to learn. We bring the
              design, build and ongoing care together, with one place to turn
              when you need a change.
            </p>
          </div>
          <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-3 md:gap-10">
            {principles.map((principle, index) => (
              <article key={principle.title} className="border-t border-border pt-6">
                <span aria-hidden className="font-mono text-sm text-muted">0{index + 1}</span>
                <h3 className="mt-4 text-xl leading-snug font-bold tracking-tight text-ink">{principle.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted">{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="working-together-title" data-analytics-section="Working with WebM8" className="py-16 sm:py-24">
        <div className="container-page">
          <div className="surface-dark grid overflow-hidden rounded-3xl bg-ink text-white lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-between gap-10 p-7 sm:p-10 lg:p-12">
              <div>
                <Eyebrow tone="invert">Working together</Eyebrow>
                <h2 id="working-together-title" className="mt-5 max-w-sm text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl">
                  Your business.<br />A website that<br className="hidden sm:block" /> keeps up.
                </h2>
              </div>
              <Link href="/pricing/" data-analytics-id="About website plans" className="inline-flex min-h-11 w-fit items-center gap-3 font-semibold text-brand underline-offset-4 hover:underline">
                Explore our website plans <Icon name="arrow" size={18} aria-hidden />
              </Link>
            </div>
            <div className="border-t border-white/15 p-7 sm:p-10 lg:border-t-0 lg:border-l lg:p-12">
              {responsibilities.map((item, index) => (
                <div key={item.label} className={index === 0 ? "pb-7" : "border-t border-white/15 pt-7"}>
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-invert">{item.label}</p>
                  <h3 className="mt-3 text-xl font-bold tracking-tight">{item.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-invert">{item.body}</p>
                </div>
              ))}
              <p className="mt-8 text-sm text-white">Month-to-month. No long contracts.</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="about-faq-title" data-analytics-section="About questions" className="border-t border-border bg-surface py-16 sm:py-24">
        <div className="container-page grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <header>
            <Eyebrow>A few practical things</Eyebrow>
            <h2 id="about-faq-title" className="mt-4 max-w-sm text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl">
              Before we<br className="hidden lg:block" /> get started.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">Something else on your mind?</p>
            <Link href="/contact/" data-analytics-id="About ask a question" className="inline-flex min-h-11 items-center gap-2 font-semibold text-link underline-offset-4 hover:underline">
              Ask us a question <Icon name="arrow" size={18} aria-hidden />
            </Link>
          </header>
          <div className="border-t border-border">
            {faqs.map((faq) => (
              <details key={faq.q} className="group border-b border-border">
                <summary data-analytics-id={analyticsName(`FAQ ${faq.q}`)} className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-base leading-snug font-semibold text-ink marker:content-none sm:text-lg [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink/5 transition-transform group-open:rotate-45">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="pr-4 pb-6 text-base leading-relaxed text-muted sm:pr-12">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <DemoClosing />
    </>
  );
}
