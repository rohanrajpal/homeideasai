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
  title: "Home Ideas & Interior Design Inspiration | HomeIdeasAI",
  description:
    "Get endless home ideas and interior design inspiration with AI. Transform any room with creative home decorating ideas, modern design concepts, and personalized styling suggestions.",
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

      {/* People Also Ask Section - SEO Optimized for Home Ideas */}
      <section className="w-full py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Home Ideas Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-xl font-semibold mb-3">
                  What are some creative home decorating ideas on a budget?
                </h3>
                <p className="text-gray-600">
                  Transform your space with AI-powered design suggestions that
                  work within any budget. Our tool helps you visualize
                  affordable makeovers using existing furniture, simple color
                  changes, and strategic decor placement.
                  <Link
                    href="/blog"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Browse our home design blog
                  </Link>{" "}
                  for more budget-friendly inspiration.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-xl font-semibold mb-3">
                  How do I get home design inspiration for small spaces?
                </h3>
                <p className="text-gray-600">
                  Small spaces require smart solutions. Upload photos of your
                  compact rooms and get personalized ideas for maximizing space,
                  choosing the right colors, and selecting furniture that makes
                  rooms feel larger.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-xl font-semibold mb-3">
                  What are the trending home interior design styles in 2024?
                </h3>
                <p className="text-gray-600">
                  Explore 20+ design styles including modern minimalist,
                  maximalist, Scandinavian, boho chic, and industrial designs.
                  Our AI stays updated with the latest trends to give you
                  contemporary home ideas.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-xl font-semibold mb-3">
                  How can I visualize home renovation ideas before committing?
                </h3>
                <p className="text-gray-600">
                  Upload a photo of any room and instantly see how different
                  design choices will look. Test color schemes, furniture
                  arrangements, and decor options risk-free before making
                  changes.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-6">
                <h3 className="text-xl font-semibold mb-3">
                  What home ideas work best for different room types?
                </h3>
                <p className="text-gray-600">
                  Each room has unique requirements. Get specialized suggestions
                  for living rooms, bedrooms, kitchens, bathrooms, and home
                  offices. Our AI understands the function and flow of different
                  spaces.
                  <Link
                    href="/professionals"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Learn how design professionals
                  </Link>{" "}
                  use these home ideas for client projects.
                </p>
              </div>

              <div className="border-l-4 border-teal-500 pl-6">
                <h3 className="text-xl font-semibold mb-3">
                  How do I choose the right colors for my home design?
                </h3>
                <p className="text-gray-600">
                  Color psychology meets personal style. Our AI analyzes your
                  space&apos;s lighting, size, and existing elements to suggest
                  color palettes that create the mood and atmosphere you want.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/workspace">Get Your Home Ideas Now</Link>
            </Button>
          </div>
        </div>
      </section>

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

      {/* Home Ideas Showcase Section */}
      <section className="w-full py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Explore Endless Home Ideas by Room Type
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From cozy living spaces to functional kitchens, discover
              personalized home design ideas tailored to every room in your
              house. Get inspired and see your vision come to life.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-4xl">🛋️</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">
                  Living Room Ideas
                </h3>
                <p className="text-gray-600 mb-4">
                  Create the perfect gathering space with modern furniture
                  arrangements, cozy color schemes, and smart storage solutions.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Modern & Contemporary styles</li>
                  <li>• Color coordination tips</li>
                  <li>• Furniture placement guides</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-4xl">🛏️</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">
                  Bedroom Design Ideas
                </h3>
                <p className="text-gray-600 mb-4">
                  Transform your bedroom into a peaceful retreat with calming
                  colors, optimal lighting, and personalized decor elements.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Relaxing color palettes</li>
                  <li>• Space optimization</li>
                  <li>• Lighting solutions</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <span className="text-4xl">🍳</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">
                  Kitchen Renovation Ideas
                </h3>
                <p className="text-gray-600 mb-4">
                  Design functional and beautiful kitchens with smart layouts,
                  modern appliances, and stylish backsplash options.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Layout optimization</li>
                  <li>• Cabinet & countertop ideas</li>
                  <li>• Backsplash designs</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Link href="/workspace">Start Your Home Transformation</Link>
            </Button>
            <p className="text-sm text-gray-500 mt-3">
              Upload any room photo and get instant AI-powered design
              suggestions
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16 justify-center flex flex-col items-center">
        <Heading as="h2" className="text-center">
          Latest Home Ideas & Design Inspiration
        </Heading>
        <Posts page={1} />
      </section>
    </>
  );
}
