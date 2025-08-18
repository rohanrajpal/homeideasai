import PasswordRecoveryForm from "@/components/PasswordRecoveryForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password Recovery | HomeIdeasAI",
  description: "Reset your password. Get started with HomeIdeasAI.",
  alternates: {
    canonical: "/password-recovery",
  },
};

export default function Page() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <PasswordRecoveryForm />
    </div>
  );
}
