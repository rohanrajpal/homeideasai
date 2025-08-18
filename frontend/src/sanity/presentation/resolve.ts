// src/sanity/presentation/resolve.ts

import {
  defineLocations,
  PresentationPluginOptions,
} from "sanity/presentation";

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    // Add more locations for other post types
    post: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
      },
      resolve: (doc) => {
        console.log("doc is", doc);
        return {
          locations: [
            {
              title: doc?.title || "Untitled",
              href: `/blog/${doc?.slug}`,
            },
            { title: "Blog", href: `/blog` },
            { title: "Home", href: `/` },
          ],
        };
      },
    }),
  },
};
