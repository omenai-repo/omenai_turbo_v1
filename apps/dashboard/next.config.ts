module.exports = {
  /** @type {import('next').NextConfig} */
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
      {
        protocol: "https",
        hostname: "res.cloudinary.com/",
        port: "",
        // pathname: "/v1/**",
      },
    ],
  },
};
