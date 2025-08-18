import { urlFor } from "@/sanity/lib/image";
import { getHomeDesignPosts } from "@/sanity/queries";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function Posts({
  page,
  category,
  author,
}: {
  page: number;
  category?: string;
  author?: string;
}) {
  const posts = await getHomeDesignPosts(
    (page - 1) * 10,
    page * 10,
    category,
    author
  );

  if (posts.length === 0 && (page > 1 || category)) {
    notFound();
  }

  if (posts.length === 0) {
    return <p className="mt-6 text-gray-500">No posts found.</p>;
  }

  return (
    <div className="mx-auto px-8 lg:px-16 mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
      {posts.map((post) => (
        <article
          key={post.slug}
          className="flex flex-col items-start justify-between"
        >
          <div className="relative w-full">
            {post.mainImage && (
              <Image
                alt={post.mainImage?.alt || ""}
                src={urlFor(post.mainImage).size(700, 467).url()}
                width={700}
                height={467}
                className="aspect-video w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
              />
            )}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
          </div>
          <div className="max-w-xl">
            <div className="mt-8 flex items-center gap-x-4 text-xs">
              <time dateTime={post.publishedAt ?? ""} className="text-gray-500">
                {dayjs(post.publishedAt).format("dddd, MMMM D, YYYY")}
              </time>
            </div>
            <div className="group relative">
              <h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600">
                <Link href={`/blog/${post.slug}`}>
                  <span className="absolute inset-0" />
                  {post.title}
                </Link>
              </h3>
              <p className="mt-5 line-clamp-3 text-sm/6 text-gray-600">
                {post.excerpt}
              </p>
            </div>
            <div className="relative mt-8 flex items-center gap-x-4">
              {post.author?.image && (
                <Image
                  alt={post.author?.image?.alt || ""}
                  src={urlFor(post.author?.image).size(64, 64).url()}
                  width={64}
                  height={64}
                  className="size-10 rounded-full bg-gray-100"
                />
              )}
              <div className="text-sm/6">
                <p className="font-semibold text-gray-900">
                  {/* <a href={post.author.href}> */}
                  <span className="absolute inset-0" />
                  {post.author?.name}
                  {/* </a> */}
                </p>
                {/* <p className="text-gray-600">{post.author?.role}</p> */}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
