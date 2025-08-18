"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";

const NAIL_IMAGES = [
  "https://cdn.nailsdesignai.com/nail_try_on/original/29be84c8-cc20-44d8-991c-bfe2b13ab62a.png",
  "https://cdn.nailsdesignai.com/nail_try_on/750b29b9-0146-43b2-8bc8-58e81c923a69.png",
  "https://cdn.nailsdesignai.com/nail_try_on/628c6aa3-2e75-42ae-ba74-5ee1cbc70f28.png",
  "https://cdn.nailsdesignai.com/nail_try_on/6cee1ed8-7834-49ad-8e20-d3cb11baf954.png",
  "https://cdn.nailsdesignai.com/nail_try_on/original/e86d1e8e-a628-4f8c-990c-175d7a789536.png",
  "https://cdn.nailsdesignai.com/nail_try_on/55bd882d-566b-48f2-9cdf-626a0b46d8a6.png",
  "https://cdn.nailsdesignai.com/nail_try_on/3c86c4f7-7836-4c6f-9252-f98c4006b608.png",
];

export function VirtualTryOnHero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % NAIL_IMAGES.length);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleTryItClick = () => {
    if (isAuthenticated) {
      router.push("/try-on-tool");
    } else {
      router.push("/register?redirect=/try-on-tool");
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-pink-50 to-white pt-24 pb-16">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Your Dream Nails,{" "}
                <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                  Before The Salon
                </span>
              </h1>
              <p className="text-xl text-muted-foreground md:text-2xl">
                Describe any nail design you can imagine, and our AI will show
                exactly how it looks on your hands. No templates, no limits –
                just pure creativity.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-pink-600 hover:bg-pink-700"
                onClick={handleTryItClick}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Try It Free
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>
            {/* <div className="flex items-center gap-4 text-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white bg-gray-200"
                  />
                ))}
              </div>
              <p className="text-muted-foreground">
                Join 10,000+ nail enthusiasts already using AI designs
              </p>
            </div> */}
          </div>
          <div className="relative lg:ml-8">
            <div className="relative aspect-square rounded-2xl overflow-hidden border shadow-2xl">
              <Image
                src={NAIL_IMAGES[currentImageIndex]}
                alt="AI Nail Design demonstration"
                fill
                className="object-cover transition-opacity duration-500"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4 max-w-[200px]">
              <p className="text-sm font-medium">
                &ldquo;Just described my dream design and got exactly what I
                wanted!&rdquo;
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sarah K., Nail Artist
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
