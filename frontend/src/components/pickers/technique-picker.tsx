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
import type { NailTechnique } from "@/types/nail-design";

interface TechniquePickerProps {
  value: NailTechnique;
  onChange: (technique: NailTechnique) => void;
}

const TECHNIQUES: NailTechnique[] = [
  "None",
  "Airbrush",
  "Cat Eye",
  "Chrome",
  "Dip",
  "French Tip",
  "Glitter",
  "Marble",
  "Ombre Dip Powder",
  "Ombre Glitter",
  "Ombre",
  "Powder Dip",
  "Swirl",
];

export function TechniquePicker({ value, onChange }: TechniquePickerProps) {
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
          <DialogTitle>Pick a technique</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TECHNIQUES.map((technique) => (
            <Button
              key={technique}
              variant={technique === value ? "default" : "outline"}
              onClick={() => {
                onChange(technique);
                setOpen(false);
              }}
              className="w-full"
            >
              {technique}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
