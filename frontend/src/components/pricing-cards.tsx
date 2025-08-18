"use client";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createCheckoutSession } from "@/app/openapi-client";
import { useAuth } from "./auth-context";
import { useState } from "react";
import * as pixel from "../lib/fpixel";

export function PricingCards() {
  const plans = [
    {
      name: "Pro",
      credits: 200,
      price: 29,
      pricePerCredit: 0.145,
      description: "Everything you need to transform your home with AI",
      features: [
        "200 AI design edits per month",
        "Unlimited chat with AI design assistant",
        "Upload unlimited room photos",
        "Real-time design visualization",
        "High-resolution image downloads",
        "Chat-based design modifications",
        "Style and mood suggestions",
        "Export design history",
      ],
      button: {
        text: "Start Designing",
        variant: "default" as const,
      },
      popular: true,
      recurring: true,
    },
  ];

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (plan: (typeof plans)[number]) => {
    pixel.event("InitiateCheckout", {
      currency: "USD",
      value: plan.price,
    });
    setLoadingPlan(plan.name);
    const result = await createCheckoutSession({
      body: {
        package_type: plan.name.toLowerCase(),
        quantity: plan.credits,
      },
    });
    if (result.error) {
      console.error(result.error);
    } else {
      window.location.href = result.data.url;
    }
    setLoadingPlan(null);
  };

  const { isAuthenticated } = useAuth();

  return (
    <div className="flex justify-center">
      <div className="max-w-md w-full">
        {plans.map((plan) => (
          <Card key={plan.name} className="border-primary shadow-lg">
            <CardHeader>
              <div className="text-center">
                <Badge variant="secondary" className="mb-4">
                  Most Popular
                </Badge>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold">${plan.price}</div>
                <div className="text-lg text-muted-foreground">per month</div>
                <div className="text-sm font-medium text-primary">
                  ${plan.pricePerCredit} per design edit
                </div>
              </div>
              <ul className="space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.button.variant}
                size="lg"
                onClick={() => {
                  if (!isAuthenticated) {
                    window.location.href = "/login";
                  } else {
                    handleCheckout(plan);
                  }
                }}
              >
                {isAuthenticated ? (
                  loadingPlan === plan.name ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.button.text
                  )
                ) : (
                  "Login to Purchase"
                )}
                {!isAuthenticated && (
                  <Lock className="ml-2 h-4 w-4 text-white shrink-0" />
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
