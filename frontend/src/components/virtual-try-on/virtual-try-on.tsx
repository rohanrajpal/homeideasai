"use client";

import { useEffect, useState } from "react";
import { ImageUpload } from "./image-upload";
import { PromptInput } from "./prompt-input";
import { ResultDisplay } from "./result-display";
import { GeneratingLoader } from "./generating-loader";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getUserTryOns, tryOnNailDesign } from "@/app/openapi-client";
import Image from "next/image";
import { useUser } from "@/components/user-context";
import { useAuth } from "@/components/auth-context";
import Link from "next/link";

export function VirtualTryOn() {
  const { creditsAvailable, refreshUserData } = useUser();
  const { isAuthenticated } = useAuth();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [nailLength, setNailLength] = useState(1.5);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] =
    useState(false);
  const [previousGenerations, setPreviousGenerations] = useState<
    { prompt: string; image: string }[]
  >([]);

  useEffect(() => {
    const fetchPreviousGenerations = async () => {
      if (!isAuthenticated) return;
      const response = await getUserTryOns();
      setPreviousGenerations(
        response.data?.map((gen) => ({
          prompt: gen.prompt,
          image: gen.result_image_url,
        })) || []
      );
    };
    fetchPreviousGenerations();
  }, [isAuthenticated]);

  const handleGenerate = async () => {
    if (!uploadedImage || !prompt) return;
    if (!isAuthenticated) {
      window.location.href = "/register";
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null); // Clear any previous generated image
    try {
      const imageBlob = await fetch(uploadedImage).then((r) => r.blob());

      const response = await tryOnNailDesign({
        body: { image: imageBlob, prompt, extension_factor: nailLength },
      });

      if (response.error) {
        console.error("Error generating nail art:", response.error);
        if (
          response.status === 400 &&
          response.error.detail === "Insufficient credits"
        ) {
          setShowInsufficientCreditsModal(true);
        }
        return;
      }

      const data = response.data;
      setGeneratedImage(data.result_image_url);
      refreshUserData();
    } catch (error) {
      console.error("Error generating nail art:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            Virtual Try-On 💅
          </h2>
          {isAuthenticated ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
                <span className="text-sm font-medium">Credits:</span>
                <span className="text-sm font-bold">{creditsAvailable}</span>
              </div>
              {creditsAvailable <= 5 && (
                <a
                  href="/pricing"
                  className="inline-flex px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                >
                  Buy More
                </a>
              )}
            </div>
          ) : (
            <a
              href="/register"
              className="inline-flex px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              Login to Try
            </a>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ImageUpload onImageUpload={setUploadedImage} />
            {/* <NailLengthPicker value={nailLength} onChange={setNailLength} /> */}
            <PromptInput value={prompt} onChange={setPrompt} />
            <div className="flex space-x-4">
              {isAuthenticated ? (
                <Button
                  onClick={handleGenerate}
                  disabled={
                    !uploadedImage ||
                    !prompt ||
                    isGenerating ||
                    !isAuthenticated
                  }
                  className="flex-1"
                >
                  {isGenerating
                    ? "Generating..."
                    : isAuthenticated
                      ? "Generate Nail Art"
                      : "Login to Generate"}
                </Button>
              ) : (
                <Button className="flex-1" asChild>
                  <Link href="/register">Login to Generate</Link>
                </Button>
              )}
              {isAuthenticated && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <History className="mr-2 h-4 w-4" />
                      History
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Previous Generations</SheetTitle>
                      <SheetDescription>
                        Your recent nail art designs
                      </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-10rem)] mt-4">
                      <div className="space-y-4">
                        {previousGenerations.map((gen, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <Image
                              src={gen.image || "/placeholder.svg"}
                              alt={`Generation ${index + 1}`}
                              className="w-full h-auto rounded-lg mb-2"
                              width={400}
                              height={400}
                            />
                            <p className="text-sm text-muted-foreground">
                              {gen.prompt}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
          <div className="relative aspect-square">
            {isGenerating ? (
              <GeneratingLoader />
            ) : (
              <ResultDisplay
                originalImage={uploadedImage}
                generatedImage={generatedImage}
              />
            )}
          </div>
        </div>
      </Card>
      <AlertDialog
        open={showInsufficientCreditsModal}
        onOpenChange={setShowInsufficientCreditsModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Insufficient Credits</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            It looks like you&apos;ve run out of credits. To continue creating
            stunning nail designs, please consider upgrading your plan.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowInsufficientCreditsModal(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <a href="/pricing" className="btn-primary">
                View Pricing Plans
              </a>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
