import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Product images are served straight from Shopify's CDN, which already
  // delivers optimized/resized images. Using unoptimized avoids paying for
  // Vercel's image-optimization quota and keeps the browser fetching directly.
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "majesticallyproducts.com" },
    ],
  },
  // PGlite ships a wasm/native module we never bundle for the browser.
  serverExternalPackages: ["@electric-sql/pglite"],
  async headers() {
    // Security headers applied to every response.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
