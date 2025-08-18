"use client";

import { generateNailDesigns } from "@/app/clientService";
import { NailDesignForm } from "@/components/nail-design-form";
import { NailDesignResults } from "@/components/nail-design-results";
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
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NailDesignFormData } from "@/types/nail-design";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUser } from "@/components/user-context";

export function NailDesigner() {
  const { creditsAvailable, refreshUserData } = useUser();
  const [results, setResults] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "results">("form");
  const [resetTrigger, setResetTrigger] = useState(0);
  const [previousDesigns, setPreviousDesigns] = useState<
    Array<
      NailDesignFormData & { id: string; images: string[]; createdAt: string }
    >
  >([]);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] =
    useState(false);

  const handleGenerate = async (formData: NailDesignFormData) => {
    setIsGenerating(true);
    setActiveTab("results");
    const response = await generateNailDesigns({
      body: {
        skin_tone: formData.skinTone,
        skin_tone_color_code: formData.skinToneColorCode,
        description: formData.description,
        color: formData.color,
        shape: formData.shape,
        style: formData.style,
        theme: formData.theme,
        technique: formData.technique,
      },
    });

    if (response.error) {
      setIsGenerating(false);
      if (
        response.status === 400 &&
        response.error.detail === "Insufficient credits"
      ) {
        setShowInsufficientCreditsModal(true);
      }
      return;
    }

    setResults(response.data?.image_urls || []);
    setIsGenerating(false);
    refreshUserData();
  };

  const handleGenerateNext = () => {
    setResults([]);
    setActiveTab("form");
    setResetTrigger((prev) => prev + 1);
  };

  const faqs = [
    {
      question: "How do I generate a nail design?",
      answer:
        "Fill out the form with your desired specifications and click 'Generate'.",
    },
    {
      question: "Can I save my designs?",
      answer:
        "Yes, all your generated designs are saved in your account for future access.",
    },
    {
      question: "How many designs can I generate?",
      answer:
        "You can generate unlimited designs. Each generation uses 1 credit.",
    },
  ];

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "form" | "results")}
        className="sm:hidden"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Design</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="grid gap-6 sm:grid-cols-2">
        <Card
          className={`p-6 ${activeTab === "form" ? "sm:block" : "hidden sm:block"}`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
            <h1 className="flex items-center gap-2 text-lg font-semibold">
              AI Nail Art Generator 💅
            </h1>
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
          </div>
          <NailDesignForm
            onSubmit={handleGenerate}
            isGenerating={isGenerating}
            resetTrigger={resetTrigger}
          />
        </Card>
        <Card
          className={`p-6 ${activeTab === "results" ? "sm:block" : "hidden sm:block"}`}
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-6">
            Your nail designs will appear here 👋
          </h2>
          <NailDesignResults
            results={results}
            isLoading={isGenerating}
            previousDesigns={previousDesigns}
            onGenerateNext={handleGenerateNext}
          />
        </Card>
      </div>
      <AlertDialog
        open={showInsufficientCreditsModal}
        onOpenChange={setShowInsufficientCreditsModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Insufficient Credits</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            It looks like you've run out of credits. To continue creating
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
      <Accordion type="single" collapsible className="w-full px-2 sm:px-0">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
