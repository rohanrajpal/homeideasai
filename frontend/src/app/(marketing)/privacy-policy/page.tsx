import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - HomeIdeasAI",
  description:
    "HomeIdeasAI's privacy policy outlines how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p>
          At HomeIdeasAI, we are committed to protecting your privacy and
          ensuring the security of your personal information. This Privacy
          Policy explains how we collect, use, disclose, and safeguard your
          information when you use our website and services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          2. Information We Collect
        </h2>
        <p>We may collect the following types of information:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>
            Personal information (e.g., name, email address) when you create an
            account or contact us
          </li>
          <li>
            Usage data (e.g., IP address, browser type, pages visited) through
            cookies and similar technologies
          </li>
          <li>
            Design preferences and inputs when you use our AI nail design tool
          </li>
          <li>
            Payment information when you make a purchase (processed securely
            through our payment providers)
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          3. How We Use Your Information
        </h2>
        <p>We use your information to:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Provide and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>
            Send you technical notices, updates, security alerts, and support
            messages
          </li>
          <li>
            Monitor and analyze trends, usage, and activities in connection with
            our services
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to
          protect your personal information against unauthorized or unlawful
          processing, accidental loss, destruction, or damage.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Access, correct, or delete your personal information</li>
          <li>
            Object to or restrict the processing of your personal information
          </li>
          <li>
            Data portability (receive a copy of your personal information)
          </li>
          <li>
            Withdraw consent at any time, where we rely on consent to process
            your personal information
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          6. Changes to This Privacy Policy
        </h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page and
          updating the "Last updated" date.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at privacy@homeideasai.com.
        </p>
      </section>

      <p className="mt-8 text-sm text-gray-600">
        Last updated: January 9, 2025
      </p>
    </div>
  );
}
