"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/components/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AccountDeletionForm() {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteOption, setDeleteOption] = useState<"full" | "partial">("full");
  const [confirmed, setConfirmed] = useState(false);

  // Show login prompt if not authenticated
  if (!loading && !isAuthenticated) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please{" "}
          <Link href={`/login?redirect=${pathname}`} className="underline">
            log in
          </Link>{" "}
          to access account deletion.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would implement the actual deletion request
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Deletion Request Received</AlertTitle>
        <AlertDescription>
          We have received your account deletion request. You will receive an
          email confirmation within 24 hours with further instructions. If you
          don't receive the email, please contact our support team.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>What would you like to delete?</Label>
          <Select
            value={deleteOption}
            onValueChange={(value: "full" | "partial") =>
              setDeleteOption(value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select deletion type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full account deletion</SelectItem>
              <SelectItem value="partial">Partial data deletion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {deleteOption === "partial" && (
          <div className="space-y-4 pl-4 border-l-2">
            <p className="text-sm text-muted-foreground">
              Select which data you would like to delete:
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="designs" />
                <Label htmlFor="designs">Generated designs</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="preferences" />
                <Label htmlFor="preferences">Saved preferences</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="history" />
                <Label htmlFor="history">Usage history</Label>
              </div>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="reason">Why are you leaving? (Optional)</Label>
          <Textarea
            id="reason"
            placeholder="Help us improve our service"
            className="mt-1"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="confirm"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked as boolean)}
            required
          />
          <Label htmlFor="confirm" className="text-sm">
            I understand that this action{" "}
            {deleteOption === "full" ? "cannot" : "may not"} be undone and my
            data will be deleted according to the data retention policy
          </Label>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!confirmed || isSubmitting}
        className="w-full"
        variant="destructive"
      >
        {isSubmitting
          ? "Processing..."
          : deleteOption === "full"
            ? "Delete My Account"
            : "Delete Selected Data"}
      </Button>
    </form>
  );
}
