import type { Metadata } from "next";
import { DemoCtaButton } from "@/components/demo/DemoCtaButton";
import { DemoFaq } from "@/components/demo/DemoFaq";
import { DemoHero } from "@/components/demo/DemoHero";
import { DemoNext } from "@/components/demo/DemoNext";
import { DemoPromise } from "@/components/demo/DemoPromise";
import { DemoRequest } from "@/components/demo/DemoRequest";
import { Icon } from "@/components/ui/Icon";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Free Personalised Website Demo",
  description:
    "Tell us about your business and we'll design its homepage, free. We call the same day, then show you the demo within 48 hours. No payment, no obligation.",
  path: "/free-demo/",
  shareCard: "free-demo",
});

/**
 * Where every "Get my free demo" button on the site leads. The hero is the
 * same as /demo/'s, with a button down to the form beneath it. The form is the
 * page's only call to action, so DemoClosing is not used here. Meta Instant
 * Form leads land on /demo/, which has no form.
 */
export default function FreeDemoPage() {
  return (
    <>
      <DemoHero autoPlay={false} line="We design your homepage for free and show it to you within 48 hours of our call.">
        <DemoCtaButton placement="hero" size="lg" className="mt-5 md:mt-7">
          Get my free demo
          <Icon name="arrow" size={18} className="rotate-90" aria-hidden />
        </DemoCtaButton>
      </DemoHero>
      <DemoRequest />
      <DemoNext />
      <DemoPromise />
      <DemoFaq />
    </>
  );
}
