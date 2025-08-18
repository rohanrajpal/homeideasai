import { Container } from "@/components/container";
import { Heading, Subheading } from "@/components/text";
import { urlFor } from "@/sanity/lib/image";
import { getHomeDesignPost } from "@/sanity/queries";
import dayjs from "dayjs";
import type { Metadata } from "next";
import { PortableText } from "next-sanity";
import { notFound, permanentRedirect } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import Toc from "@/components/toc";
import { slugify } from "@/lib/utils";
import { YoutubePlayer } from "@/components/youtube-player";
import { PortableTextContent } from "@/components/PortableTextContent";

export const revalidate = 60;

export const dynamicParams = true; // or false, to 404 on unknown paths

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  let post = await getHomeDesignPost(resolvedParams.slug);

  return post
    ? {
        title: post.title,
        description: post.excerpt,
        alternates: {
          canonical: `/blog/${resolvedParams.slug}`,
        },
        ...(post.mainImage && {
          openGraph: {
            images: [
              {
                url: urlFor(post.mainImage).size(1080, 720).url(),
              },
            ],
          },
          twitter: {
            images: [
              {
                url: urlFor(post.mainImage).size(1080, 720).url(),
              },
            ],
          },
        }),
      }
    : {};
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  let post = (await getHomeDesignPost(resolvedParams.slug)) || notFound();

  return (
    <>
      <Container className="pt-16">
        <Subheading className="mt-16">
          {dayjs(post.publishedAt).format("dddd, MMMM D, YYYY")}
        </Subheading>
        <Heading as="h1" className="mt-2">
          {post.title}
        </Heading>
        <div className="mt-16 grid grid-cols-1 gap-8 pb-24 lg:grid-cols-[15rem_1fr] xl:grid-cols-[15rem_1fr_15rem]">
          <div className="flex flex-wrap items-center gap-8 max-lg:justify-between lg:flex-col lg:items-start">
            {post.author && (
              <div className="flex items-center gap-3">
                {post.author.image && (
                  <Image
                    alt={post.author.image.alt || ""}
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
            {Array.isArray(post.categories) && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.categories.map((category: any) => (
                  <Link
                    key={category.slug}
                    href={`/blog?category=${category.slug}`}
                    className="rounded-full border border-dotted border-gray-300 bg-gray-50 px-2 text-sm/6 font-medium text-gray-500"
                  >
                    {category.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="text-gray-700">
            <div className="max-w-2xl xl:mx-auto">
              {post.mainImage && (
                <Image
                  alt={post.mainImage.alt || ""}
                  src={urlFor(post.mainImage).size(2016, 1344).url()}
                  width={2016}
                  height={1344}
                  className="mb-10 aspect-[3/2] w-full rounded-2xl object-cover shadow-xl"
                />
              )}

              <Toc headings={post?.headings} />

              {post.body && (
                <div className="max-w-2xl xl:mx-auto">
                  <PortableTextContent value={post.body} />
                </div>
              )}
              <div className="mt-10">
                <Button variant="outline" asChild>
                  <Link href="/blog">
                    <ChevronLeftIcon className="size-4" />
                    Back to blog
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
