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
import type { NailStyle } from "@/types/nail-design";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StylePickerProps {
  value: NailStyle;
  onChange: (style: NailStyle) => void;
}

const STYLES: NailStyle[] = [
  "None",
  "3d",
  "Abstract",
  "Aesthetic",
  "Basic",
  "Bee",
  "Boho",
  "Butterfly",
  "Candy Cane",
  "Cheetah Print",
  "Classic",
  "Clear",
  "Colorful",
  "Cow",
  "Cute",
  "Elegant",
  "Evil Eye",
  "Fire",
  "Floral",
  "Flower",
  "Foil",
  "Fun",
  "Gothic",
  "Hawaii",
  "Heart",
  "Lavender",
  "Leopard Print",
  "Lilac",
  "Mermaid",
  "Minimalist",
  "Neon",
  "Palm Tree",
  "Peach",
  "Plaid",
  "Preppy",
  "Professional",
  "Rainbow",
  "Small",
  "Snowflake",
  "Spider Web",
  "Spooky",
  "Trendy",
  "Tropical",
  "Ugly",
  "Unique",
  "Yin Yang",
];

export function StylePicker({ value, onChange }: StylePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {value}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pick a style</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[200px] w-full">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STYLES.map((style) => (
              <Button
                key={style}
                variant={style === value ? "default" : "outline"}
                onClick={() => {
                  onChange(style);
                  setOpen(false);
                }}
                className="w-full"
              >
                {style}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
