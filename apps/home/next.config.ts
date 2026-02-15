// apps/home/next.config.mjs
import { withHighlightConfig } from "@highlight-run/next/config";

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "cloud.appwrite.io",
        port: "",
        pathname: "/v1/**",
      },
      {
        protocol: "https" as const,
        hostname: "fra.cloud.appwrite.io",
        port: "",
        pathname: "/v1/**",
      },
      {
        protocol: "https" as const,
        hostname: "images.unsplash.com",
        port: "",
      },
      {
        protocol: "https" as const,
        hostname: "plus.unsplash.com",
        port: "",
      },
      {
        protocol: "https" as const,
        hostname: "upload.wikimedia.org",
        port: "",
      },
      {
        protocol: "https" as const,
        hostname: "sfo.cloud.appwrite.io",
        port: "",
        pathname: "/v1/**",
      },
    ],
  },
};

export default withHighlightConfig(nextConfig);
