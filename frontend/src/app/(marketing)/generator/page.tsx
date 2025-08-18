import { Metadata } from "next";
import { HomeDesigner } from "@/components/home-designer";

export const metadata: Metadata = {
  title: "AI Home Designer - HomeIdeasAI",
  description:
    "Transform your home with AI-powered interior design. Upload a photo and chat with AI to redesign any space.",
  alternates: {
    canonical: "/generator",
  },
};

export default function CreatePage() {
  return (
    <div className="min-h-screen">
      <HomeDesigner />
    </div>
  );
}
