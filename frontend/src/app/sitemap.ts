import { MetadataRoute } from "next";
import { SITE_LINKS, BASE_URL } from "@/lib/constants";
import { getPosts } from "@/sanity/queries"; // Adjust import based on your setup

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get static routes from SITE_LINKS
  const staticRoutes = SITE_LINKS.map((link) => ({
    url: `${BASE_URL}${link.href}`,
    lastModified: new Date(),
    changeFrequency: link.changeFrequency,
    priority: link.priority,
  }));

  // Get dynamic blog posts
  const posts = await getPosts(0, 100);
  const blogRoutes = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt ?? ""),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}
