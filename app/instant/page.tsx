import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InstantSignup } from "@/components/instant/InstantSignup";
import { InstantDay } from "@/components/instant/InstantDay";
import { InstantExamples } from "@/components/instant/InstantExamples";
import { InstantFaq } from "@/components/instant/InstantFaq";
import { InstantIncluded } from "@/components/instant/InstantIncluded";
import { createPageMetadata } from "@/lib/seo";

// Only public, deployment-scoped content belongs in this cached page.
// Cookie-owned signup/billing state is restored by the private session API.
// Fail the build if request-specific data is ever added here.
export const dynamic = "error";
const instantSite = process.env.INSTANT_WEBSITES_SITE === "1";
const pageMetadata = createPageMetadata({ title: process.env.INSTANT_BILLING_ENABLED === "1" ? "Instant Websites — start your free trial" : "Instant Websites — signup preview", description: "A business website, built and looked after by WebM8. 10 days free, then £39/month.", path: "/instant/" });
export const metadata: Metadata = {
  ...pageMetadata,
  ...(instantSite ? {
    alternates: { canonical: "https://instant.webm8agency.com/" },
    openGraph: { ...pageMetadata.openGraph, url: "https://instant.webm8agency.com/" },
  } : {}),
  robots: { index: false, follow: false },
};

export default function InstantPage() {
  // A prototype must not become a live offer through an unrelated deployment.
  if (process.env.NODE_ENV === "production" && process.env.INSTANT_WEBSITES_PREVIEW !== "1") notFound();
  const billing = process.env.INSTANT_BILLING_ENABLED === "1";
  return <><InstantSignup billing={billing} publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""} testMode={billing && process.env.INSTANT_STRIPE_MODE === "test"} /><InstantDay /><InstantExamples /><InstantIncluded /><InstantFaq /></>;
}
