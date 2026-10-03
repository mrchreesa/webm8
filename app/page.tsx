import type { Metadata } from "next";
import { DemoClosing } from "@/components/demo/DemoClosing";
import { DemoPrefillProvider } from "@/components/demo/DemoPrefill";
import { EightArms } from "@/components/home/EightArms";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Plans } from "@/components/home/Plans";
import { StoryHero } from "@/components/home/story/StoryHero";
import { Voices } from "@/components/home/Voices";
import { WorkDeck } from "@/components/home/WorkDeck";
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
    <DemoPrefillProvider>
      <StoryHero />
      <WorkDeck />
      <EightArms />
      <HowItWorks />
      <Plans />
      <Voices />
      <DemoClosing />
    </DemoPrefillProvider>
  );
}
