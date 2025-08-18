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

  useEffect(() => {
    async function verifyPayment() {
      try {
        // Simulate API call to verify payment

        if (sessionId) {
          const response = await completeCheckoutSession({ body: sessionId });
          if (response.status === 200) {
            if (response.data?.status === "success") {
              pixel.event("Purchase", {
                currency: response.data?.currency.toLocaleUpperCase(),
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
              Your new balance will be reflected in your profile within the next
              few minutes.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/profile">View Profile</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/create">Create Designs</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <XCircle className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-center text-2xl">
          Payment Verification Failed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          We couldn&apos;t verify your payment. If you believe this is an error,
          please contact our support team.
        </p>
        <div className="border rounded-lg p-4 bg-muted/50">
          <p className="text-sm text-center font-medium">
            If any amount was charged, it will be refunded within 5-7 business
            days.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button asChild className="w-full">
          <Link href="/pricing">Try Again</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/support">Contact Support</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
