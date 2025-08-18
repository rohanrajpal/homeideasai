"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addToWaitlist } from "@/app/openapi-client";
import * as pixel from "../lib/fpixel";
import { usePathname, useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "./auth-context";

// Form validation schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export function FreeCreditsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    // Don't show modal for authenticated users
    if (isAuthenticated) return;

    // Don't show modal on register page
    if (pathname === "/register" || pathname === "/login") return;

    const hasSeenModal = localStorage.getItem("hasSeenFreeCreditsModal");
    const lastShownDate = localStorage.getItem("lastShownModalDate");
    const today = new Date().toDateString();

    // Return if user has permanently dismissed the modal
    if (hasSeenModal === "permanent") return;

    // Check if modal was shown today
    if (lastShownDate === today) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;

      if (scrollPosition > totalHeight * 0.5 && !isAuthenticated) {
        setIsOpen(true);
        // Store today's date as last shown
        localStorage.setItem("lastShownModalDate", today);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAuthenticated, pathname]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      pixel.event("Lead");
      await addToWaitlist({ body: values.email });

      toast({
        title: "Success!",
        description:
          "Offer claimed successfully! Redirecting to registration...",
      });
      localStorage.setItem("hasSeenFreeCreditsModal", "permanent");
      setIsOpen(false);

      router.push(`/register?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was a problem submitting your email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Claim Your 3 Free Credits!
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign up now and start creating stunning nail designs instantly with
            our AI-powered tool.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="email">Email</Label>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Get Free Credits
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
