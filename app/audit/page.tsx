import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { AuditForm } from "@/components/forms/AuditForm";
import { Icon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { auditChecklist } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Free Website Audit — See what's costing you calls",
  description:
    "Request a free website audit. We review mobile experience, clarity of services, trust signals, visibility, and lead tracking, then send a short action plan.",
  path: "/audit/",
});

const timeline = [
  {
    number: "01",
    title: "Request",
    body: "Send us your site and a note on what feels weak today.",
  },
  {
    number: "02",
    title: "Review",
    body: "We check mobile UX, clarity, speed, SEO basics, and trust.",
  },
  {
    number: "03",
    title: "Action plan",
    body: "You get a short PDF and video with the changes that matter most.",
  },
];

export default function AuditPage() {
  return (
    <>
      <PageHero
        eyebrow="Free website audit"
        title={
          <>
            See What&apos;s Costing You{" "}
            <span className="text-brand">Calls &amp; Bookings</span>
          </>
        }
        subtitle="Get a free website audit showing how your current website can be improved to bring in more real customers."
      />

      <section className="py-16 md:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <Reveal>
            <Eyebrow>What you&apos;ll get</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold text-ink md:text-4xl">
              A clear, owner-friendly audit — no tech jargon
            </h2>
            <p className="mt-4 text-lg text-muted">
              We look at your site the way a customer would, then point out the
              small changes that usually produce the biggest jump in calls,
              bookings, and enquiries.
            </p>

            <ul className="mt-8 grid gap-3">
              {auditChecklist.map((item, i) => (
                <Reveal
                  key={item}
                  as="li"
                  delay={i * 60}
                  className="flex items-start gap-3 rounded-xl border border-border bg-white p-4 text-sm text-ink"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Icon name="check" size={14} />
                  </span>
                  <span className="font-medium">{item}</span>
                </Reveal>
              ))}
            </ul>

            <div className="mt-10">
              <Eyebrow>How it works</Eyebrow>
              <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                {timeline.map((step, i) => (
                  <Reveal
                    key={step.number}
                    as="li"
                    delay={i * 90}
                    className="rounded-2xl border border-border bg-white p-5"
                  >
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                      {step.number}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted">{step.body}</p>
                  </Reveal>
                ))}
              </ol>
            </div>
          </Reveal>

          <Reveal variant="slide-right" delay={150}>
            <AuditForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
