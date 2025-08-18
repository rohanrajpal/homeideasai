"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { verifyVerify } from "@/app/openapi-client";

interface EmailVerificationHandlerProps {
  token?: string;
}

export function EmailVerificationHandler({
  token,
}: EmailVerificationHandlerProps) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided.");
        return;
      }

      try {
        // Replace this with your actual API endpoint
        const response = await verifyVerify({
          body: {
            token: token,
          },
        });

        if (response.data) {
          setStatus("success");
          setMessage(
            "Your email has been successfully verified. You can now start creating amazing nail designs!"
          );
        } else {
          setStatus("error");
          setMessage(
            "Email verification failed. Please try again or contact support."
          );
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          "An error occurred during verification. Please try again later."
        );
      }
    };

    verifyEmail();
  }, [token]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p>Verifying your email address...</p>
          </div>
        );
      case "success":
        return (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800">
              Email Verified Successfully!
            </AlertTitle>
            <AlertDescription className="text-green-700">
              {message}
              <div className="mt-4">
                <Button onClick={() => router.push("/generator")}>
                  Start Creating
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        );
      case "error":
        return (
          <Alert variant="destructive">
            <XCircle className="h-5 w-5" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>
              {message}
              <div className="mt-4 space-x-4">
                <Button variant="outline" onClick={() => router.push("/")}>
                  Go to Homepage
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/contact")}
                >
                  Contact Support
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        );
    }
  };

  return <div className="space-y-6">{renderContent()}</div>;
}
