/** @type {import('next').NextConfig} */
const nextConfig: import("next").NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@sparticuz/chromium",
      "playwright-core",
    ],
  },
};

module.exports = nextConfig;
