import LoginForm from "@/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | HomeIdeasAI",
  description: "Login to your account. Get started with HomeIdeasAI.",
  alternates: {
    canonical: "/login",
  },
};

export default function Page() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <LoginForm />
    </div>
  );
}
