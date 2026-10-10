import type { Metadata } from "next";
import { Funnel_Display, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WebsiteAnalytics } from "@/components/analytics/WebsiteAnalytics";
import { brand, intakeEmail, plans, projects } from "@/lib/site";
import {
  defaultDescription,
  defaultTitle,
  shareImage,
  siteName,
  siteUrl,
  socialDescription,
} from "@/lib/seo";

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

const funnelDisplay = Funnel_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-funnel-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | WebM8",
  },
  description: defaultDescription,
  applicationName: siteName,
  verification: { google: "ztwEL2eGG-2IbChblPqQBzN4VOCxTSfzNvPSJGJUX3s", other: { "msvalidate.01": "6BCC2A55BA367C353107629F00BB421A" } },
  openGraph: {
    title: defaultTitle,
    description: socialDescription,
    url: siteUrl,
    siteName,
    type: "website",
    images: [shareImage("home")],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: socialDescription,
    images: [shareImage("home")],
  },
  icons: {
    icon: [
      {
        url: "/mascot-icon.png",
        type: "image/png",
        sizes: "64x64",
      },
      // Google's search results want a favicon a multiple of 48px square.
      {
        url: "/mascot-icon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
    ],
    apple: [
      {
        url: "/mascot-apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
    shortcut: "/mascot-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${funnelDisplay.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased">
        <StructuredData />
        <WebsiteAnalytics />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function StructuredData() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/mascot-512.png`,
        width: 512,
        height: 512,
      },
      image: `${siteUrl}/mascot-512.png`,
      email: intakeEmail,
      description: defaultDescription,
      slogan: brand.positioning,
      areaServed: ["United States", "United Kingdom"],
      contactPoint: {
        "@type": "ContactPoint",
        email: intakeEmail,
        contactType: "customer enquiries",
        areaServed: ["US", "GB"],
        availableLanguage: "en",
      },
      knowsAbout: [
        "local business website design",
        "conversion-focused web design",
        "mobile-first websites",
        "local SEO setup",
        "lead tracking",
        "personalised website demos",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      url: siteUrl,
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      about: {
        "@id": `${siteUrl}/#website-design-service`,
      },
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${siteUrl}/#website-design-service`,
      name: "Website design for local businesses",
      provider: {
        "@id": `${siteUrl}/#organization`,
      },
      areaServed: ["United States", "United Kingdom"],
      audience: {
        "@type": "BusinessAudience",
        audienceType:
          "Local businesses that rely on calls, bookings, quote requests, and enquiries",
      },
      serviceType: "Web design and local business website optimization",
      description: defaultDescription,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "WebM8 monthly website plans",
        itemListElement: plans.map((plan) => ({
          "@type": "Offer",
          name: `${plan.name} website plan`,
          description: plan.summary,
          url: `${siteUrl}/contact/`,
          itemOffered: {
            "@type": "Service",
            name: plan.name,
            description: plan.features.join(", "),
          },
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${siteUrl}/work/#portfolio`,
      name: "WebM8 website portfolio examples",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: project.title,
          description: project.description,
          about: project.industry,
          url: project.siteUrl,
        },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
