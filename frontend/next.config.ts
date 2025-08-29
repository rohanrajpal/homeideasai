import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase body size limit for image uploads
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  rewrites: async () => {
    return [
      {
        source: "/api/py/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/:path*"
            : "https://api.homeideasai.com/:path*",
      },
      {
        source: "/docs",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/docs"
            : "https://api.homeideasai.com/docs",
      },
      {
        source: "/openapi.json",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/openapi.json"
            : "https://api.homeideasai.com/openapi.json",
      },
    ];
  },
  redirects: async () => {
    return [
      {
        source: "/create",
        destination: "/workspace",
        permanent: true,
      },
      {
        source: "/generator",
        destination: "/workspace",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: "cdn.homeideasai.com",
      },
      {
        hostname: "cdn.sanity.io",
      },
      {
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
      },
      {
        hostname: "homeideasai.s3.eu-central-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
