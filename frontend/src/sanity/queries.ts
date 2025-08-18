import { defineQuery } from "next-sanity";
import { sanityFetch } from "./lib/sanity-fetch";

const TOTAL_POSTS_QUERY = defineQuery(/* groq */ `count(*[
  _type == "post"
  && defined(slug.current)
  && (isFeatured != true || defined($category))
  && select(defined($category) => $category in categories[]->slug.current, true)
])`);

export async function getPostsCount(category?: string) {
  return await sanityFetch({
    query: TOTAL_POSTS_QUERY,
    params: { category: category ?? null },
  });
}

const POSTS_QUERY = defineQuery(/* groq */ `*[
  _type == "post"
  && defined(slug.current)
  && (isFeatured != true || defined($category))
  && select(defined($category) => $category in categories[]->slug.current, true)
  && select(defined($author) => $author == author->slug.current, true)
]|order(publishedAt desc)[$startIndex...$endIndex]{
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  mainImage,
  author->{
    name,
    image,
  },
}`);

export async function getPosts(
  startIndex: number,
  endIndex: number,
  category?: string,
  author?: string
) {
  return await sanityFetch({
    query: POSTS_QUERY,
    // tags: ["post"],
    params: {
      startIndex,
      endIndex,
      category: category ?? null,
      author: author ?? null,
    },
  });
}

const FEATURED_POSTS_QUERY = defineQuery(/* groq */ `*[
  _type == "post"
  && isFeatured == true
  && defined(slug.current)
]|order(publishedAt desc)[0...$quantity]{
  title,
  "slug": slug.current,
  publishedAt,
  mainImage,
  excerpt,
  author->{
    name,
    image,
  },
}`);

export async function getFeaturedPosts(quantity: number) {
  return await sanityFetch({
    query: FEATURED_POSTS_QUERY,
    params: { quantity },
  });
}

const FEED_POSTS_QUERY = defineQuery(/* groq */ `*[
  _type == "post"
  && defined(slug.current)
]|order(isFeatured, publishedAt desc){
  title,
  "slug": slug.current,
  publishedAt,
  mainImage,
  excerpt,
  author->{
    name,
  },
}`);

export async function getPostsForFeed() {
  return await sanityFetch({
    query: FEED_POSTS_QUERY,
  });
}

const POST_QUERY = defineQuery(/* groq */ `*[
  _type == "post"
  && slug.current == $slug
][0]{
  publishedAt,
  title,
  mainImage,
  excerpt,
  body,
  "headings": body[style in ["h2", "h3", "h4", "h5", "h6"]],
  author->{
    name,
    image,
  },
  categories[]->{
    title,
    "slug": slug.current,
  }
}
`);

export async function getPost(slug: string) {
  return await sanityFetch({
    query: POST_QUERY,
    params: { slug },
    // tags: ["post"],
  });
}

const CATEGORIES_QUERY = defineQuery(/* groq */ `*[
  _type == "category"
  && count(*[_type == "post" && defined(slug.current) && ^._id in categories[]._ref]) > 0
]|order(title asc){
  title,
  "slug": slug.current,
}`);

export async function getCategories() {
  return await sanityFetch({
    query: CATEGORIES_QUERY,
  });
}

const EXAMPLES_QUERY = defineQuery(/* groq */ `*[
  _type == "generatedDesign"
  && showOnHomePage == true
]|order(createdAt desc)[0...$quantity]{
  image,
  prompt,
  createdAt,
}`);

export async function getExamples(quantity: number) {
  return await sanityFetch({
    query: EXAMPLES_QUERY,
    params: { quantity },
  });
}

const AUTHOR_QUERY = defineQuery(/* groq */ `*[
  _type == "author" 
  && slug.current == $slug
][0]{
  name,
  image,
  bio
}`);

export async function getAuthor(slug: string) {
  return await sanityFetch({
    query: AUTHOR_QUERY,
    params: { slug },
  });
}

// Home Design AI Queries

const TOTAL_HOME_DESIGN_POSTS_QUERY = defineQuery(/* groq */ `count(*[
  _type == "homeDesignPost"
  && defined(slug.current)
  && select(defined($category) => $category in categories[]->slug.current, true)
])`);

export async function getHomeDesignPostsCount(category?: string) {
  return await sanityFetch({
    query: TOTAL_HOME_DESIGN_POSTS_QUERY,
    params: {
      category: category ?? null,
    },
  });
}

