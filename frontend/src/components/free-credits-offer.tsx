"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import { addToWaitlist } from "@/app/openapi-client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import * as pixel from "../lib/fpixel";
import GoogleLoginButton from "./google-login-button";

// Form validation schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export function FreeCreditsOffer() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      pixel.event("Lead");

      await addToWaitlist({ body: values.email });

      // Show success message
      toast.success(
        "Offer claimed successfully! Redirecting to registration..."
      );

      router.push(`/register?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <section className="w-full py-12 md:py-16 bg-gradient-to-r from-pink-100 to-purple-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Start Designing with 3 Free Credits!
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
              Sign up now and unlock your creativity with 3 free nail design
              credits.
            </p>
          </div>
          <div className="w-full max-w-sm space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          {...field}
                          type="email"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isLoading ? "Claiming..." : "Claim Your Free Credits"}
                </Button>
              </form>
            </Form>
            <p className="text-sm text-gray-500">
              No credit card required. Start designing in minutes!
            </p>
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gradient-to-r from-pink-100 to-purple-100 px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="w-full max-w-sm">
              <GoogleLoginButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
