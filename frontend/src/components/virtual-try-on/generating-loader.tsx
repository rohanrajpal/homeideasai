import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const puns = [
  "Getting our nail-ty bits together...",
  "Polishing up your design...",
  "Brushing up on our nail art skills...",
  "Nailing down the perfect look...",
  "Adding a glossy finish to your idea...",
  "Buffing out the details...",
  "Painting a pretty picture just for you...",
  "Letting your design dry to perfection...",
  "Giving your nails a makeover...",
  "Putting the 'art' in nail art...",
];

export function GeneratingLoader() {
  const [currentPun, setCurrentPun] = useState(puns[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPun(puns[Math.floor(Math.random() * puns.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg p-8">
      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
      <p className="text-lg font-medium text-center animate-pulse">
        {currentPun}
      </p>
    </div>
  );
}
