"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { NailColor } from "@/types/nail-design";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ColorPickerProps {
  value: NailColor;
  onChange: (color: NailColor) => void;
}

const COLORS: NailColor[] = [
  "None",
  "Baby Blue",
  "Beige",
  "Black",
  "Blue",
  "Brown",
  "Burgundy",
  "Dark Purple",
  "Emerald Green",
  "Gold",
  "Green",
  "Grey",
  "Hot Pink",
  "Light Blue",
  "Light Green",
  "Light Purple",
  "Lime Green",
  "Maroon",
  "Metallic",
  "Navy Blue",
  "Neutral",
  "Nude",
  "Orange",
  "Pink",
  "Purple",
  "Red",
  "Rose Gold",
  "Royal Blue",
  "Silver",
  "Tan",
  "Turkey",
  "White",
  "Yellow",
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {value}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pick a color</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[200px] w-full">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {COLORS.map((color) => (
              <Button
                key={color}
                variant={color === value ? "default" : "outline"}
                onClick={() => {
                  onChange(color);
                  setOpen(false);
                }}
                className="w-full"
              >
                {color}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
