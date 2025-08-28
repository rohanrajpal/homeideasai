import { Brush, Sparkles, Download } from "lucide-react";
import Link from "next/link";

export function HowItWorks() {
  return (
    <section className="w-full md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              How It Works
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Create stunning nail designs in three simple steps
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            {
              icon: Brush,
              title: "Describe Your Idea",
              description:
                "Tell us what kind of nail design you're looking for - from simple to elaborate.",
            },
            {
              icon: Sparkles,
              title: "AI Generates Designs",
              description:
                "Our AI will create multiple unique nail design options based on your description.",
            },
            {
              icon: Download,
              title: "Choose & Download",
              description:
                "Pick your favorite designs and download high-resolution images ready for use.",
            },
          ].map((step, index) => (
            <Link href="/workspace" key={index}>
              <div
                key={index}
                className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg"
              >
                <div className="p-2 bg-pink-100 rounded-full">
                  <step.icon className="w-6 h-6 text-pink-500" />
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
