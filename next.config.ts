import type { NextConfig } from "next";

// Not a static export: /movers/ posts review requests to a server route so the
// request is recorded before the visitor is told it succeeded. Every other
// route still prerenders to static HTML at build time.
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  trailingSlash: true,
};

export default nextConfig;
