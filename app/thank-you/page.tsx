import type { Metadata } from "next";
import { ThankYouCall } from "@/components/thank-you/ThankYouCall";
import { ThankYouHero } from "@/components/thank-you/ThankYouHero";
import { ThankYouSteps } from "@/components/thank-you/ThankYouSteps";
import { ThankYouTracking } from "@/components/thank-you/ThankYouTracking";
import { ThankYouTrust } from "@/components/thank-you/ThankYouTrust";
import { ThankYouWork } from "@/components/thank-you/ThankYouWork";
import { createPageMetadata } from "@/lib/seo";

/**
 * Where Meta Instant Form leads land after submitting. They have already
 * given us their details, so this page confirms, shows the work and prepares
 * them for our call. It never asks for their details again.
 *
 * Not indexable: it is only meaningful straight after a submission.
 */
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Thanks, we’ve received your details",
    description:
      "We’ll call you shortly about your business and your free website demo. In the meantime, see some of the websites WebM8 has built.",
    path: "/thank-you/",
  }),
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <>
      <ThankYouHero />
      <ThankYouWork />
      <ThankYouSteps />
      <ThankYouTrust />
      <ThankYouCall />
      <ThankYouTracking />
    </>
  );
}
