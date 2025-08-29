"use client";

import { completeCheckoutSession } from "@/app/openapi-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import * as pixel from "../lib/fpixel";
export function PaymentStatus() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [paymentDetails, setPaymentDetails] = useState<{
    amount: number;
    currency: string;
  } | null>(null);
  const [isSubscription, setIsSubscription] = useState<boolean>(false);

  useEffect(() => {
    async function verifyPayment() {
      try {
        if (!sessionId) {
          setStatus("error");
          return;
        }

        // Get auth token
        const getAuthToken = () => {
          return document.cookie
            .split("; ")
            .find((row) => row.startsWith("accessToken="))
            ?.split("=")[1];
        };

        const token = getAuthToken();
        if (!token) {
          setStatus("error");
          return;
        }

        // Get session info from our backend to determine type
        const sessionInfoResponse = await fetch(
          `/api/py/billing/checkout-session/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (sessionInfoResponse.ok) {
          const sessionInfo = await sessionInfoResponse.json();
          const mode = sessionInfo.mode;

          if (mode === "subscription") {
            setIsSubscription(true);
            setStatus("success");
            pixel.event("Subscribe", {
              currency: "USD",
              value: 29, // Pro plan price
            });
          } else if (mode === "payment") {
            // Handle one-time payment
            const response = await completeCheckoutSession({ body: sessionId });
            if (
              response.status === 200 &&
              response.data?.status === "success"
            ) {
              pixel.event("Purchase", {
                currency: response.data?.currency.toUpperCase(),
                value: response.data?.amount,
              });
              setPaymentDetails({
                amount: response.data.amount,
                currency: response.data.currency,
              });
              setStatus("success");
            } else {
              setStatus("error");
            }
          } else {
            setStatus("error");
          }
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Error in verifyPayment:", error);
        setStatus("error");
      }
    }

    verifyPayment();
  }, [sessionId]);

  if (status === "loading") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Verifying Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <p className="text-center text-muted-foreground">
            Please wait while we verify your payment...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === "success") {
    if (isSubscription) {
      return (
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-center text-2xl">
              Welcome to HomeIdeasAI Pro!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Your subscription is now active! You have access to:
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">200 AI design edits per month</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  Unlimited chat with AI assistant
                </span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">High-resolution downloads</span>
              </div>
            </div>
            <div className="border rounded-lg p-4 bg-green-50 border-green-200">
              <p className="text-sm text-center font-medium text-green-800">
                Your credits have been added and are ready to use!
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/workspace">Start Designing</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/profile">View Subscription</Link>
            </Button>
          </CardFooter>
        </Card>
      );
    } else {
      return (
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-center text-2xl">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Thank you for your purchase of{" "}
              {paymentDetails && (
                <span className="font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: paymentDetails.currency,
                  }).format(paymentDetails.amount)}
                </span>
              )}
              . Your credits have been added to your account.
            </p>
            <div className="border rounded-lg p-4 bg-muted/50">
              <p className="text-sm text-center font-medium">
                Your new balance will be reflected in your profile within the
                next few minutes.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/profile">View Profile</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/workspace">Start Designing</Link>
            </Button>
          </CardFooter>
        </Card>
      );
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <XCircle className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-center text-2xl">
          Verification Failed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          We couldn&apos;t verify your transaction. If you believe this is an
          error, please contact our support team.
        </p>
        <div className="border rounded-lg p-4 bg-muted/50">
          <p className="text-sm text-center font-medium">
            Your payment may still be processing. Check your email for
            confirmation or contact support if needed.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button asChild className="w-full">
          <Link href="/pricing">Try Again</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/profile">Check Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
