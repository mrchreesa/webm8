import type { Metadata } from "next";
import { DemoForm } from "@/components/forms/DemoForm";
import { PageHero } from "@/components/ui/PageHero";
import { createPageMetadata } from "@/lib/seo";
import { demoSteps } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Free Personalised Website Demo",
  description:
    "Tell us about your business and we'll design a homepage for you, with your name and services on it, and show it to you on a short call. Free, no obligation.",
  path: "/demo/",
});

export default function DemoPage() {
  return (
    <>
      <PageHero
        title="Your free personalised website demo"
        subtitle="Tell us about your business and we'll design a homepage for you, with your name and services on it, then show it to you on a short video call. Free, with no obligation."
      />

      <section className="py-16 md:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold text-ink md:text-4xl">How it works</h2>
            <ol className="mt-8 grid gap-4">
              {demoSteps.map((step, index) => (
                <li key={step.title} className="flex gap-4 rounded-2xl border border-border bg-white p-5">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand font-mono text-sm font-semibold text-brand-ink">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-muted">
              No payment. No obligation. We reply within one business day.
            </p>
          </div>
          <DemoForm />
        </div>
      </section>
    </>
  );
}
