import { Metadata } from "next";
import { HomeDesigner } from "@/components/home-designer";

type Props = {
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;

  return {
    title: `Design Project ${projectId} - HomeIdeasAI`,
    description: "Transform your space with AI-powered interior design.",
    alternates: {
      canonical: `/design/${projectId}`,
    },
  };
}

export default async function DesignProjectPage({ params }: Props) {
  const { projectId } = await params;

  return (
    <div className="min-h-screen">
      <HomeDesigner projectId={projectId} />
    </div>
  );
}
