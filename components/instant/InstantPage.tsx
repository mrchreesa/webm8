import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InstantSignup } from "@/components/instant/InstantSignup";
import { InstantDay } from "@/components/instant/InstantDay";
import { InstantExamples } from "@/components/instant/InstantExamples";
import { InstantFaq } from "@/components/instant/InstantFaq";
import { InstantMarketProvider } from "@/components/instant/InstantMarket";
import type { InstantMarket } from "@/lib/instantPricing";
import { createPageMetadata } from "@/lib/seo";

// Only public, deployment-scoped content belongs in this cached page.
// Cookie-owned signup/billing state is restored by the private session API.
// Fail the build if request-specific data is ever added here.

const instantSite = process.env.INSTANT_WEBSITES_SITE === "1";
export function instantMetadata(): Metadata {
  const pageMetadata = createPageMetadata({ title: process.env.INSTANT_BILLING_ENABLED === "1" ? "Instant Websites — start your free trial" : "Instant Websites — signup preview", description: "A business website, built and managed by WebM8. 10 days free, no setup fee, cancel anytime.", path: "/instant/" });
  return {
  ...pageMetadata,
  ...(instantSite ? {
    alternates: { canonical: "https://instant.webm8agency.com/" },
    openGraph: { ...pageMetadata.openGraph, url: "https://instant.webm8agency.com/" },
  } : {}),
  robots: { index: false, follow: false },
  };
}

export function InstantContent({ market }: { market: InstantMarket }) {
  // A prototype must not become a live offer through an unrelated deployment.
  if (process.env.NODE_ENV === "production" && process.env.INSTANT_WEBSITES_PREVIEW !== "1") notFound();
  const billing = process.env.INSTANT_BILLING_ENABLED === "1";
  return <InstantMarketProvider initialMarket={market}><div lang="en-US"><InstantSignup turnstileSiteKey={process.env.TURNSTILE_SITE_KEY || ""} billing={billing} saveDrafts={process.env.INSTANT_DRAFTS_ENABLED === "1"} publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""} testMode={billing && process.env.INSTANT_STRIPE_MODE === "test"} /><InstantDay /><InstantExamples /><InstantFaq /></div></InstantMarketProvider>;
}
