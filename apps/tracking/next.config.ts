// module.exports = {
//   /** @type {import('next').NextConfig} */

// };

// next.config.mjs
import { withHighlightConfig } from "@highlight-run/next/config";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cloud.appwrite.io",
        port: "",
        pathname: "/v1/**",
      },
      {
        protocol: "https",
        hostname: "fra.cloud.appwrite.io",
        port: "",
        pathname: "/v1/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        // pathname: "/v1/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: "",
        // pathname: "/v1/**",
      },
    ],
  },
  // ...additional config
};

export default withHighlightConfig(nextConfig as any);
