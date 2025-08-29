import { Posts } from "@/components/blog-posts";
import { Container } from "@/components/container";
import { Heading, Lead, Subheading } from "@/components/text";
import { urlFor } from "@/sanity/lib/image";
import { getFeaturedHomeDesignPosts } from "@/sanity/queries";
import dayjs from "dayjs";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | HomeIdeasAI",
  description:
    "Transform your home with AI-powered design insights, tips, and inspiration",
  alternates: {
    canonical: "/blog",
  },
};

async function FeaturedPosts() {
  let featuredPosts = await getFeaturedHomeDesignPosts(3);

  if (featuredPosts.length === 0) {
    return;
  }

  return (
    <Container className="mt-16">
      <h2 className="text-2xl font-medium tracking-tight text-gray-900">
        Featured
      </h2>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuredPosts.map((post: any) => (
          <article
            key={post.slug}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-200 transition-all duration-200 hover:shadow-xl hover:ring-gray-300"
          >
            {post.mainImage && (
              <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                <Image
                  alt={post.mainImage.alt || post.title}
                  src={urlFor(post.mainImage).size(800, 500).url()}
                  width={800}
                  height={500}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col p-6">
              <div className="text-sm text-gray-500">
                {dayjs(post.publishedAt).format("MMMM D, YYYY")}
              </div>
              <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-indigo-600">
                <Link href={`/blog/${post.slug}`}>
                  <span className="absolute inset-0" />
                  {post.title}
                </Link>
              </h3>
              {post.excerpt && (
                <p className="mt-2 flex-1 text-sm leading-6 text-gray-600 line-clamp-3">
                  {post.excerpt}
                </p>
              )}
              {post.author && (
                <div className="mt-6 flex items-center gap-3">
                  {post.author.image && (
                    <Image
                      alt={post.author.name || "Author"}
                      src={urlFor(post.author.image).size(40, 40).url()}
                      width={40}
                      height={40}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  )}
                  <div className="text-sm font-medium text-gray-900">
                    {post.author.name}
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </Container>
  );
}

export default async function Blog() {
  let page = 1;

  return (
    <>
      <Container className="pt-16">
        <Subheading className="mt-16">Blog</Subheading>
        <Heading as="h1" className="mt-2">
          Home Design Ideas & Inspiration
        </Heading>
        <Lead className="mt-6 max-w-3xl">
          Discover the latest trends, expert tips, and AI-powered insights to
          transform your living spaces into stunning, personalized homes.
        </Lead>
      </Container>
      {page === 1 && <FeaturedPosts />}
      <Container className="mt-16 pb-24">
        <Posts page={page} />
      </Container>
    </>
  );
}
