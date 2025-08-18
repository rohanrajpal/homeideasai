import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content Management")
    .items([
      // Blog Section (NailsDesignAI)
      S.listItem()
        .title("Blog")
        .icon(() => "📝")
        .child(
          S.list()
            .title("Blog Content")
            .items([
              S.documentTypeListItem("post").title("Posts"),
              S.documentTypeListItem("category").title("Categories"),
              S.documentTypeListItem("author").title("Authors"),
              S.documentTypeListItem("generatedDesign").title(
                "Generated Designs"
              ),
            ])
        ),

      S.divider(),

      // HomeIdeasAI Section
      S.listItem()
        .title("HomeIdeasAI")
        .icon(() => "🏠")
        .child(
          S.list()
            .title("Home Design Content")
            .items([
              S.documentTypeListItem("homeDesignPost").title(
                "Home Design Posts"
              ),
              S.documentTypeListItem("homeDesignCategory").title(
                "Home Design Categories"
              ),
              S.documentTypeListItem("homeDesignExample").title(
                "Home Design Examples"
              ),
            ])
        ),

      S.divider(),

      // Other content types (if any)
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() &&
          ![
            "post",
            "category",
            "author",
            "generatedDesign",
            "homeDesignPost",
            "homeDesignCategory",
            "homeDesignExample",
            "homeDesignBlockContent",
          ].includes(item.getId()!)
      ),
    ]);
