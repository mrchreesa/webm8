import type { NextConfig } from "next";
import { projects } from "./lib/site";

const instantSite = process.env.INSTANT_WEBSITES_SITE === "1";
const demoOrigins = [...new Set(projects.flatMap(project => project.siteUrl ? [new URL(project.siteUrl).origin] : []))].join(" ");
const billingCsp = [
  "default-src 'self'", "base-uri 'self'", "object-src 'none'", "frame-ancestors 'self'",
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""} https://*.stripe.com https://maps.googleapis.com https://connect.facebook.net https://webm8-platform.vercel.app`,
  "style-src 'self' 'unsafe-inline'", "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  `frame-src 'self' https://*.stripe.com https://link.com https://*.link.com ${demoOrigins}`,
  `connect-src 'self' https://*.stripe.com https://link.com https://*.link.com https://maps.googleapis.com https://webm8-platform.vercel.app https://www.facebook.com https://connect.facebook.net ${process.env.NODE_ENV === "development" ? "ws://127.0.0.1:* ws://localhost:*" : ""}`,
  "form-action 'self' https://*.stripe.com", "worker-src 'self' blob:",
].join("; ");

// Not a static export: /movers/ posts review requests to a server route so the
// request is recorded before the visitor is told it succeeded. Every other
// route still prerenders to static HTML at build time.
const nextConfig: NextConfig = {
  ...(process.env.WEBM8_BUILD_DIR ? { distDir: process.env.WEBM8_BUILD_DIR } : {}),
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  trailingSlash: true,
  async rewrites() {
    return {
      beforeFiles: instantSite ? [{ source: "/", destination: "/instant/" }] : [],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      ...(instantSite ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }] : []),
      ...(process.env.INSTANT_BILLING_ENABLED === "1" ? [{ source: instantSite ? "/:path*" : "/instant/:path*", headers: [{ key: "Content-Security-Policy", value: billingCsp }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }] }] : []),
    ];
  },
  // The free website review became the Free Custom Website Demo.
  async redirects() {
    return [
      ...(instantSite
        ? ["about", "contact", "privacy", "pricing", "free-demo", "demo", "thank-you", "work", "movers", "audit"].map((page) => ({
            source: `/${page}/:path*`,
            destination: `https://www.webm8agency.com/${page}/:path*`,
            permanent: false,
          }))
        : []),
      { source: "/audit", destination: "/free-demo/", permanent: true },
      { source: "/audit/", destination: "/free-demo/", permanent: true },
    ];
  },
};

export default nextConfig;
