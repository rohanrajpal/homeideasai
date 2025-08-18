"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";

interface ResultDisplayProps {
  originalImage: string | null;
  generatedImage: string | null;
}

export function ResultDisplay({
  originalImage,
  generatedImage,
}: ResultDisplayProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  if (!generatedImage) return null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative">
        <div className="relative aspect-square">
          <Image
            src={
              showOriginal
                ? originalImage || "/placeholder.svg"
                : generatedImage
            }
            alt={showOriginal ? "Original image" : "Generated nail art"}
            fill
            className="object-cover transition-opacity duration-300"
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-4 right-4"
          onClick={() => setShowOriginal(!showOriginal)}
        >
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          {showOriginal ? "View Generated" : "Compare Original"}
        </Button>
      </CardContent>
    </Card>
  );
}
