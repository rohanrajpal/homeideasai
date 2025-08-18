"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SkinTone = "light" | "medium-light" | "medium" | "dark";

interface SkinToneSelectorProps {
  value: SkinTone;
  onChange: (tone: SkinTone, colorCode: string) => void;
}

const skinTones: Record<SkinTone, { colors: string[]; mainColor: string }> = {
  light: {
    colors: ["#f0e3dc", "#f8d7d8", "#f2d7be", "#f7c3af"],
    mainColor: "#f2d7be",
  },
  "medium-light": {
    colors: ["#debab0", "#e0999a", "#dda67c", "#d98a64"],
    mainColor: "#dda67c",
  },
  medium: {
    colors: ["#9a6b52", "#a25847", "#b37143", "#bf6951"],
    mainColor: "#b37143",
  },
  dark: {
    colors: ["#683929", "#34261f", "#64281b", "#4f2221"],
    mainColor: "#4f2221",
  },
};

export function SkinToneSelector({ value, onChange }: SkinToneSelectorProps) {
  return (
    <div className="flex items-center gap-3 mb-6 justify-left">
      {(Object.keys(skinTones) as SkinTone[]).map((tone) => (
        <button
          type="button"
          key={tone}
          onClick={() => onChange(tone, skinTones[tone].mainColor)}
          className={cn(
            "w-[72px] h-[38px] flex flex-wrap rounded-xl overflow-hidden cursor-pointer transition-all",
            value === tone ? "ring-2 ring-offset-2 ring-primary" : ""
          )}
        >
          {skinTones[tone].colors.map((color, index) => (
            <div
              key={index}
              className="w-1/2 h-1/2"
              style={{ backgroundColor: color }}
            />
          ))}
        </button>
      ))}
    </div>
  );
}
