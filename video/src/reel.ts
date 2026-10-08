/**
 * What the showreel says and shows. The six sites play in this order (the two
 * clinic directions kept apart); their names and industries come from the
 * site's own `projects`, so a rename there reaches the next render.
 */
import { projects } from "../../lib/site.ts";

export const reelSlugs = [
  "chibauchi-atelier",
  "aesthetic-nacre",
  "allen-fitness",
  "stitch-house",
  "ideal-baby",
  "aesthetic-veil",
] as const;

export type ReelSlug = (typeof reelSlugs)[number];

export type ReelProject = {
  slug: ReelSlug;
  name: string;
  industry: string;
  /** Shown in the browser frame's address bar. */
  host: string;
};

export function reelProjects(): ReelProject[] {
  return reelSlugs.map((slug) => {
    const project = projects.find((p) => p.slug === slug);
    if (!project) throw new Error(`No project "${slug}" in lib/site.ts`);
    return {
      slug,
      name: project.name,
      industry: project.industry,
      host: project.siteUrl ? new URL(project.siteUrl).host : "",
    };
  });
}

export const copy = {
  hook: ["Your business.", "Online.", "Done right."],
  header: "Demo sites by WebM8",
  deck: "Built for phones first.",
  endHeadline: "Want one?",
  endButton: "Get your free demo",
  endAddress: "webm8agency.com/free-demo",
} as const;
