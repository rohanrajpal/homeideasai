import { Metadata } from "next";
import { AccountDeletionForm } from "@/components/account/deletion-form";

export const metadata: Metadata = {
  title: "Delete Account - HomeIdeasAI",
  description: "Request account deletion and manage your data at HomeIdeasAI",
  robots: "noindex",
};

export default function DeleteAccountPage() {
  return (
    <div className="container max-w-2xl mx-auto px-4 pb-12 pt-20">
      <h1 className="text-3xl font-bold mb-6">Delete Your Account</h1>

      <div className="space-y-6">
        <section className="prose dark:prose-invert">
          <h2 className="text-xl font-semibold">
            Before You Delete Your Account
          </h2>
          <p>
            We're sorry to see you go. Before proceeding with account deletion,
            please note:
          </p>
          <ul>
            <li>This action is permanent and cannot be undone</li>
            <li>All your generated designs will be permanently deleted</li>
            <li>Any remaining credits will be forfeited</li>
            <li>Your personal information will be removed from our systems</li>
          </ul>
        </section>

        <section className="prose dark:prose-invert">
          <h2 className="text-xl font-semibold">Data Retention Policy</h2>
          <p>After account deletion:</p>
          <ul>
            <li>Personal information is permanently deleted within 30 days</li>
            <li>
              Anonymized usage data may be retained for analytical purposes
            </li>
            <li>Payment records are retained as required by law</li>
            <li>Backup data is fully removed within 90 days</li>
          </ul>
        </section>

        <AccountDeletionForm />
      </div>
    </div>
  );
}
