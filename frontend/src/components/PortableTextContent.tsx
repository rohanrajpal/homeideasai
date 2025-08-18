import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { slugify } from "@/lib/utils";
import { YoutubePlayer } from "@/components/youtube-player";

export function PortableTextContent({ value }: { value: any }) {
  return (
    <PortableText
      value={value}
      components={{
        block: {
          normal: ({ children }) => (
            <p className="my-10 text-base/8 first:mt-0 last:mb-0">{children}</p>
          ),
          h2: ({ children, value }) => (
            <h2
              id={slugify(value.children[0].text)}
              className="mb-10 mt-12 text-2xl/8 font-medium tracking-tight text-gray-950 first:mt-0 last:mb-0"
            >
              {children}
            </h2>
          ),
          h3: ({ children, value }) => (
            <h3
              id={slugify(value.children[0].text)}
              className="mb-10 mt-12 text-xl/8 font-medium tracking-tight text-gray-950 first:mt-0 last:mb-0"
            >
              {children}
            </h3>
          ),
          h4: ({ children, value }) => (
            <h4
              id={slugify(value.children[0].text)}
              className="mb-10 mt-12 text-lg/8 font-medium tracking-tight text-gray-950 first:mt-0 last:mb-0"
            >
              {children}
            </h4>
          ),
          h5: ({ children, value }) => (
            <h5
              id={slugify(value.children[0].text)}
              className="mb-10 mt-12 text-base/8 font-medium tracking-tight text-gray-950 first:mt-0 last:mb-0"
            >
              {children}
            </h5>
          ),
          h6: ({ children, value }) => (
            <h6
              id={slugify(value.children[0].text)}
              className="mb-10 mt-12 text-sm/8 font-medium tracking-tight text-gray-950 first:mt-0 last:mb-0"
            >
              {children}
            </h6>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-10 border-l-2 border-l-gray-300 pl-6 text-base/8 text-gray-950 first:mt-0 last:mb-0">
              {children}
            </blockquote>
          ),
        },
        types: {
          image: ({ value }) => {
            try {
              return (
                <Image
                  alt={value.alt || ""}
                  src={urlFor(value).width(1080).url()}
                  width={1080}
                  height={720}
                  className="w-full rounded-2xl"
                />
              );
            } catch (error) {
              console.error(error);
              return null;
            }
          },
          separator: ({ value }) => {
            switch (value.style) {
              case "line":
                return <hr className="my-8 border-t border-gray-200" />;
              case "space":
                return <div className="my-8" />;
              default:
                return null;
            }
          },
          youtube: ({ value }) => {
            return <YoutubePlayer url={value.url} />;
          },
        },
        list: {
          bullet: ({ children }) => (
            <ul className="list-disc pl-4 text-base/8 marker:text-gray-400">
              {children}
            </ul>
          ),
          number: ({ children }) => (
            <ol className="list-decimal pl-4 text-base/8 marker:text-gray-400">
              {children}
            </ol>
          ),
        },
        listItem: {
          bullet: ({ children }) => {
            return <li className="my-2 pl-2 has-[br]:mb-8">{children}</li>;
          },
          number: ({ children }) => {
            return <li className="my-2 pl-2 has-[br]:mb-8">{children}</li>;
          },
        },
        marks: {
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-950">{children}</strong>
          ),
          code: ({ children }) => (
            <>
              <span aria-hidden>`</span>
              <code className="text-[15px]/8 font-semibold text-gray-950">
                {children}
              </code>
              <span aria-hidden>`</span>
            </>
          ),
          link: ({ value, children }) => {
            return (
              <Link
                href={value.href}
                className="font-medium text-gray-950 underline decoration-gray-400 underline-offset-4 data-[hover]:decoration-gray-600"
              >
                {children}
              </Link>
            );
          },
        },
      }}
    />
  );
}
