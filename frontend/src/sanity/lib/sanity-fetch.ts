import { isDevelopment } from "@/lib/constants";
import { QueryParams } from "next-sanity";
import { client } from "./client";
import { sanityFetchLive } from "./live";

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  revalidate = 60,
  tags = [],
}: {
  query: QueryString;
  params?: QueryParams;
  revalidate?: number | false;
  tags?: string[];
}) {
  // if (isDevelopment) {
  //   return sanityFetchLive({ query, params });
  // }
  return client.fetch(query, params, {
    next: {
      revalidate: isDevelopment || tags.length ? false : revalidate,
      tags,
    },
    // ...(isDevelopment ? { cache: "no-store" } : {}),
    // cache: isDevelopment ? "no-store" : "force-cache",
  });
}
