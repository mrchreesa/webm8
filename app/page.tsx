import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { ValueCards } from "@/components/home/ValueCards";
import { WhatYouGet } from "@/components/home/WhatYouGet";
import { Pricing } from "@/components/home/Pricing";
import { Portfolio } from "@/components/home/Portfolio";
import { Process } from "@/components/home/Process";
import { AuditTeaser } from "@/components/home/AuditTeaser";
import { Testimonials } from "@/components/home/Testimonials";
import { FinalCta } from "@/components/home/FinalCta";
import {
  createPageMetadata,
  defaultDescription,
  defaultTitle,
} from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: defaultTitle,
  description: defaultDescription,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ValueCards />
      <WhatYouGet />
      <Pricing />
      <Portfolio limit={3} />
      <Process />
      <AuditTeaser />
      <Testimonials />
      <FinalCta />
    </>
  );
}
