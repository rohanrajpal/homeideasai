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
    <div className="mt-16 max-w-2xl mx-auto bg-gradient-to-t from-gray-100 pb-14">
      <Container>
        <h2 className="text-2xl font-medium tracking-tight">Featured</h2>
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {featuredPosts.map((post: any) => (
            <div
              key={post.slug}
              className="relative flex flex-col rounded-3xl bg-white p-2 shadow-md shadow-black/5 ring-1 ring-black/5"
            >
              {post.mainImage && (
                <Image
                  alt={post.mainImage.alt || ""}
                  src={urlFor(post.mainImage).size(1170, 780).url()}
                  width={1170}
                  height={780}
                  className="aspect-[3/2] w-full rounded-2xl object-cover"
                />
              )}
              <div className="flex flex-1 flex-col p-8">
                <div className="text-sm/5 text-gray-700">
                  {dayjs(post.publishedAt).format("dddd, MMMM D, YYYY")}
                </div>
                <div className="mt-2 text-base/7 font-medium">
                  <Link href={`/blog/${post.slug}`}>
                    <span className="absolute inset-0" />
                    {post.title}
                  </Link>
                </div>
                <div className="mt-2 flex-1 text-sm/6 text-gray-500">
                  {post.excerpt}
                </div>
                {post.author && (
                  <div className="mt-6 flex items-center gap-3">
                    {post.author.image && (
                      <Image
                        alt=""
                        src={urlFor(post.author.image).size(64, 64).url()}
                        width={64}
                        height={64}
                        className="aspect-square size-6 rounded-full object-cover"
                      />
                    )}
                    <div className="text-sm/5 text-gray-700">
                      {post.author.name}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
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
