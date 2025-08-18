import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Support - HomeIdeasAI",
  description:
    "Get in touch with our support team for any questions or assistance with HomeIdeasAI.",
};

export default function ContactPage() {
  const email = "rohan@homeideasai.com";
  const subject = "Support Request: HomeIdeasAI";
  const body =
    "Hello,\n\nI have a question about HomeIdeasAI:\n\n[Your message here]\n\nBest regards,\n[Your Name]";

  const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="container max-w-2xl mx-auto px-4 pt-20 pb-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Contact Support</h1>
      <div className="text-center space-y-6">
        <p className="text-muted-foreground">
          Have a question or need assistance? Our support team is here to help.
          Please reach out to us using the email address below:
        </p>
        <div className="flex justify-center">
          <Button asChild size="lg">
            <a href={mailtoLink} className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Email Support</span>
            </a>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Or copy this email address: {email}
        </p>
      </div>
    </div>
  );
}
