import { Metadata } from "next";
import { EmailVerificationHandler } from "@/components/email-verification-handler";
import { PageProps } from "../../../../.next/types/app/(marketing)/verify-email/page";

export const metadata: Metadata = {
  title: "Verify Email - HomeIdeasAI",
  description: "Verify your email address to activate your HomeIdeasAI account",
};

export default async function VerifyEmailPage(props: PageProps) {
  const token = (await props.searchParams)?.token as string | undefined;

  return (
    <div className="container max-w-2xl mx-auto px-4 pt-20 pb-12">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Email Verification
      </h1>
      <EmailVerificationHandler token={token} />
    </div>
  );
}
