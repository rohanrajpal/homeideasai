"use client";

import {
  getUserInvoices,
  Invoice,
  resetForgotPassword,
  usersCurrentUser,
  verifyRequestToken,
} from "@/app/openapi-client";

// Temporary types for subscription until OpenAPI is regenerated
interface SubscriptionInfo {
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  plan_name?: string;
  credits_remaining: number;
}

interface CancelSubscriptionResponse {
  success: boolean;
  message: string;
  cancel_at_period_end: boolean;
}
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Loader } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "./auth-context";

export function ProfileContent() {
  const { logout } = useAuth();

  const [email, setEmail] = useState("user@example.com");
  const [isVerified, setIsVerified] = useState(false);
  const [creditsAvailable, setCreditsAvailable] = useState(0);
  const [purchaseHistory, setPurchaseHistory] = useState<Invoice[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo | null>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
  const { toast } = useToast();

  // Temporary API functions until OpenAPI is regenerated
  const fetchSubscriptionInfo = async (): Promise<SubscriptionInfo> => {
    const response = await fetch("/api/py/billing/subscription", {
      headers: {
        Authorization: `Bearer ${
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("accessToken="))
            ?.split("=")[1]
        }`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch subscription");
    return response.json();
  };

  const cancelSubscription = async (): Promise<CancelSubscriptionResponse> => {
    const response = await fetch("/api/py/billing/subscription/cancel", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("accessToken="))
            ?.split("=")[1]
        }`,
      },
    });
    if (!response.ok) throw new Error("Failed to cancel subscription");
    return response.json();
  };

  const reactivateSubscription =
    async (): Promise<CancelSubscriptionResponse> => {
      const response = await fetch("/api/py/billing/subscription/reactivate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("accessToken="))
              ?.split("=")[1]
          }`,
        },
      });
      if (!response.ok) throw new Error("Failed to reactivate subscription");
      return response.json();
    };

  useEffect(() => {
    async function fetchUserData() {
      try {
        const userData = await usersCurrentUser();
        if (userData.data) {
          setEmail(userData.data.email);
          setIsVerified(userData.data.is_verified ?? false);
          if (userData.data.credits) {
            setCreditsAvailable(userData.data.credits);
          }
        }

        const invoicesResponse = await getUserInvoices();
        if (invoicesResponse.data) {
          setPurchaseHistory(invoicesResponse.data);
        }

        // Fetch subscription info
        try {
          const subInfo = await fetchSubscriptionInfo();
          setSubscriptionInfo(subInfo);
        } catch (error) {
          console.log("No subscription found or failed to fetch:", error);
          setSubscriptionInfo(null);
        }
      } catch (error) {
        console.error("Failed to fetch user data or invoices:", error);
      }
    }

    fetchUserData();
  }, []);

  const handlePasswordReset = async () => {
    setIsLoading(true);
    try {
      await resetForgotPassword({
        body: {
          email: email,
        },
      });
      toast({
        title: "Success",
        description: "Password reset email sent successfully.",
      });
    } catch (error) {
      console.error("Failed to reset password:", error);
      toast({
        title: "Error",
        description: "Failed to send password reset email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  const handleResendVerification = async () => {
    if (isResendingVerification) return;

    setIsResendingVerification(true);
    try {
      await verifyRequestToken({
        body: {
          email: email,
        },
      });
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      toast({
        title: "Error",
        description:
          "Failed to resend verification email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsSubscriptionLoading(true);
    try {
      const result = await cancelSubscription();
      if (result.success) {
        toast({
          title: "Subscription Updated",
          description: result.message,
        });
        // Refresh subscription info
        const subInfo = await fetchSubscriptionInfo();
        setSubscriptionInfo(subInfo);
      }
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsSubscriptionLoading(true);
    try {
      const result = await reactivateSubscription();
      if (result.success) {
        toast({
          title: "Subscription Updated",
          description: result.message,
        });
        // Refresh subscription info
        const subInfo = await fetchSubscriptionInfo();
        setSubscriptionInfo(subInfo);
      }
    } catch (error) {
      console.error("Failed to reactivate subscription:", error);
      toast({
        title: "Error",
        description: "Failed to reactivate subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Email:</span>
              <div className="flex items-center gap-2">
                <span>{email}</span>
                <span
                  className={`text-sm px-2 py-0.5 rounded-full ${
                    isVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {isVerified ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>
            {!isVerified && (
              <div className="mt-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800 mb-2">
                  Please verify your email to receive 3 free credits! Check your
                  inbox for the verification link.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="text-yellow-800 hover:text-yellow-900 border-yellow-200 hover:bg-yellow-100"
                >
                  {isResendingVerification ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend verification email"
                  )}
                </Button>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Credits Available:</span>
              <span>{creditsAvailable}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptionInfo &&
          subscriptionInfo.status !== "none" &&
          subscriptionInfo.status !== "canceled" ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Plan:</span>
                <span className="capitalize">
                  {subscriptionInfo.plan_name || "Pro Plan"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    subscriptionInfo.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {subscriptionInfo.status === "active"
                    ? "Active"
                    : subscriptionInfo.status}
                </span>
              </div>
              {subscriptionInfo.current_period_end && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Next billing date:</span>
                  <span>
                    {new Date(
                      subscriptionInfo.current_period_end
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-medium">Credits this period:</span>
                <span>{subscriptionInfo.credits_remaining}</span>
              </div>

              {subscriptionInfo.cancel_at_period_end ? (
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      Your subscription will end on{" "}
                      {new Date(
                        subscriptionInfo.current_period_end!
                      ).toLocaleDateString()}
                      . You'll continue to have access until then.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleReactivateSubscription}
                    disabled={isSubscriptionLoading}
                    className="w-full"
                  >
                    {isSubscriptionLoading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Reactivating...
                      </>
                    ) : (
                      "Reactivate Subscription"
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  disabled={isSubscriptionLoading}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isSubscriptionLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Canceling...
                    </>
                  ) : (
                    "Cancel Subscription"
                  )}
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No active subscription
              </p>
              <Button asChild>
                <Link href="/pricing">View Plans</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseHistory.map((purchase, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }).format(new Date(purchase.date))}
                  </TableCell>
                  <TableCell>{purchase.credits} credits</TableCell>
                  <TableCell>{purchase.amount}</TableCell>
                  <TableCell>
                    <Button variant="outline" asChild>
                      <Link href={purchase.invoice_link} target="_blank">
                        View Invoice
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
            Reset Password
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Password Reset</DialogTitle>
              </DialogHeader>
              <p>
                Are you sure you want to reset your password? A reset link will
                be sent to your email.
              </p>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handlePasswordReset}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader /> : "Confirm"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign Out</CardTitle>
          <CardDescription>Sign out of your account</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="destructive" onClick={logout}>
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
