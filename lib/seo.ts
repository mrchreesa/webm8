import type { Metadata } from "next";

export const siteUrl = "https://www.webm8agency.com";

export const siteName = "WebM8";

export const defaultTitle =
  "WebM8 | Websites for Local Businesses That Want More Customers";

export const defaultDescription =
  "WebM8 builds high-converting websites for US local businesses. Professional, mobile-first, conversion-focused sites that turn visitors into calls, bookings, and paying customers. Get a fast estimate in one business day.";

export const socialDescription =
  "High-converting websites for US local businesses. More calls, more bookings, more customers. Get a fast estimate in one business day.";

export const ogImage = {
  url: "/og-image.svg",
  width: 1200,
  height: 630,
  alt: "WebM8 websites for local businesses",
} as const;

export const indexableRoutes = [
  {
    path: "/",
    title: defaultTitle,
    description: defaultDescription,
    priority: 1,
  },
  {
    path: "/work/",
    title: "Our Work - Websites Built for Local Businesses",
    description:
      "Browse live website examples built by WebM8 for restaurants, cleaning companies, removals businesses, car rental brands, and travel agencies.",
    priority: 0.8,
  },
  {
    path: "/pricing/",
    title: "Pricing - Get a fast estimate",
    description:
      "Every WebM8 project is quoted to the business. Tell us what you need and we'll send a straight number within one business day. No large upfront website cost.",
    priority: 0.9,
  },
  {
    path: "/audit/",
    title: "Free Website Audit - See what's costing you calls",
    description:
      "Request a free website audit. We review mobile experience, clarity of services, trust signals, visibility, and lead tracking, then send a short action plan.",
    priority: 0.9,
  },
  {
    path: "/about/",
    title: "About - Websites built for local business growth",
    description:
      "WebM8 is a web design agency focused on US local businesses. We build professional, conversion-focused websites that help owners win more calls, bookings, and customers.",
    priority: 0.7,
  },
  {
    path: "/contact/",
    title: "Contact - Start a website project",
    description:
      "Get in touch for a fast estimate on a new website, switch plans, or ask a question. We reply within one business day.",
    priority: 0.8,
  },
] as const;

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(path);

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
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}
