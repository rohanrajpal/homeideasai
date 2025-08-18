import { defineArrayMember, defineType } from "sanity";
import { ImageIcon } from "@sanity/icons";

/**
 * Block content editor specifically for Home Design AI content
 * Includes home design specific formatting and media options
 */
export const homeDesignBlockContentType = defineType({
  title: "Home Design Block Content",
  name: "homeDesignBlockContent",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "H4", value: "h4" },
        { title: "Quote", value: "blockquote" },
        { title: "Design Tip", value: "designTip" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
        { title: "Design Steps", value: "designSteps" },
      ],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
          { title: "Highlight", value: "highlight" },
        ],
        annotations: [
          {
            title: "URL",
            name: "link",
            type: "object",
            fields: [
              {
                title: "URL",
                name: "href",
                type: "url",
              },
              {
                title: "Open in new tab",
                name: "blank",
                type: "boolean",
                initialValue: true,
              },
            ],
          },
          {
            title: "Design Term",
            name: "designTerm",
            type: "object",
            fields: [
              {
                title: "Definition",
                name: "definition",
                type: "text",
                rows: 2,
              },
            ],
          },
        ],
      },
    }),
    // Images with home design specific fields
    defineArrayMember({
      type: "image",
      icon: ImageIcon,
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "caption",
          type: "string",
          title: "Caption",
        },
        {
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
        },
        {
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
            ],
          },
        },
      ],
    }),
    // Before/After comparison
    defineArrayMember({
      type: "object",
      name: "beforeAfter",
      title: "Before/After Comparison",
      fields: [
        {
          name: "title",
          type: "string",
          title: "Comparison Title",
        },
        {
          name: "beforeImage",
          type: "image",
          title: "Before Image",
          options: { hotspot: true },
          validation: (Rule) => Rule.required(),
        },
        {
          name: "afterImage",
          type: "image",
          title: "After Image",
          options: { hotspot: true },
          validation: (Rule) => Rule.required(),
        },
        {
          name: "description",
          type: "text",
          title: "Transformation Description",
          rows: 3,
        },
      ],
      preview: {
        select: {
          title: "title",
          beforeImage: "beforeImage",
          afterImage: "afterImage",
        },
        prepare(selection) {
          const { title, beforeImage } = selection;
          return {
            title: title || "Before/After Comparison",
            media: beforeImage,
          };
        },
      },
    }),
    // Design tip callout
    defineArrayMember({
      type: "object",
      name: "designTip",
      title: "Design Tip",
      fields: [
        {
          name: "tip",
          type: "text",
          title: "Design Tip",
          rows: 3,
          validation: (Rule) => Rule.required(),
        },
        {
          name: "type",
          type: "string",
          title: "Tip Type",
          options: {
            list: [
              { title: "💡 Pro Tip", value: "pro" },
              { title: "💰 Budget Friendly", value: "budget" },
              { title: "⚠️ Common Mistake", value: "warning" },
              { title: "✨ Style Advice", value: "style" },
            ],
          },
          initialValue: "pro",
        },
      ],
      preview: {
        select: {
          tip: "tip",
          type: "type",
        },
        prepare(selection) {
          const { tip, type } = selection;
          const typeLabels = {
            pro: "💡 Pro Tip",
            budget: "💰 Budget Friendly",
            warning: "⚠️ Common Mistake",
            style: "✨ Style Advice",
          };
          return {
            title: typeLabels[type as keyof typeof typeLabels] || "Design Tip",
            subtitle: tip,
          };
        },
      },
    }),
    // YouTube embeds for home design videos
    defineArrayMember({
      type: "youtube",
    }),
  ],
});
