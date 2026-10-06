import type { Metadata } from "next";
import { DemoFaq } from "@/components/demo/DemoFaq";
import { DemoHero } from "@/components/demo/DemoHero";
import { DemoNext } from "@/components/demo/DemoNext";
import { DemoPromise } from "@/components/demo/DemoPromise";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Free Personalised Website Demo",
  description:
    "Tell us about your business and we'll design a homepage for it, free. We call you the same day and show you your demo within 48 hours of that call. No payment, no obligation.",
  path: "/demo/",
});

/**
 * Where Meta ad visitors land for the Free Personalised Website Demo. The
 * form is the page's only call to action, so DemoClosing is not used here.
 */
export default function DemoPage() {
  return (
    <>
      <DemoHero />
      <DemoNext />
      <DemoPromise />
      <DemoFaq />
    </>
  );
}
