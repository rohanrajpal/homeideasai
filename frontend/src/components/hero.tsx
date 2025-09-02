import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export async function Hero() {
  // Use your actual home design transformation images
  const examples = [
    {
      title: "Living Room Transformation",
      description:
        "See how AI transforms ordinary spaces into stunning interiors",
      imageUrl:
        "https://homeideasai.s3.eu-central-1.amazonaws.com/examples/room-after.webp",
      roomType: "Living Room",
      designStyle: "Modern Contemporary",
    },
    {
      title: "Sketch to Reality",
      description: "From rough sketches to photorealistic renders in seconds",
      imageUrl:
        "https://homeideasai.s3.eu-central-1.amazonaws.com/examples/sketch-to-render-after.webp",
      roomType: "Any Space",
      designStyle: "Professional Render",
    },
    {
      title: "Complete Room Makeover",
      description: "Watch your room come to life with AI-powered design",
      imageUrl:
        "https://homeideasai.s3.eu-central-1.amazonaws.com/examples/room-after.webp",
      roomType: "Bedroom",
      designStyle: "Contemporary",
    },
    {
      title: "Design Visualization",
      description: "Turn your ideas into beautiful, realistic room designs",
      imageUrl:
        "https://homeideasai.s3.eu-central-1.amazonaws.com/examples/sketch-to-render-after.webp",
      roomType: "Office",
      designStyle: "Modern",
    },
  ];
  return (
    <section className="w-full py-20 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-blue-50 to-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Get Unlimited Home Ideas with AI 🏠
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Discover endless home ideas for every room. Upload a photo and
              chat with AI to get personalized design inspiration, decoration
              suggestions, and professional home makeover ideas instantly.
            </p>
          </div>
          <div className="w-full max-w-sm space-y-2">
            <Button className="w-full" size="lg" asChild>
              <Link href="/workspace">Start Designing</Link>
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Join 1000+ homeowners and designers.
            </p>
          </div>
        </div>
      </div>
      {/* <div className="container px-4 md:px-6 mt-12 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {examples.map((example, index) => (
            <div
              key={example.title}
              className="relative aspect-square overflow-hidden rounded-xl group"
            >
              <Image
                src={example.imageUrl}
                alt={`AI home design: ${example.title}`}
                width={780}
                height={780}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 items-center justify-center hidden group-hover:flex">
                <p className="text-white text-xs lg:text-sm p-4 text-center">
                  {example.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </section>
  );
}
