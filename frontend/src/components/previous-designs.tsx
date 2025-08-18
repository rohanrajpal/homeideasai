import {
  getUserNailDesigns,
  GetUserNailDesignsResponse,
} from "@/app/openapi-client";
import { DesignCard } from "@/components/design-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface PreviousDesignsProps {
  onGenerateNext?: () => void;
}

export function PreviousDesigns({ onGenerateNext }: PreviousDesignsProps) {
  const [designs, setDesigns] = useState<GetUserNailDesignsResponse>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await getUserNailDesigns();
        setDesigns(response.data || []);
      } catch (err) {
        setError("Failed to fetch designs");
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        {designs.map((design) => (
          <div key={design.id} className="space-y-4">
            <DesignCard design={design} />
            {onGenerateNext && (
              <Button onClick={onGenerateNext} className="w-full">
                Generate Next Design
              </Button>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
