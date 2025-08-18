import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { NailDesignFormData } from "@/types/nail-design";

interface DescriptionExample extends Partial<NailDesignFormData> {
  title: string;
  description: string;
  skinTone: NailDesignFormData["skinTone"];
  skinToneColorCode: string;
}

const examples: DescriptionExample[] = [
  {
    title: "Ethereal Galaxy",
    description:
      "Deep blue base with swirling patterns of purple, pink, and silver, accented with tiny white dots resembling stars",
    skinTone: "light",
    skinToneColorCode: "#f2d7be",
    color: "Navy Blue",
    shape: "Almond",
    style: "Abstract",
    theme: "None",
    technique: "Marble",
  },
  {
    title: "Tropical Paradise",
    description:
      "Vibrant green base with delicate palm tree silhouettes and small orange flowers, creating a beachy vibe",
    skinTone: "medium-light",
    skinToneColorCode: "#dda67c",
    color: "Light Green",
    shape: "Square",
    style: "Tropical",
    theme: "Summer",
    technique: "Airbrush",
  },
  {
    title: "Vintage Lace",
    description:
      "Soft ivory base with intricate white lace patterns, giving an elegant and timeless look",
    skinTone: "medium",
    skinToneColorCode: "#b37143",
    color: "Beige",
    shape: "Oval",
    style: "Elegant",
    theme: "Wedding",
    technique: "French Tip",
  },
  {
    title: "Neon Geometric",
    description:
      "Black base with bold neon pink, yellow, and blue geometric shapes for a striking, modern look",
    skinTone: "dark",
    skinToneColorCode: "#4f2221",
    color: "Black",
    shape: "Coffin",
    style: "Abstract",
    theme: "Party",
    technique: "Neon",
  },
];

interface DescriptionExamplesProps {
  onSelect: (example: DescriptionExample) => void;
}

export function DescriptionExamples({ onSelect }: DescriptionExamplesProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Need inspiration?
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] sm:w-[600px] p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium leading-none">Example Designs</h3>
            <p className="text-sm text-muted-foreground">
              Click any example to use it as a starting point
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {examples.map((example, index) => (
              <Card
                key={index}
                className="cursor-pointer transition-colors hover:bg-accent"
                onClick={() => onSelect(example)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-4 h-4 mt-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: example.skinToneColorCode }}
                    />
                    <div className="space-y-1">
                      <h4 className="font-medium leading-none">
                        {example.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {example.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
