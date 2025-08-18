import { ImageIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const homeDesignExampleType = defineType({
  name: "homeDesignExample",
  title: "Home Design Example",
  type: "document",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "beforeImage",
      title: "Before Image",
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
      description: "The original room image before AI transformation",
    }),
    defineField({
      name: "afterImage",
      title: "After Image",
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
      description: "The AI-transformed room image",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "prompt",
      type: "text",
      title: "Design Prompt",
      description:
        "The prompt used to generate the home design transformation.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "roomType",
      type: "string",
      title: "Room Type",
      options: {
        list: [
          { title: "Living Room", value: "living_room" },
          { title: "Kitchen", value: "kitchen" },
          { title: "Bedroom", value: "bedroom" },
          { title: "Bathroom", value: "bathroom" },
          { title: "Dining Room", value: "dining_room" },
          { title: "Home Office", value: "home_office" },
          { title: "Outdoor", value: "outdoor" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "designStyle",
      type: "string",
      title: "Design Style",
      options: {
        list: [
          { title: "Modern", value: "modern" },
          { title: "Contemporary", value: "contemporary" },
          { title: "Traditional", value: "traditional" },
          { title: "Scandinavian", value: "scandinavian" },
          { title: "Industrial", value: "industrial" },
          { title: "Bohemian", value: "bohemian" },
          { title: "Minimalist", value: "minimalist" },
          { title: "Rustic", value: "rustic" },
          { title: "Mid-Century Modern", value: "mid_century" },
          { title: "Farmhouse", value: "farmhouse" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Example Title",
      description: "A catchy title for this transformation example",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description: "Detailed description of the transformation",
      rows: 4,
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      title: "Created At",
      description: "The date and time the example was created.",
    }),
    defineField({
      name: "featured",
      type: "boolean",
      title: "Featured",
      description: "Whether this example should be featured prominently",
      initialValue: false,
    }),
    defineField({
      name: "showOnHomePage",
      type: "boolean",
      title: "Show on Home Page",
      description: "Whether the example should be shown on the home page.",
      initialValue: false,
    }),
    defineField({
      name: "tags",
      type: "array",
      title: "Tags",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Budget-Friendly", value: "budget" },
          { title: "Luxury", value: "luxury" },
          { title: "Small Space", value: "small_space" },
          { title: "Open Concept", value: "open_concept" },
          { title: "Color Transformation", value: "color_change" },
          { title: "Furniture Swap", value: "furniture" },
          { title: "Lighting Upgrade", value: "lighting" },
          { title: "Storage Solutions", value: "storage" },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      roomType: "roomType",
      designStyle: "designStyle",
      media: "afterImage",
    },
    prepare(selection) {
      const { title, roomType, designStyle } = selection;
      const subtitle = [roomType, designStyle].filter(Boolean).join(" • ");
      return {
        ...selection,
        title: title || "Untitled Example",
        subtitle,
      };
    },
  },
  orderings: [
    {
      title: "Created Date, New",
      name: "createdDateDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
    {
      title: "Featured First",
      name: "featuredFirst",
      by: [
        { field: "featured", direction: "desc" },
        { field: "createdAt", direction: "desc" },
      ],
    },
  ],
});
