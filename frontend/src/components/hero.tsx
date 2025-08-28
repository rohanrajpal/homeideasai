import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getExamples } from "@/sanity/queries";
import { urlFor } from "@/sanity/lib/image";

export async function Hero() {
  const examples = await getExamples(4);
  return (
    <section className="w-full py-20 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-blue-50 to-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Transform Your Home with AI 🏠
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Upload a photo of any room and chat with AI to redesign it
              instantly. Get professional interior design suggestions and
              visualizations in seconds.
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
      <div className="container px-4 md:px-6 mt-12 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {examples.map((example: any) => (
            <div
              key={example.prompt}
              className="relative aspect-square overflow-hidden rounded-xl group"
            >
              <Image
                src={urlFor(example.image).size(780, 780).url()}
                alt={`AI home design ${example.prompt}`}
                width={780}
                height={780}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 items-center justify-center hidden group-hover:flex">
                <p className="text-white text-xs lg:text-sm p-4">
                  {example.prompt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
