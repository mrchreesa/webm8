import type { Metadata } from "next";
import {
  shareCards,
  shareImagePath,
  shareImageSize,
  shareImageType,
  type ShareCardName,
} from "./shareCards.ts";

export const siteUrl = "https://www.webm8agency.com";

export const siteName = "WebM8";

export const defaultTitle =
  "WebM8 | Websites for Local Businesses That Want More Customers";

export const defaultDescription =
  "WebM8 builds websites for local businesses in the US and UK that turn local searches into calls, bookings and quote requests. Start with a free website demo.";

export const socialDescription =
  "Websites for local businesses in the US and UK. More calls, more bookings, more customers. Start with a free personalised website demo.";

/**
 * The routes in the sitemap. Each page's title, description and share card
 * live in its own createPageMetadata call.
 */
export const indexableRoutes = [
  { path: "/", priority: 1 },
  { path: "/work/", priority: 0.8 },
  { path: "/pricing/", priority: 0.9 },
  { path: "/movers/", priority: 0.9 },
  { path: "/free-demo/", priority: 0.9 },
  { path: "/about/", priority: 0.7 },
  { path: "/contact/", priority: 0.8 },
  { path: "/privacy/", priority: 0.3 },
] as const;

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

/** The og:image (and Twitter card image) for one of lib/shareCards.ts's cards. */
export function shareImage(name: ShareCardName) {
  return {
    url: shareImagePath(name),
    ...shareImageSize,
    type: shareImageType,
    alt: shareCards[name].alt,
  };
}

export function createPageMetadata({
  title,
  description,
  path,
  shareCard = "home",
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  /** The picture shown when the page is shared (lib/shareCards.ts). */
  shareCard?: ShareCardName;
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const image = shareImage(shareCard);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
