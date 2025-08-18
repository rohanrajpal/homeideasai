import { type SchemaTypeDefinition } from "sanity";

import { blockContentType } from "./blockContentType";
import { categoryType } from "./categoryType";
import { postType } from "./postType";
import { authorType } from "./authorType";
import { exampleType } from "./exampleType";
import { youtube } from "./youtubeType";
// Home Design AI schema types
import { homeDesignPostType } from "./homeDesignPostType";
import { homeDesignCategoryType } from "./homeDesignCategoryType";
import { homeDesignExampleType } from "./homeDesignExampleType";
import { homeDesignBlockContentType } from "./homeDesignBlockContentType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    postType,
    authorType,
    exampleType,
    youtube,
    // Home Design AI types
    homeDesignBlockContentType,
    homeDesignPostType,
    homeDesignCategoryType,
    homeDesignExampleType,
  ],
};
