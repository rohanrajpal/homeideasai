import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase body size limit for image uploads
  serverActions: {
    bodySizeLimit: "10mb",
  },
  rewrites: async () => {
    return [
      {
        source: "/api/py/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/py/:path*"
            : "https://api.homeideasai.com/api/py/:path*",
      },
      {
        source: "/docs",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/py/docs"
            : "https://api.homeideasai.com/api/py/docs",
      },
      {
        source: "/openapi.json",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/py/openapi.json"
            : "https://api.homeideasai.com/api/py/openapi.json",
      },
    ];
  },
  redirects: async () => {
    return [
      {
        source: "/create",
        destination: "/generator",
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
    ],
  },
};

export default nextConfig;
