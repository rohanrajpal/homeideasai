import { Metadata } from "next";
import { HomeDesigner } from "@/components/home-designer";

export const metadata: Metadata = {
  title: "Design Workspace - HomeIdeasAI",
  description:
    "Transform your home with AI-powered interior design consultation. Upload a photo and chat with our AI design expert to redesign any space.",
  alternates: {
    canonical: "/workspace",
  },
};

export default function WorkspacePage() {
  return (
    <div className="min-h-screen">
      <HomeDesigner />
    </div>
  );
}
