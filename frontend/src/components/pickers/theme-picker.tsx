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
import type { NailTheme } from "@/types/nail-design";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ThemePickerProps {
  value: NailTheme;
  onChange: (theme: NailTheme) => void;
}

const THEMES: NailTheme[] = [
  "None",
  "Fall",
  "Spring",
  "Summer",
  "Winter",
  "4th Of July",
  "Christmas",
  "Easter",
  "Halloween",
  "New Year",
  "St Patrick's Day",
  "Thanksgiving",
  "Valentine's Day",
  "Beach",
  "Birthday",
  "Celebration",
  "Cruise",
  "Holiday",
  "Party",
  "Vacation",
  "Wedding",
];

export function ThemePicker({ value, onChange }: ThemePickerProps) {
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
          <DialogTitle>Pick a theme</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[200px] w-full">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {THEMES.map((theme) => (
              <Button
                key={theme}
                variant={theme === value ? "default" : "outline"}
                onClick={() => {
                  onChange(theme);
                  setOpen(false);
                }}
                className="w-full"
              >
                {theme}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
