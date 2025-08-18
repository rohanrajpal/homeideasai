import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HomeIdeasAI",
    short_name: "HomeIdeasAI",
    description: "Generate unique nail designs with AI",
    start_url: "/create",
    display: "standalone",
    background_color: "#e91e63",
    theme_color: "#e91e63",
    icons: [
      {
        src: "/images/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
