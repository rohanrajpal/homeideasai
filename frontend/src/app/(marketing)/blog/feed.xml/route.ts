import { urlFor } from "@/sanity/lib/image";
import { getHomeDesignPostsForFeed } from "@/sanity/queries";
import { Feed } from "feed";
import assert from "node:assert";

export async function GET(req: Request) {
  let siteUrl = new URL(req.url).origin;

  let feed = new Feed({
    title: "HomeIdeasAI Blog",
    description:
      "Transform your home with AI-powered design insights, tips, and inspiration. Discover the latest trends and expert advice.",
    author: {
      name: "HomeIdeasAI Team",
      email: "hello@homeideasai.com",
    },
    id: siteUrl,
    link: siteUrl,
    image: `${siteUrl}/favicon.ico`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
    },
  });

  let posts = await getHomeDesignPostsForFeed();

  posts.forEach((post: any) => {
    try {
      assert(typeof post.title === "string");
      assert(typeof post.slug === "string");
      assert(typeof post.excerpt === "string");
      assert(typeof post.publishedAt === "string");
    } catch (error) {
      console.log("Post is missing required fields for RSS feed:", post);
      return;
    }

    feed.addItem({
      title: post.title,
      id: post.slug,
      link: `${siteUrl}/blog/${post.slug}`,
      content: post.excerpt,
      image: post.mainImage
        ? urlFor(post.mainImage)
            .size(1200, 800)
            .format("jpg")
            .url()
            .replaceAll("&", "&amp;")
        : undefined,
      author: post.author?.name ? [{ name: post.author.name }] : [],
      contributor: post.author?.name ? [{ name: post.author.name }] : [],
      date: new Date(post.publishedAt),
    });
  });

  return new Response(feed.rss2(), {
    status: 200,
    headers: {
      "content-type": "application/xml",
      "cache-control": "s-maxage=31556952",
    },
  });
}
