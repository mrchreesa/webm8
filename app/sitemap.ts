import type { MetadataRoute } from "next";
import { absoluteUrl, indexableRoutes } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return indexableRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    // Omit lastmod until we track actual editorial changes for each page.
    changeFrequency: "monthly",
    priority: route.priority,
  }));
}
