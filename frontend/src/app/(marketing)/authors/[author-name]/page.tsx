import { Posts } from "@/components/blog-posts";
import { Container } from "@/components/container";
import { PortableTextContent } from "@/components/PortableTextContent";
import { Heading } from "@/components/text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { urlFor } from "@/sanity/lib/image";
import { getAuthor } from "@/sanity/queries";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "author-name": string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const author = await getAuthor(resolvedParams["author-name"]);
  return {
    title: `${author.name} | HomeIdeasAI`,
    description: author.bio,
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ "author-name": string }>;
}) {
  const resolvedParams = await params;
  const author = await getAuthor(resolvedParams["author-name"]);

  return (
    <Container className="pt-20">
      <Card>
        <CardHeader>
          <Avatar className="h-20 w-20">
            <AvatarImage
              alt={author.name}
              src={urlFor(author.image).size(128, 128).url()}
            />
            <AvatarFallback>
              {author.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4 text-3xl">{author.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {author.bio && (
            <div className="mt-4 text-lg text-muted-foreground">
              <PortableTextContent value={author.bio} />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-16">
        <Heading as="h2">Posts by {author.name}</Heading>
        {/* Render list of blog posts by this author */}
        <Posts page={1} author={resolvedParams["author-name"]} />
      </div>
    </Container>
  );
}
