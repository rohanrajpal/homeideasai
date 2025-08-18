import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-center text-2xl">
            Payment Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Your payment was cancelled and you haven&apos;t been charged.
          </p>
          <div className="border rounded-lg p-4 bg-muted/50">
            <p className="text-sm text-center font-medium">
              Feel free to try again when you&apos;re ready. Your selected
              package will be waiting for you.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/pricing">Return to Pricing</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/generator">Create Designs</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
