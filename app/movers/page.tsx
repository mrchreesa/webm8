import type { Metadata } from "next";
import { AmbientBlobs } from "@/components/ui/AmbientBlobs";
import { BrowserMockup } from "@/components/ui/BrowserMockup";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon, type IconName } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { MoverPreviewForm } from "@/components/forms/MoverPreviewForm";
import { StickyMoverCta } from "@/components/movers/StickyMoverCta";
import { MoverFunnelTracking } from "@/components/movers/MoverFunnelTracking";
import { projects } from "@/lib/site";
import { absoluteUrl, createPageMetadata, siteName } from "@/lib/seo";

const pageTitle =
  "Moving Company Websites That Bring In Estimate Requests";
const pageDescription =
  "WebM8 builds websites for US moving companies. Each site makes it easy to request an estimate, sends new requests straight to you, helps nearby customers find you, and is improved every month.";

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/movers/",
});

const moverProject =
  projects.find((project) => project.slug === "removals") ?? projects[0]!;

const credibility = [
  { icon: "device" as const, label: "Easy to use on any phone" },
  { icon: "leads" as const, label: "Quote requests sent straight to you" },
  { icon: "map" as const, label: "Pages for every area you serve" },
  { icon: "support" as const, label: "Fast, personal help" },
];

const leaks = [
  {
    number: "01",
    title: "The estimate path asks too much",
    body: "Mobile visitors leave when the phone number is buried or the form feels like paperwork. We make the first step fast, clear, and easy to finish.",
  },
  {
    number: "02",
    title: "The site doesn’t prove you’re the safe choice",
    body: "Reviews, insurance, license details, real crews, vehicles and service promises need to appear where customers are deciding—not hidden on separate pages.",
  },
  {
    number: "03",
    title: "You don’t know what brings the calls",
    body: "If calls and forms are not recorded, you cannot tell which pages or ads are working. We show you where each request came from.",
  },
];

const serviceGroups: {
  icon: IconName;
  title: string;
  intro: string;
  items: string[];
}[] = [
  {
    icon: "device",
    title: "A complete mover website",
    intro: "Written and designed around how moving customers compare companies.",
    items: [
      "Custom design and done-for-you copy",
      "Up to 8 core pages",
      "Up to 5 initial pages for towns you serve",
      "Local, long-distance and business moves",
      "Packing and storage pages where relevant",
      "Mobile click-to-call and quote buttons",
      "Reviews, fleet, insurance and license proof",
      "Secure hosting, backups and maintenance",
    ],
  },
  {
    icon: "leads",
    title: "A simple estimate form",
    intro: "Enough detail to understand the move without making the form feel like hard work.",
    items: [
      "Origin and destination",
      "Moving date and move size",
      "Required services",
      "Phone and email capture",
      "New requests sent to you right away",
      "Sent to your email or sales software",
      "Automatic email and optional text replies",
      "A clear message explaining what happens next",
    ],
  },
  {
    icon: "chart",
    title: "Help people find you—and see what works",
    intro: "We help nearby customers find the right page and show you which pages bring calls and forms.",
    items: [
      "See how many people visit the site",
      "See which pages bring calls and forms",
      "Help Google find and read new pages",
      "Pages for each service and town",
      "Clear page names and business details",
      "Research into other movers in your area",
      "Help with your Google business listing",
      "A new service or location page each month",
    ],
  },
  {
    icon: "support",
    title: "Personal help, every month",
    intro: "Direct help before launch, followed by regular improvements and quick support.",
    items: [
      "A homepage preview before payment",
      "Reasonable revisions before launch",
      "Direct access to the person doing the work",
      "Weekly review for the first 90 days",
      "One useful website improvement each month",
      "A reply on the same business day",
      "A simple monthly results review",
      "Review-request system management",
    ],
  },
];

const flow = [
  {
    icon: "map" as const,
    title: "The right customer visits",
    body: "A customer finds the page for the move and area they need.",
  },
  {
    icon: "device" as const,
    title: "They take an easy first step",
    body: "They call or fill in a short estimate form on their phone or computer.",
  },
  {
    icon: "mail" as const,
    title: "The request reaches you",
    body: "The details go straight to your email or the sales software you already use.",
  },
  {
    icon: "chart" as const,
    title: "You see what worked",
    body: "Calls and forms are recorded so we can improve the pages that bring business.",
  },
];

