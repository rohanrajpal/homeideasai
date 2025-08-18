import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const homeDesignCategoryType = defineType({
  name: "homeDesignCategory",
  title: "Home Design Category",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "The title of the home design category",
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      description: "A brief description of what this category covers",
    }),
    defineField({
      name: "color",
      type: "string",
      title: "Category Color",
      description: "Hex color code for category styling (e.g., #3B82F6)",
      validation: (Rule) =>
        Rule.regex(/^#[0-9A-Fa-f]{6}$/).error(
          "Please enter a valid hex color code"
        ),
    }),
    defineField({
      name: "icon",
      type: "string",
      title: "Icon Name",
      description: "Lucide icon name for this category",
      options: {
        list: [
          { title: "Home", value: "home" },
          { title: "Palette", value: "palette" },
          { title: "Sofa", value: "sofa" },
          { title: "Lightbulb", value: "lightbulb" },
          { title: "Hammer", value: "hammer" },
          { title: "Trees", value: "trees" },
          { title: "Sparkles", value: "sparkles" },
          { title: "Settings", value: "settings" },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      description: "description",
    },
    prepare(selection) {
      const { title, description } = selection;
      return {
        title,
        subtitle: description,
      };
    },
  },
});
