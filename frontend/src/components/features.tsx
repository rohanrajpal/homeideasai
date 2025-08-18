import Image from "next/image";

export function FeatureShowcase() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Endless Possibilities
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Explore the wide range of options to create your perfect nail
              design
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 mt-12">
          <Image
            src="https://cdn.homeideasai.com/homeideasai-feature-showcase.webp"
            alt="HomeIdeasAI Tool Interface"
            className="rounded-lg shadow-lg w-full"
            width={900}
            height={600}
          />
          <div className="flex flex-col justify-center space-y-4">
            <h3 className="text-2xl font-bold">Customizable Options</h3>
            <ul className="space-y-2">
              <li>• 30+ nail shapes</li>
              <li>• 50+ color options</li>
              <li>• 20+ themes (seasonal, occasion-based)</li>
              <li>• 15+ nail art techniques</li>
              <li>• Unlimited style combinations</li>
            </ul>
            <p className="text-gray-500">
              With our AI-powered tool, you have millions of possible
              combinations at your fingertips. Create designs that are truly
              unique and personalized to your style.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
