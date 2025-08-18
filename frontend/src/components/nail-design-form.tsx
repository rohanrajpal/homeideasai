"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from "@/components/pickers/color-picker";
import { ShapePicker } from "@/components/pickers/shape-picker";
import { ThemePicker } from "@/components/pickers/theme-picker";
import { TechniquePicker } from "@/components/pickers/technique-picker";
import { StylePicker } from "@/components/pickers/style-picker";
import { SkinToneSelector } from "@/components/skin-tone-selector";
import { DescriptionExamples } from "@/components/description-examples";
import { Lock, SparkleIcon } from "lucide-react";
import type { NailDesignFormData } from "@/types/nail-design";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface NailDesignFormProps {
  onSubmit: (data: NailDesignFormData) => void;
  isGenerating: boolean;
  resetTrigger?: number;
}

export function NailDesignForm({
  onSubmit,
  isGenerating,
  resetTrigger = 0,
}: NailDesignFormProps) {
  const initialFormData: NailDesignFormData = {
    skinTone: "light",
    skinToneColorCode: "#f2d7be",
    description: "",
    color: "None",
    shape: "None",
    style: "None",
    theme: "None",
    technique: "None",
  };

  const [formData, setFormData] = useState<NailDesignFormData>(initialFormData);
  const [showDialog, setShowDialog] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Reset form when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) {
      setFormData(initialFormData);
      // Focus the description textarea after a short delay to ensure the DOM is ready
      setTimeout(() => {
        descriptionRef.current?.focus();
      }, 100);
    }
  }, [resetTrigger]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleExampleSelect = (example: Partial<NailDesignFormData>) => {
    setFormData((prev) => ({ ...prev, ...example }));
  };

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleGenerateClick = () => {
    if (!isAuthenticated) {
      setShowDialog(true);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Skin tone range</Label>
          <SkinToneSelector
            value={formData.skinTone}
            onChange={(skinTone) => setFormData({ ...formData, skinTone })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Describe what you want to see</Label>
          <Textarea
            ref={descriptionRef}
            id="description"
            placeholder="Elegant marble swirls with subtle glitter highlights"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="h-20 sm:h-24"
          />
        </div>

        <div className="space-y-2">
          <DescriptionExamples onSelect={handleExampleSelect} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Color</Label>
            <ColorPicker
              value={formData.color}
              onChange={(color) => setFormData({ ...formData, color })}
            />
          </div>
          <div className="space-y-2">
            <Label>Shape</Label>
            <ShapePicker
              value={formData.shape}
              onChange={(shape) => setFormData({ ...formData, shape })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Style</Label>
            <StylePicker
              value={formData.style}
              onChange={(style) => setFormData({ ...formData, style })}
            />
          </div>
          <div className="space-y-2">
            <Label>Theme</Label>
            <ThemePicker
              value={formData.theme}
              onChange={(theme) => setFormData({ ...formData, theme })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Technique</Label>
          <TechniquePicker
            value={formData.technique}
            onChange={(technique) => setFormData({ ...formData, technique })}
          />
        </div>

        <Button
          type={isAuthenticated ? "submit" : "button"}
          className="w-full bg-pink-500 hover:bg-pink-600"
          disabled={isGenerating}
          onClick={handleGenerateClick}
        >
          {isGenerating ? (
            "Generating..."
          ) : !isAuthenticated ? (
            <>
              <Lock className="w-4 h-4 mr-2" /> Unlock to generate
            </>
          ) : (
            <>
              <SparkleIcon className="h-6 w-6 text-white" />
              Generate
            </>
          )}
        </Button>

        {!isAuthenticated && (
          <div className="text-center">
            <span className="text-sm text-muted-foreground">or</span>
            <Button variant="link" className="text-sm" asChild>
              <Link href="/login?redirect=/create">Login to continue</Link>
            </Button>
          </div>
        )}
      </form>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              You need to create an account or login to use this tool.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button asChild variant="secondary">
              <Link href="/login?redirect=/create">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register?redirect=/create">Create Account</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
