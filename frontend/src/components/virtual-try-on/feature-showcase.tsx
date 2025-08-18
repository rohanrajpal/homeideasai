import { Check } from "lucide-react";
import Image from "next/image";

const NAIL_IMAGES = [
  "https://cdn.nailsdesignai.com/nail_try_on/628c6aa3-2e75-42ae-ba74-5ee1cbc70f28.png",
  "https://cdn.nailsdesignai.com/nail_try_on/6cee1ed8-7834-49ad-8e20-d3cb11baf954.png",
  "https://cdn.nailsdesignai.com/nail_try_on/55bd882d-566b-48f2-9cdf-626a0b46d8a6.png",
  "https://cdn.nailsdesignai.com/nail_try_on/3c86c4f7-7836-4c6f-9252-f98c4006b608.png",
];

export function FeatureShowcase() {
  return (
    <section className="py-20">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Unlimited Creative Freedom
              </h2>
              <p className="text-xl text-muted-foreground">
                Unlike other apps that limit you to templates, our AI
                understands any design description you can imagine.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                "Describe any design in your own words",
                "AI understands complex patterns and techniques",
                "Preview multiple variations instantly",
                "Experiment with different lengths and shapes",
                "Try trending styles or create your own",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="bg-green-100 rounded-full p-1">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {NAIL_IMAGES.map((image, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-lg overflow-hidden"
              >
                <Image
                  src={image}
                  alt={`AI-generated nail design example ${i}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
