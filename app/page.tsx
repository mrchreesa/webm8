import type { Metadata } from "next";
import { DemoClosing } from "@/components/demo/DemoClosing";
import { EightArms } from "@/components/home/EightArms";
import { Plans } from "@/components/home/Plans";
import { HomeStory } from "@/components/home/story3d/HomeStory";
import { Voices } from "@/components/home/Voices";
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
      <HomeStory />
      <EightArms />
      <Plans />
      <Voices />
      <DemoClosing />
    </>
  );
}
