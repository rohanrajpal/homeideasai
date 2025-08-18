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
import type { NailShape } from "@/types/nail-design";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ShapePickerProps {
  value: NailShape;
  onChange: (shape: NailShape) => void;
}

const SHAPES: NailShape[] = [
  "None",
  "Almond",
  "Coffin",
  "Oval",
  "Square",
  "Stiletto",
];

export function ShapePicker({ value, onChange }: ShapePickerProps) {
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
          <DialogTitle>Pick a shape</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[200px] w-full">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SHAPES.map((shape) => (
              <Button
                key={shape}
                variant={shape === value ? "default" : "outline"}
                onClick={() => {
                  onChange(shape);
                  setOpen(false);
                }}
                className="w-full"
              >
                {shape}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
