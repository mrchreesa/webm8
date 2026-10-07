import type { Metadata } from "next";
import { DemoFaq } from "@/components/demo/DemoFaq";
import { DemoHero } from "@/components/demo/DemoHero";
import { DemoNext } from "@/components/demo/DemoNext";
import { DemoPromise } from "@/components/demo/DemoPromise";
import { createPageMetadata } from "@/lib/seo";

/**
 * Where Meta Instant Form leads land. They have already sent their details in
 * Meta, so the page never asks again: it shows the real demos and explains
 * what happens next. Visitors from the site go to /free-demo/ instead.
 *
 * Not indexable and not in the nav: it is only for people coming from the ads.
 */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Your Free Personalised Website Demo",
    description:
      "We’ll call you shortly about your business and show you your demo within 48 hours of that call. No payment, no obligation.",
    path: "/demo/",
    shareCard: "free-demo",
  }),
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return (
    <>
      <DemoHero line="We’ll call you shortly. Your demo 48 hours after our call." />
      <DemoNext />
      <DemoPromise />
      <DemoFaq />
    </>
  );
}
