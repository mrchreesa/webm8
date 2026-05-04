import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { intakeEmail } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Contact — Start a website project",
  description:
    "Get in touch to start a new website, switch plans, or ask a question. We reply within one business day.",
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Start a project.{" "}
            <span className="text-brand">
              We reply within one business day.
            </span>
          </>
        }
        subtitle="Choose a plan, ask a question, or send us details about what you want your website to do."
      />

      <section className="py-16 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal>
            <aside className="shadow-card rounded-3xl border border-border bg-white p-6 md:p-8">
              <h2 className="text-2xl font-bold tracking-tight text-ink">
                Direct contact
              </h2>
              <p className="mt-2 text-sm text-muted">
                Prefer to email or talk first? Use the details below.
              </p>

              <ul className="mt-6 space-y-5">
                <InfoRow
                  icon="mail"
                  tone="brand"
                  label="Email"
                  value={
                    <a
                      href={`mailto:${intakeEmail}`}
                      className="text-sm font-semibold text-ink transition-colors hover:text-brand"
                    >
                      {intakeEmail}
                    </a>
                  }
                />
                <InfoRow
                  icon="calendar"
                  tone="accent"
                  label="Response time"
                  value="Within 1 business day"
                />
                <InfoRow
                  icon="map"
                  tone="ink"
                  label="Where we work"
                  value="United States · Remote-first"
                />
              </ul>

              <div className="mt-8 rounded-2xl bg-bg p-5 text-sm leading-relaxed text-muted">
                <p className="font-semibold text-ink">What happens next</p>
                <p className="mt-2">
                  We review your info, send a short reply with next steps, and
                  — if it&apos;s a fit — book a quick call to plan the build.
                </p>
              </div>
            </aside>
          </Reveal>

          <Reveal variant="slide-right" delay={120}>
            <h2 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
              Send us a message
            </h2>
            <p className="mt-2 text-base text-muted">
              Tell us a little about your business and what you want the
              website to do.
            </p>
            <div className="mt-6">
              <Suspense
                fallback={
                  <div className="shadow-card h-96 rounded-3xl border border-border bg-white" />
                }
              >
                <ContactForm />
              </Suspense>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function InfoRow({
  icon,
  tone,
  label,
  value,
}: {
  icon: "mail" | "calendar" | "map";
  tone: "brand" | "accent" | "ink";
  label: string;
  value: React.ReactNode;
}) {
  const iconBg =
    tone === "brand"
      ? "bg-brand/10 text-brand"
      : tone === "accent"
        ? "bg-accent/10 text-accent"
        : "bg-ink/5 text-ink";
  return (
    <li className="flex items-start gap-3">
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
      >
        <Icon name={icon} size={18} />
      </span>
      <div>
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          {label}
        </div>
        <div className="mt-0.5 text-sm font-semibold text-ink">{value}</div>
      </div>
    </li>
  );
}
