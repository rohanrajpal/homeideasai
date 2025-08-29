import Image from "next/image";

export function BeforeAfterShowcase() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              See the Magic in Action
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Real transformations from our AI-powered interior designer
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl mt-16">
          {/* Room Transformation */}
          <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
            <div className="space-y-4">
              <div className="relative">
                <Image
                  src="https://homeideasai.s3.eu-central-1.amazonaws.com/examples/room-before.webp"
                  alt="Room before AI transformation"
                  className="rounded-lg shadow-lg w-full"
                  width={500}
                  height={400}
                />
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  BEFORE
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Image
                  src="https://homeideasai.s3.eu-central-1.amazonaws.com/examples/room-after.webp"
                  alt="Room after AI transformation"
                  className="rounded-lg shadow-lg w-full"
                  width={500}
                  height={400}
                />
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  AFTER
                </div>
              </div>
            </div>
          </div>

          {/* Sketch to Render Transformation */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="md:order-2 space-y-4">
              <div className="relative">
                <Image
                  src="https://homeideasai.s3.eu-central-1.amazonaws.com/examples/sketch-to-render-before.webp"
                  alt="Sketch before AI rendering"
                  className="rounded-lg shadow-lg w-full"
                  width={500}
                  height={400}
                />
                <div className="absolute top-4 left-4 bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  SKETCH
                </div>
              </div>
            </div>
            <div className="md:order-1 space-y-4">
              <div className="relative">
                <Image
                  src="https://homeideasai.s3.eu-central-1.amazonaws.com/examples/sketch-to-render-after.webp"
                  alt="Professional render from sketch"
                  className="rounded-lg shadow-lg w-full"
                  width={500}
                  height={400}
                />
                <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  AI RENDER
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-8">
              From rough sketches to photorealistic renders, or existing rooms
              to stunning makeovers
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Transform Your Space?
              </h3>
              <p className="text-gray-600 mb-6">
                Join thousands of homeowners who have already transformed their
                spaces with HomeIdeasAI
              </p>
              <div className="flex justify-center">
                <a
                  href="/workspace"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-8 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700"
                >
                  Start Your Transformation
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
