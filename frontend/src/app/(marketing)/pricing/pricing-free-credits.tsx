"use client";
import { useAuth } from "@/components/auth-context";

export function PricingFreeCredits() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="text-center space-y-4 pt-8">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          {/* Basically it should promote the user to buy credits */}
          Buy Credits
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground text-lg sm:text-xl">
          Pay only for what you need. No subscriptions, no hidden fees.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4 pt-8">
      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
        Simple, transparent pricing
      </h1>
      <p className="mx-auto max-w-[700px] text-muted-foreground text-lg sm:text-xl">
        Start with 3 free credits when you sign up. Then, pay only for what you
        need. No subscriptions, no hidden fees.
      </p>
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-4 max-w-2xl mx-auto">
        <p className="text-sm font-medium">
          🎁 New users: Sign up now to receive 3 free credits and start creating
          amazing nail designs!
        </p>
      </div>
    </div>
  );
}
