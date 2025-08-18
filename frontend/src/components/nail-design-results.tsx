import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreviousDesigns } from "@/components/previous-designs";
import type { NailDesignFormData } from "@/types/nail-design";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NailDesignResultsProps {
  results: string[];
  isLoading?: boolean;
  previousDesigns: Array<
    NailDesignFormData & { id: string; images: string[]; createdAt: string }
  >;
  onGenerateNext: () => void;
}

export function NailDesignResults({
  results,
  isLoading,
  previousDesigns,
  onGenerateNext,
}: NailDesignResultsProps) {
  const [activeTab, setActiveTab] = useState("new");

  const handleGenerateNext = () => {
    setActiveTab("new");
    onGenerateNext();
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="new">
      <TabsList className="w-full mb-4">
        <TabsTrigger value="new" className="flex-1">
          New
        </TabsTrigger>
        <TabsTrigger value="previous" className="flex-1">
          Previous
        </TabsTrigger>
      </TabsList>
      <TabsContent value="new">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">
              Generating your unique nail design...
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <p className="text-muted-foreground">
              Fill out the quick form, then click the button, and our AI will
              generate a unique nail design just for you!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {results.map((result, index) => (
              <div key={index} className="space-y-4">
                <div className="relative aspect-square overflow-hidden rounded-lg border">
                  <Image
                    src={result}
                    alt={`Generated nail design ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <Button onClick={handleGenerateNext} className="w-full">
                  Generate Next Design
                </Button>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="previous">
        <PreviousDesigns onGenerateNext={handleGenerateNext} />
      </TabsContent>
    </Tabs>
  );
}