const process = [
  {
    number: "01",
    title: "Tell us about the business",
    body: "Share your services, market, current website and what a valuable lead looks like.",
  },
  {
    number: "02",
    title: "Review your homepage preview",
    body: "We research your market and prepare the first homepage design. You pay nothing to review it.",
  },
  {
    number: "03",
    title: "Approve, complete and launch",
    body: "If you like the preview, we finish the writing, pages, forms, call tracking and setup.",
  },
  {
    number: "04",
    title: "Improve every month",
    body: "We review behavior, inquiries and feedback weekly at first, then keep shipping practical improvements throughout the service.",
  },
];

const faqs = [
  {
    question: "Why is the homepage preview free?",
    answer:
      "A website is hard to judge from a written promise. The preview lets you see our idea for your company before you agree to pay. If it is not right for you, the preview costs nothing.",
  },
  {
    question: "Is this a generic moving-company template?",
    answer:
      "No. We start with a page layout that works well for movers, but the words, design, services, areas, photos, reviews and estimate form are made for your company.",
  },
  {
    question: "What exactly does $297 per month cover?",
    answer:
      "It covers the website, writing, service and location pages, estimate form, delivery of new requests, automatic follow-up, review requests, call and form tracking, secure hosting, support, and regular improvements. Ads, paid tools from other companies, and extra work are priced and approved separately.",
  },
  {
    question: "Why is there a 12-month initial agreement?",
    answer:
      "There is no setup fee. A large amount of research, writing, design and building happens before the site launches, followed by new pages and improvements every month. The agreement spreads that work into a more affordable monthly price and gives us time to learn what customers respond to.",
  },
  {
    question: "What do we own?",
    answer:
      "Your web address, logo, photos and customer details remain yours. WebM8 provides and looks after the website while the service is active. If a handover is ever needed, the process and cost will be agreed clearly in writing.",
  },
  {
    question: "Can you connect the website to the software we already use?",
    answer:
      "Usually, yes. We can send new requests to email, Google Sheets, many customer-management systems, and moving-company software. We check your exact software before promising the connection because some companies charge for access.",
  },
  {
    question: "Do you guarantee leads or Google rankings?",
    answer:
      "No honest website company can promise a Google position or a set number of jobs. We promise to complete the agreed work, communicate clearly, and show you where calls and forms come from. Results also depend on your market, reviews, prices, visitors, and how quickly you reply to customers.",
  },
  {
    question: "How quickly can the website launch?",
    answer:
      "The first homepage preview is normally ready within a few business days after we receive what we need. The full launch date depends on the number of pages, any software connections, your feedback, and how quickly we receive photos and business details.",
  },
];

export default function MoversPage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Moving company website design",
      description: pageDescription,
      url: absoluteUrl("/movers/"),
      provider: {
        "@type": "Organization",
        name: siteName,
        url: absoluteUrl("/"),
      },
      areaServed: "United States",
      audience: {
        "@type": "BusinessAudience",
        audienceType: "Moving companies in the United States",
      },
      offers: {
        "@type": "Offer",
        price: "297",
        priceCurrency: "USD",
        description:
          "Ongoing moving-company website and growth service with no setup fee and a 12-month initial agreement.",
        url: absoluteUrl("/movers/#preview"),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MoverFunnelTracking />

      <MoverHero />
      <CredibilityStrip />
      <ConversionLeaks />
      <MoverExample />
      <ServiceStack />
      <EstimateFlow />
      <HandsOnService />
      <Process />
      <MoverPricing />
      <MoverFaq />
      <PreviewSection />

      <StickyMoverCta />
    </>
  );
}

