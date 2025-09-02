import Image from "next/image";

export function FeatureShowcase() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              AI-Powered Home Ideas Generator
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Turn any space into your dream home with intelligent design
              suggestions and creative home ideas powered by advanced AI
              technology
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 mt-12">
          <Image
            src="https://homeideasai.s3.eu-central-1.amazonaws.com/examples/homeideasai-designer.webp"
            alt="HomeIdeasAI Designer Interface"
            className="rounded-lg shadow-lg w-full"
            width={900}
            height={600}
          />
          <div className="flex flex-col justify-center space-y-4">
            <h3 className="text-2xl font-bold">Transform Any Space</h3>
            <ul className="space-y-2">
              <li>• 20+ interior design styles</li>
              <li>• Custom color schemes and palettes</li>
              <li>• Furniture and decor suggestions</li>
              <li>• Real-time design visualization</li>
              <li>• Chat-based AI design assistance</li>
            </ul>
            <p className="text-gray-500">
              Upload any room photo and chat with our AI to explore countless
              design possibilities. Get professional-quality interior design
              suggestions tailored to your space and style preferences.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