const HOME_DESIGN_POSTS_QUERY = defineQuery(/* groq */ `*[
  _type == "homeDesignPost"
  && defined(slug.current)
  && select(defined($category) => $category in categories[]->slug.current, true)
  && select(defined($author) => $author == author->slug.current, true)
]|order(publishedAt desc)[$startIndex...$endIndex]{
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  mainImage,
  author->{
    name,
    image,
  },
  categories[]->{
    title,
    "slug": slug.current,
  }
}`);

export async function getHomeDesignPosts(
  startIndex: number,
  endIndex: number,
  category?: string,
  author?: string
) {
  return await sanityFetch({
    query: HOME_DESIGN_POSTS_QUERY,
    params: {
      startIndex,
      endIndex,
      category: category ?? null,
      author: author ?? null,
    },
  });
}

const HOME_DESIGN_POST_QUERY = defineQuery(/* groq */ `*[
  _type == "homeDesignPost"
  && slug.current == $slug
][0]{
  publishedAt,
  title,
  mainImage,
  excerpt,
  body,
  "headings": body[style in ["h2", "h3", "h4", "h5", "h6"]],
  author->{
    name,
    image,
  },
  categories[]->{
    title,
    "slug": slug.current,
  }
}
`);

export async function getHomeDesignPost(slug: string) {
  return await sanityFetch({
    query: HOME_DESIGN_POST_QUERY,
    params: { slug },
  });
}

const HOME_DESIGN_CATEGORIES_QUERY = defineQuery(/* groq */ `*[
  _type == "homeDesignCategory"
  && count(*[_type == "homeDesignPost" && defined(slug.current) && ^._id in categories[]._ref]) > 0
]|order(title asc){
  title,
  "slug": slug.current,
  description,
  color,
  icon,
}`);

export async function getHomeDesignCategories() {
  return await sanityFetch({
    query: HOME_DESIGN_CATEGORIES_QUERY,
  });
}

const HOME_DESIGN_EXAMPLES_QUERY = defineQuery(/* groq */ `*[
  _type == "homeDesignExample"
  && showOnHomePage == true
]|order(createdAt desc)[$startIndex...$endIndex]{
  title,
  description,
  beforeImage,
  afterImage,
  prompt,
  roomType,
  designStyle,
  tags,
  createdAt,
  featured
}`);

export async function getHomeDesignExamples(
  startIndex: number = 0,
  endIndex: number = 10
) {
  return await sanityFetch({
    query: HOME_DESIGN_EXAMPLES_QUERY,
    params: { startIndex, endIndex },
  });
}

const FEATURED_HOME_DESIGN_EXAMPLES_QUERY = defineQuery(/* groq */ `*[
  _type == "homeDesignExample"
  && featured == true
]|order(createdAt desc)[0...$quantity]{
  title,
  description,
  beforeImage,
  afterImage,
  prompt,
  roomType,
  designStyle,
  tags,
  createdAt
}`);

export async function getFeaturedHomeDesignExamples(quantity: number = 6) {
  return await sanityFetch({
    query: FEATURED_HOME_DESIGN_EXAMPLES_QUERY,
    params: { quantity },
  });
}

// Home Design Posts for RSS Feed
const HOME_DESIGN_POSTS_FOR_FEED_QUERY = defineQuery(/* groq */ `*[
  _type == "homeDesignPost"
  && defined(slug.current)
]|order(publishedAt desc){
  title,
  "slug": slug.current,
  publishedAt,
  mainImage,
  excerpt,
  author->{
    name,
  },
}`);

export async function getHomeDesignPostsForFeed() {
  return await sanityFetch({
    query: HOME_DESIGN_POSTS_FOR_FEED_QUERY,
  });
}

// Featured Home Design Posts
const FEATURED_HOME_DESIGN_POSTS_QUERY = defineQuery(/* groq */ `*[
  _type == "homeDesignPost"
  && defined(slug.current)
]|order(publishedAt desc)[0...$quantity]{
  title,
  "slug": slug.current,
  publishedAt,
  mainImage,
  excerpt,
  author->{
    name,
    image,
  },
}`);

export async function getFeaturedHomeDesignPosts(quantity: number) {
  return await sanityFetch({
    query: FEATURED_HOME_DESIGN_POSTS_QUERY,
    params: { quantity },
  });
}
