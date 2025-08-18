export const isDevelopment = process.env.NODE_ENV === "development";

export const BASE_URL = isDevelopment
  ? "http://localhost:3000"
  : process.env.NEXT_PUBLIC_BASE_URL || "https://www.homeideasai.com";

export const SITE_LINKS = [
  {
    href: "/",
    text: "Home",
    changeFrequency: "monthly" as const,
    priority: 1,
  },
  {
    href: "/blog",
    text: "Blog",
    changeFrequency: "weekly" as const,
    priority: 0.8,
  },
  {
    href: "/professionals",
    text: "For Professionals",
    changeFrequency: "monthly" as const,
    priority: 0.5,
  },
  {
    href: "/pricing",
    text: "Pricing",
    changeFrequency: "monthly" as const,
    priority: 0.5,
  },
  {
    href: "/generator",
    text: "AI Home Designer",
    changeFrequency: "daily" as const,
    priority: 1,
  },
  // Add more routes as needed
] as const;

// For TypeScript support
export type SiteLink = (typeof SITE_LINKS)[number];
