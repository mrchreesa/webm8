import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { WhatYouGet } from "@/components/home/WhatYouGet";
import { Pricing } from "@/components/home/Pricing";
import { Portfolio } from "@/components/home/Portfolio";
import { HowItWorks } from "@/components/home/HowItWorks";
import { AuditTeaser } from "@/components/home/AuditTeaser";
import { Testimonials } from "@/components/home/Testimonials";
import { DemoClosing } from "@/components/demo/DemoClosing";
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
      <WhatYouGet />
      <Portfolio limit={3} />
      <Pricing />
      <HowItWorks />
      <AuditTeaser />
      <Testimonials />
      <DemoClosing />
    </>
  );
}
