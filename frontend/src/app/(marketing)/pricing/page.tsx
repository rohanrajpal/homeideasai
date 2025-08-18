import type { Metadata } from "next";
import { PricingCards } from "@/components/pricing-cards";
import { PricingFAQ } from "@/components/pricing-faq";
import { PricingFreeCredits } from "./pricing-free-credits";

export const metadata: Metadata = {
  title: "Pricing - HomeIdeasAI | AI-Powered Home Design Platform",
  description:
    "Transform your home with AI for just $29/month. Get 200 design edits and unlimited chat with our AI design assistant.",
  openGraph: {
    title: "Pricing - HomeIdeasAI | AI-Powered Home Design Platform",
    description:
      "Transform your home with AI for just $29/month. Get 200 design edits and unlimited chat with our AI design assistant.",
    type: "website",
  },
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <div className="relative">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#FFE1F9_100%)]" />

      <div className="container py-12 space-y-20 mx-auto mt-12">
        {/* Hero Section */}
        <PricingFreeCredits />

        {/* Pricing Cards */}
        <PricingCards />

        {/* FAQ Section */}
        <PricingFAQ />
      </div>
    </div>
  );
}
