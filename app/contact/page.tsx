import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ContactForm } from "@/components/forms/ContactForm";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { intakeEmail } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Contact Us: Start a Website Project",
  description:
    "Need a website estimate or have a question? Contact WebM8. We reply within one business day, with no sales call required for an estimate.",
  path: "/contact/",
  shareCard: "contact",
});

export default function ContactPage() {
  return (
    <section aria-labelledby="contact-title" className="py-10 sm:py-14 lg:py-20">
      <div className="container-page grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-10">
        <header className="max-w-lg lg:pt-4">
          <Eyebrow>Contact WebM8</Eyebrow>
          <h1
            id="contact-title"
            className="mt-4 text-[clamp(2.5rem,5vw,4rem)] leading-[1.04] font-bold tracking-tight text-ink"
          >
            Let’s talk about <span className="text-link">your website.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
            Need an estimate or have a question? Tell us what you need. We’ll
            reply within one business day.
          </p>
        </header>

        <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Suspense
            fallback={
              <div className="shadow-card min-h-[44rem] rounded-3xl border border-border bg-white p-6 md:p-8">
                <h2 className="text-2xl font-bold tracking-tight text-ink">
                  Send us a message
                </h2>
                <p role="status" className="mt-3 text-sm text-muted">
                  Loading the enquiry form…
                </p>
              </div>
            }
          >
            <ContactForm />
          </Suspense>
        </div>

        <aside
          aria-label="Other ways to get started"
          data-analytics-section="Contact details"
          className="max-w-lg space-y-7 lg:col-start-1 lg:row-start-2"
        >
          <div className="border-l-2 border-border pl-5">
            <h2 className="text-xl font-bold text-ink">A clear price, by email.</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              For an estimate, tell us what your business does and what you need
              from your website. We’ll send a clear price within one business
              day. No sales call needed.
            </p>
          </div>

          <div className="border-t border-border pt-7">
            <h2 className="text-xl font-bold text-ink">Prefer email?</h2>
            <a
              data-analytics-id="Email WebM8"
              href={`mailto:${intakeEmail}`}
              className="mt-2 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-link underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              <Icon name="mail" size={18} aria-hidden />
              {intakeEmail}
            </a>
          </div>

          <div className="border-t border-border pt-7">
            <h2 className="text-xl font-bold text-ink">Want to see a design first?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Start with a free custom website demo for your business.
            </p>
            <Link
              href="/free-demo/"
              data-analytics-id="Explore the free demo"
              className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-link underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Explore the free demo
              <Icon name="arrow" size={16} aria-hidden />
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
