"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

interface HomeDesignExample {
  title: string;
  description: string;
  beforeImage: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  afterImage: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  prompt: string;
  roomType: string;
  designStyle: string;
  tags?: string[];
  featured?: boolean;
}

interface HomeDesignExamplesProps {
  examples: HomeDesignExample[];
  title?: string;
  showNavigation?: boolean;
}

export function HomeDesignExamples({
  examples,
  title = "Transform Your Space with AI",
  showNavigation = true,
}: HomeDesignExamplesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageView, setImageView] = useState<"before" | "after">("after");

  const currentExample = examples[currentIndex];

  const nextExample = () => {
    setCurrentIndex((prev) => (prev + 1) % examples.length);
    setImageView("after"); // Reset to after view when changing examples
  };

  const prevExample = () => {
    setCurrentIndex((prev) => (prev - 1 + examples.length) % examples.length);
    setImageView("after"); // Reset to after view when changing examples
  };

  if (!examples.length) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See real transformations created with HomeIdeasAI. Upload your space
            and get similar stunning results.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="flex gap-2 justify-center">
              <Button
                variant={imageView === "before" ? "default" : "outline"}
                size="sm"
                onClick={() => setImageView("before")}
                disabled={!currentExample.beforeImage}
              >
                Before
              </Button>
              <Button
                variant={imageView === "after" ? "default" : "outline"}
                size="sm"
                onClick={() => setImageView("after")}
              >
                After
              </Button>
            </div>

            <Card className="relative overflow-hidden aspect-[4/3]">
              <Image
                src={
                  imageView === "before" && currentExample.beforeImage
                    ? currentExample.beforeImage.asset.url
                    : currentExample.afterImage.asset.url
                }
                alt={
                  imageView === "before" && currentExample.beforeImage?.alt
                    ? currentExample.beforeImage.alt
                    : currentExample.afterImage.alt || currentExample.title
                }
                fill
                className="object-cover transition-all duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* Image View Badge */}
              <div className="absolute top-4 left-4">
                <Badge
                  variant={imageView === "before" ? "secondary" : "default"}
                >
                  {imageView === "before" ? "Original" : "AI Enhanced"}
                </Badge>
              </div>

              {/* Navigation Arrows */}
              {showNavigation && examples.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                    onClick={prevExample}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                    onClick={nextExample}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </Card>

            {/* Example indicators */}
            {examples.length > 1 && (
              <div className="flex justify-center gap-2">
                {examples.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    }`}
                    onClick={() => {
                      setCurrentIndex(index);
                      setImageView("after");
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold mb-3">
                {currentExample.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {currentExample.description}
              </p>
            </div>

            {/* Room Details */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {currentExample.roomType.replace("_", " ")}
              </Badge>
              <Badge variant="outline">
                {currentExample.designStyle.replace("_", " ")}
              </Badge>
              {currentExample.featured && (
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-600">
                  Featured
                </Badge>
              )}
            </div>

            {/* Prompt */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Design Prompt:</h4>
              <p className="text-sm text-muted-foreground italic">
                "{currentExample.prompt}"
              </p>
            </div>

            {/* Tags */}
            {currentExample.tags && currentExample.tags.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Features:</h4>
                <div className="flex flex-wrap gap-1">
                  {currentExample.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="pt-4">
              <Button asChild className="w-full">
                <a href="/workspace">
                  Start Your Design
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
