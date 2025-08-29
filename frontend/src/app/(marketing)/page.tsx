import { Posts } from "@/components/blog-posts";
import { FeatureShowcase } from "@/components/features";
import { Hero } from "@/components/hero";
import { SocialProof } from "@/components/social-proof";
import { Heading } from "@/components/text";
import { BeforeAfterShowcase } from "@/components/before-after-showcase";

import { FreeCreditsOffer } from "@/components/free-credits-offer";
import { HowItWorks } from "@/components/how-it-works";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "HomeIdeasAI",
  description:
    "Transform your home with AI-powered interior design. Upload photos of your space and get instant design suggestions and visualizations.",
  alternates: {
    canonical: "/",
  },
  twitter: {
    images: [
      {
        url: "https://homeideasai.s3.eu-central-1.amazonaws.com/examples/homeideasai-designer.webp",
      },
    ],
  },
  openGraph: {
    images: [
      {
        url: "https://homeideasai.s3.eu-central-1.amazonaws.com/examples/homeideasai-designer.webp",
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <Hero />

      <BeforeAfterShowcase />

      <FreeCreditsOffer />

      <FeatureShowcase />

      <HowItWorks />

      <section className="w-full py-12 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Are you a designer or realtor?
          </h2>
          <p className="text-lg mb-6">
            Discover how HomeIdeasAI can accelerate your workflow and help you
            create stunning visualizations for clients.
          </p>
          <Button asChild size="lg" className="">
            <Link href="/professionals">For Professionals</Link>
          </Button>
        </div>
      </section>

      {/* <section className="py-8 lg:mx-16 ">
        <h2 className="text-center text-2xl font-bold mb-4">Sample Designs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {DESIGN_CARDS.map((design, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 border rounded-lg "
            >
              <Image
                src={design.image_urls[0]}
                alt={`Sample Design ${index + 1}`}
                width={200}
                height={200}
                className="rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold">
                {design.style} - {design.theme}
              </h3>
              <p className="text-sm text-gray-600">{design.description}</p>
              <ul className="text-sm text-gray-600 mt-2">
                <li>
                  <strong>Color:</strong> {design.color}
                </li>
                <li>
                  <strong>Shape:</strong> {design.shape}
                </li>
                <li>
                  <strong>Technique:</strong> {design.technique}
                </li>
              </ul>
            </div>
          ))}
        </div>
      </section> */}
      <SocialProof />
      <section className="mt-16 justify-center flex flex-col items-center">
        <Heading as="h2" className="text-center">
          Latest Blog Posts
        </Heading>
        <Posts page={1} />
      </section>
    </>
  );
}
