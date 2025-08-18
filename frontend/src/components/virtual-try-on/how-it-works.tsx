import { Camera, Sparkles, MessageSquare, Share2 } from "lucide-react";
import Link from "next/link";

export function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50" id="how-it-works">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Four Steps to Perfect Nails
          </h2>
          <p className="text-xl text-muted-foreground mx-auto max-w-[800px]">
            No more guessing how a design will look. See it on your hands before
            visiting the salon.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {[
            {
              icon: Camera,
              title: "Upload Your Photo",
              description:
                "Take a photo of your hands or choose one from your gallery",
            },
            {
              icon: MessageSquare,
              title: "Describe Your Dream Design",
              description:
                "Tell us exactly what you want - from simple to elaborate designs",
            },
            {
              icon: Sparkles,
              title: "AI Magic",
              description:
                "Watch as our AI transforms your description into stunning nail art",
            },
            {
              icon: Share2,
              title: "Share & Save",
              description:
                "Save your favorites and share with your nail artist or friends",
            },
          ].map((step, i) => (
            <Link href="/try-on-tool" key={i}>
              <div key={i} className="relative">
                <div className="bg-white rounded-lg p-6 shadow-lg relative z-10">
                  <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-12 w-24 border-t-2 border-dashed border-gray-300" />
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
