import { Suspense } from "react";
import { PaymentStatus } from "@/components/payment-status";
import { PaymentStatusSkeleton } from "@/components/payment-status-skeleton";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<PaymentStatusSkeleton />}>
        <PaymentStatus />
      </Suspense>
    </div>
  );
}
