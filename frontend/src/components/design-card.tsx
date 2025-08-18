import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

function getContrastColor(hexColor: string): string {
  // Remove the '#' if it's there
  hexColor = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for bright colors and white for dark colors
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

interface DesignCardProps {
  design: {
    id: string;
    created_at: string;
    image_urls: string[];
    description: string;
    skin_tone: string;
    skin_tone_color_code: string;
    color: string;
    shape: string;
    style: string;
    theme: string;
    technique: string;
  };
}

export function DesignCard({ design }: DesignCardProps) {
  return (
    <Card key={design.id}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Created on {new Date(design.created_at).toLocaleDateString()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {design.image_urls.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-md overflow-hidden"
            >
              <Image
                src={image}
                alt={`Generated nail design ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <h4 className="font-medium">Prompt:</h4>
          <p className="text-sm text-muted-foreground">{design.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs font-medium mb-1">Skin Tone:</p>
            <Badge
              variant="secondary"
              style={{
                backgroundColor: design.skin_tone_color_code,
                color: getContrastColor(design.skin_tone_color_code),
              }}
            >
              {design.skin_tone}
            </Badge>
          </div>
          <div>
            <p className="text-xs font-medium mb-1">Color:</p>
            <Badge variant="secondary">{design.color}</Badge>
          </div>
          <div>
            <p className="text-xs font-medium mb-1">Shape:</p>
            <Badge variant="secondary">{design.shape}</Badge>
          </div>
          <div>
            <p className="text-xs font-medium mb-1">Style:</p>
            <Badge variant="secondary">{design.style}</Badge>
          </div>
          <div>
            <p className="text-xs font-medium mb-1">Theme:</p>
            <Badge variant="secondary">{design.theme}</Badge>
          </div>
          <div>
            <p className="text-xs font-medium mb-1">Technique:</p>
            <Badge variant="secondary">{design.technique}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