function MoverHero() {
  return (
    <section className="relative overflow-hidden pb-18 pt-10 md:pb-24 md:pt-16">
      <AmbientBlobs variant="light" />
      <div className="container-page relative grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div>
          <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white/80 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Websites for US moving companies
          </div>
          <h1
            className="animate-rise mt-6 text-4xl font-bold leading-[1.04] tracking-tight text-ink sm:text-5xl lg:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            Turn more website visitors into{" "}
            <span className="text-brand">moving estimates.</span>
          </h1>
          <p
            className="animate-rise mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
            style={{ animationDelay: "160ms" }}
          >
            We learn about your business, write the words, build the site and
            keep improving it. Customers can quickly understand your services,
            trust your company and ask for an estimate.
          </p>
          <div
            className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "240ms" }}
          >
            <LinkButton
              href="#preview"
              size="lg"
              data-funnel-event="mover_cta_clicked"
              data-funnel-location="hero"
            >
              See My Homepage Before I Pay
              <Icon name="arrow" size={18} />
            </LinkButton>
            <LinkButton
              href="#example"
              size="lg"
              variant="ghost"
              data-funnel-event="mover_demo_clicked"
              data-funnel-location="hero"
            >
              View the mover demo
            </LinkButton>
          </div>
          <ul
            className="animate-rise mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted"
            style={{ animationDelay: "320ms" }}
          >
            {[
              "Free personalized preview",
              "No setup fee",
              "Ongoing growth included",
            ].map(
              (item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Icon name="check" size={15} className="text-accent" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <div
          className="animate-rise relative"
          style={{ animationDelay: "260ms" }}
        >
          <BrowserMockup
            palette={moverProject.palette}
            industry="Moving company demo"
            title={moverProject.title}
            siteUrl={moverProject.siteUrl}
            screenshots={moverProject.screenshots}
          />
          <div className="absolute -left-2 bottom-2 z-20 max-w-[230px] rounded-2xl border border-border bg-white p-4 shadow-card-hover sm:left-2 md:bottom-8 lg:-left-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Icon name="mail" size={18} />
              </span>
              <div>
                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Quote journey
                </p>
                <p className="mt-0.5 text-sm font-bold text-ink">
                  Built for the next step
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CredibilityStrip() {
  return (
    <section className="border-y border-border bg-white" aria-label="Core capabilities">
      <div className="container-page grid grid-cols-2 divide-x divide-y divide-border md:grid-cols-4 md:divide-y-0">
        {credibility.map((item) => (
          <div
            key={item.label}
            className="flex min-h-24 items-center gap-3 px-3 py-5 sm:px-6"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Icon name={item.icon} size={17} />
            </span>
            <span className="text-xs font-semibold leading-snug text-ink sm:text-sm">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ConversionLeaks() {
  return (
    <Section
      eyebrow="Where estimates are lost"
      title="A good-looking site can still make the phone stay quiet."
      subtitle="The page has one job: help the right customer trust your company and contact you without getting stuck or confused."
      align="center"
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {leaks.map((leak, index) => (
          <Reveal key={leak.number} delay={index * 80}>
            <article className="h-full rounded-3xl border border-border bg-white p-7 shadow-card">
              <span className="font-mono text-xs font-bold tracking-[0.18em] text-brand">
                {leak.number}
              </span>
              <h3 className="mt-5 text-xl font-bold text-ink">{leak.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{leak.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function MoverExample() {
  return (
    <Section
      id="example"
      eyebrow="Mover website demonstration"
      title="See the standard before starting a conversation."
      subtitle="This is a WebM8 demonstration—not a claimed customer result. Open it, resize it and judge the work directly."
      tone="surface"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <Reveal variant="slide-left">
          <BrowserMockup
            palette={moverProject.palette}
            industry="Moving company demo"
            title={moverProject.title}
            siteUrl={moverProject.siteUrl}
            screenshots={moverProject.screenshots}
          />
        </Reveal>
        <Reveal variant="slide-right" delay={120}>
          <Eyebrow>What to inspect</Eyebrow>
          <h3 className="mt-4 text-3xl font-bold text-ink">
            Designed around moving-day trust and quote intent.
          </h3>
          <ul className="mt-7 space-y-4">
            {moverProject.outcomes.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Icon name="check" size={14} />
                </span>
                <span className="font-medium text-ink">{item}</span>
              </li>
            ))}
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Icon name="check" size={14} />
              </span>
              <span className="font-medium text-ink">
                Responsive desktop and mobile experience
              </span>
            </li>
          </ul>
          <div className="mt-8">
            <LinkButton
              href={moverProject.siteUrl}
              target="_blank"
              rel="noreferrer"
              size="lg"
            >
              Open the live demonstration
              <Icon name="arrow" size={18} />
            </LinkButton>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function ServiceStack() {
  return (
    <Section
      id="included"
      eyebrow="Everything included"
      title="More than a website. A complete way to bring in estimate requests."
      subtitle="The pages and software connections depend on your business, but every website covers the four areas below."
      align="center"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {serviceGroups.map((group, index) => (
          <Reveal key={group.title} delay={(index % 2) * 80}>
            <article className="h-full rounded-3xl border border-border bg-white p-7 shadow-card md:p-8">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <Icon name={group.icon} size={22} />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-ink">{group.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {group.intro}
                  </p>
                </div>
              </div>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                    <Icon
                      name="check"
                      size={15}
                      className="mt-0.5 shrink-0 text-accent"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function EstimateFlow() {
  return (
    <Section
      eyebrow="From Google search to estimate request"
      title="Every step is made simple."
      subtitle="The page, estimate form, follow-up and reporting all work together."
      tone="dark"
      align="center"
    >
      <div className="grid gap-4 lg:grid-cols-4">
        {flow.map((step, index) => (
          <Reveal key={step.title} delay={index * 80}>
            <article className="relative h-full rounded-2xl border border-white/15 bg-white/5 p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-accent">
                <Icon name={step.icon} size={20} />
              </span>
              <p className="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                Step {index + 1}
              </p>
              <h3 className="mt-2 text-lg font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                {step.body}
              </p>
              {index < flow.length - 1 && (
                <span className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 items-center justify-center rounded-full bg-brand text-white lg:flex">
                  <Icon name="arrow" size={13} />
                </span>
              )}
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function HandsOnService() {
  const commitments = [
    "We research your local competitors before writing",
    "We handle the writing, design and setup",
    "You speak directly with the person doing the work",
    "We review weekly at first and keep improving every month",
    "We explain the results in plain language",
    "We limit active projects so attention stays personal",
  ];

  return (
    <Section tone="surface" className="overflow-hidden">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal variant="slide-left">
          <Eyebrow>High-touch by design</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold text-ink md:text-5xl">
            You won’t be passed between salespeople, designers and support queues.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            WebM8 accepts a limited number of active mover projects so the work
            stays direct, quick and useful for your business. You get honest
            recommendations—even when the answer is simpler than selling you
            another service.
          </p>
          <p className="mt-5 text-sm font-semibold text-ink">
            Direct inquiries: {" "}
            <a
              href="mailto:info@webm8agency.com"
              data-funnel-event="mover_email_clicked"
              data-funnel-location="high_touch"
              className="text-brand hover:text-brand-hover"
            >
              info@webm8agency.com
            </a>
          </p>
        </Reveal>
        <Reveal variant="slide-right" delay={100}>
          <div className="rounded-3xl bg-ink p-7 text-white shadow-card-hover md:p-9">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Our working commitments
            </p>
            <ul className="mt-7 space-y-4">
              {commitments.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Icon name="check" size={14} />
                  </span>
                  <span className="text-sm leading-relaxed text-white/80">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function Process() {
  return (
    <Section
      id="process"
      eyebrow="A low-risk start"
      title="See the homepage before deciding."
      subtitle="The free preview is there to make the decision easier—not to manufacture a sales call."
      align="center"
    >
      <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {process.map((step, index) => (
          <Reveal key={step.number} as="li" delay={index * 80}>
            <article className="h-full rounded-3xl border border-border bg-white p-6 shadow-card">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {step.number}
              </span>
              <h3 className="mt-5 text-lg font-bold text-ink">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </article>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

function MoverPricing() {
  const included = [
    "Custom mover website and copy",
    "Estimate form and fast delivery of new requests",
    "Service and location content every month",
    "Hosting, maintenance and support",
    "See which pages bring calls and forms",
    "Automatic follow-up and review requests",
    "Google Business Profile support",
    "Useful website improvements every month",
  ];

  return (
    <Section
      id="pricing"
      eyebrow="Straightforward terms"
      title="A serious website without a large upfront invoice."
      subtitle="The work starts with a free homepage preview. The paid service begins only if you approve it."
      tone="tint"
      align="center"
    >
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal variant="slide-left">
          <article className="relative overflow-hidden rounded-3xl border-2 border-brand bg-white p-7 shadow-cta md:p-9">
            <div className="absolute right-0 top-0 rounded-bl-2xl bg-brand px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white">
              Complete ongoing service
            </div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Moving Company Website Service
            </p>
            <div className="mt-5 flex items-end gap-2">
              <span className="text-5xl font-bold tracking-tight text-ink">
                $297
              </span>
              <span className="pb-1 text-muted">/ month</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-accent">
              $0 setup · 12-month initial agreement
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                  <Icon
                    name="check"
                    size={15}
                    className="mt-0.5 shrink-0 text-accent"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <LinkButton
                href="#preview"
                size="lg"
                className="w-full"
                data-funnel-event="mover_cta_clicked"
                data-funnel-location="pricing"
              >
                Request My Free Preview
                <Icon name="arrow" size={18} />
              </LinkButton>
            </div>
          </article>
        </Reveal>

        <Reveal variant="slide-right" delay={100}>
          <article className="h-full rounded-3xl border border-border bg-white p-7 shadow-card md:p-9">
            <h3 className="text-2xl font-bold text-ink">Clear from day one</h3>
            <dl className="mt-7 divide-y divide-border">
              <Term
                title="Before approval"
                body="Review the homepage preview. If it is not right, you owe nothing for it."
              />
              <Term
                title="What continues every month"
                body="WebM8 keeps the site online, adds agreed pages for services and towns, checks which pages bring calls, and looks after estimate and review requests."
              />
              <Term
                title="Commitment"
                body="The service starts with a 12-month agreement because there is no setup fee and a large amount of work happens before launch. It continues one month at a time after the first year."
              />
              <Term
                title="What stays yours"
                body="Your web address, logo, supplied photos and customer details remain yours. WebM8 provides and looks after the website while the service is active."
              />
            </dl>
          </article>
        </Reveal>
      </div>
      <Reveal delay={160}>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-muted">
          Ads, paid tools from other companies and large pieces of extra work
          are not hidden in the monthly price. We tell you about any extra cost
          before work begins. No website company can honestly promise a Google
          position or a fixed number of booked jobs.
        </p>
      </Reveal>
    </Section>
  );
}

function Term({ title, body }: { title: string; body: string }) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <dt className="text-sm font-bold text-ink">{title}</dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-muted">{body}</dd>
    </div>
  );
}

function MoverFaq() {
  return (
    <Section
      id="faq"
      eyebrow="Questions, answered plainly"
      title="Know exactly what you’re considering."
      align="center"
      tone="surface"
    >
      <div className="mx-auto max-w-4xl divide-y divide-border rounded-3xl border border-border bg-white px-6 shadow-card md:px-8">
        {faqs.map((faq) => (
          <details key={faq.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold text-ink">
              {faq.question}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink/5 text-lg text-brand transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="max-w-3xl pt-3 text-sm leading-relaxed text-muted">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function PreviewSection() {
  const deliverables = [
    "A homepage preview made for your company",
    "Desktop and mobile presentation",
    "An easier way for customers to ask for an estimate",
    "Clear recommendations without technical language",
    "No obligation to continue",
  ];

  return (
    <section id="preview" className="relative overflow-hidden py-20 md:py-28">
      <AmbientBlobs variant="light" />
      <div className="container-page relative grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
        <Reveal variant="slide-left">
          <Eyebrow>Free personalized preview</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold text-ink md:text-5xl">
            See what WebM8 would build for your moving company.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Tell us about the business. We’ll first confirm that the project is
            a good fit, then research your market and prepare a homepage preview
            you can judge before paying anything.
          </p>
          <ul className="mt-8 space-y-4">
            {deliverables.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Icon name="check" size={14} />
                </span>
                <span className="text-sm font-medium text-ink">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-2xl border border-brand/15 bg-brand/5 p-5">
            <p className="text-sm font-bold text-ink">Already know what you need?</p>
            <p className="mt-1.5 text-sm text-muted">
              Email{" "}
              <a
                href="mailto:info@webm8agency.com"
                data-funnel-event="mover_email_clicked"
                data-funnel-location="preview"
                className="font-semibold text-brand hover:text-brand-hover"
              >
                info@webm8agency.com
              </a>{" "}
              and we’ll reply within one business day.
            </p>
          </div>
        </Reveal>
        <Reveal variant="slide-right" delay={100}>
          <MoverPreviewForm />
        </Reveal>
      </div>
    </section>
  );
}
