import type { Metadata } from "next";
import { MoverBenefits } from "@/components/movers/MoverBenefits";
import { MoverDemo } from "@/components/movers/MoverDemo";
import { MoverFaq, moverFaqs } from "@/components/movers/MoverFaq";
import { MoverFunnelTracking } from "@/components/movers/MoverFunnelTracking";
import { MoverHero } from "@/components/movers/MoverHero";
import { MoverPricing } from "@/components/movers/MoverPricing";
import { MoverProof } from "@/components/movers/MoverProof";
import { PlanSelectionProvider } from "@/components/movers/PlanSelection";
import { ReviewExpectations } from "@/components/movers/ReviewExpectations";
import { ReviewFormSection } from "@/components/movers/ReviewFormSection";
import { StickyMoverCta } from "@/components/movers/StickyMoverCta";
import { moverPlans } from "@/lib/movers";
import { absoluteUrl, createPageMetadata, siteName } from "@/lib/seo";

const pageTitle = "Moving Company Websites, Built and Managed From $197/month";
const pageDescription =
  "WebM8 builds and manages websites for US moving companies that make requesting an estimate simple. Two plans, $0 setup, no minimum contract term. Book a free 10-minute website review.";

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/movers/",
});

export default function MoversPage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Moving company website design and management",
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
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "WebM8 moving company website plans",
        itemListElement: moverPlans.map((plan) => ({
          "@type": "Offer",
          name: `${plan.name} — ${plan.label}`,
          description: plan.summary,
          url: absoluteUrl("/movers/#pricing"),
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: String(plan.monthlyPrice),
            priceCurrency: "USD",
            unitCode: "MON",
            billingIncrement: 1,
          },
          itemOffered: {
            "@type": "Service",
            name: `${plan.name} moving company website plan`,
            description: plan.features.join(". "),
          },
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: moverFaqs.map((faq) => ({
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

      <PlanSelectionProvider>
        <MoverHero />
        <MoverDemo />
        <MoverBenefits />
        <MoverPricing />
        <MoverProof />
        <ReviewExpectations />
        <MoverFaq />
        <ReviewFormSection />
        <StickyMoverCta />
      </PlanSelectionProvider>
    </>
  );
}
