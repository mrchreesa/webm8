import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
  metadataBase: new URL("https://webm8.co"),
  title: {
    default: "WebM8 | Websites for Local Businesses That Want More Customers",
    template: "%s | WebM8",
  },
  description:
    "WebM8 builds high-converting websites for US local businesses. Professional, mobile-first, conversion-focused sites that turn visitors into calls, bookings, and paying customers. Plans from $197/month.",
  openGraph: {
    title: "WebM8 | Websites for Local Businesses That Want More Customers",
    description:
      "High-converting websites for US local businesses. More calls, more bookings, more customers. Monthly plans from $197.",
    url: "https://webm8.co",
    siteName: "WebM8",
    type: "website",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "WebM8" }],
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
