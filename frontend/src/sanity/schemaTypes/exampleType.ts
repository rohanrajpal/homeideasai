import { ImageIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const exampleType = defineType({
  name: "generatedDesign",
  title: "Generated Design",
  type: "document",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
        },
      ],
    }),
    defineField({
      name: "prompt",
      type: "string",
      title: "Prompt",
      description: "The prompt used to generate the image.",
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      title: "Created At",
      description: "The date and time the example was created.",
    }),
    defineField({
      name: "showOnHomePage",
      type: "boolean",
      title: "Show on Home Page",
      description: "Whether the example should be shown on the home page.",
    }),
  ],
  preview: {
    select: {
      title: "prompt",
      media: "image",
    },
  },
});
