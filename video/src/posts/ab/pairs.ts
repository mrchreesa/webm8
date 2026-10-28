/**
 * "Which would you book? A or B": two designs WebM8 made for the same
 * business, side by side, and the comments decide. Each pair is two projects
 * in lib/site.ts; the words on screen describe each design the way its own
 * project title does.
 */
import { projects } from "../../../../lib/site.ts";
import type { ReelSlug } from "../../reel.ts";
import type { EndCardVariant } from "../../kit/endCards.ts";

export type Side = { slug: ReelSlug; look: string };

export type Pair = {
  hook: [string, string];
  question: string;
  a: Side;
  b: Side;
  versus: { headline: string; sub: string };
  end: { variant: EndCardVariant; headline: string; sub: string };
};

export const pairs = {
  "veil-nacre": {
    hook: ["Same clinic.", "Two websites."],
    question: "Which would you book?",
    // "Light, photographic site for a doctor-led clinic" and "Dark, sensorial site for a doctor-led clinic".
    a: { slug: "aesthetic-veil", look: "Light and photographic" },
    b: { slug: "aesthetic-nacre", look: "Dark and sensorial" },
    versus: { headline: "A or B?", sub: "Tell us in the comments" },
    end: { variant: "follow", headline: "Follow for part two", sub: "Why each design works" },
  },
} satisfies Record<string, Pair>;

export type PairId = keyof typeof pairs;

export function projectTitle(slug: string): string {
  const project = projects.find((p) => p.slug === slug);
  if (!project) throw new Error(`No project "${slug}" in lib/site.ts`);
  return project.title;
}
