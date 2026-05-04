import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { brand, intakeEmail, plans, projects } from "@/lib/site";
import {
  defaultDescription,
  defaultTitle,
  ogImage,
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | WebM8",
  },
  description: defaultDescription,
  openGraph: {
    title: defaultTitle,
    description: socialDescription,
    url: siteUrl,
    siteName,
    type: "website",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: socialDescription,
    images: [ogImage.url],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <StructuredData />
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
      logo: `${siteUrl}/favicon.svg`,
      email: intakeEmail,
      description: defaultDescription,
      slogan: brand.positioning,
      areaServed: "United States",
      contactPoint: {
        "@type": "ContactPoint",
        email: intakeEmail,
        contactType: "customer enquiries",
        areaServed: "US",
        availableLanguage: "en",
      },
      knowsAbout: [
        "local business website design",
        "conversion-focused web design",
        "mobile-first websites",
        "local SEO setup",
        "lead tracking",
        "website audits",
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
      areaServed: "United States",
      audience: {
        "@type": "BusinessAudience",
        audienceType:
          "US local businesses that rely on calls, bookings, quote requests, and enquiries",
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
          price: String(plan.price),
          priceCurrency: "USD",
          url: `${siteUrl}/pricing/`,
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
