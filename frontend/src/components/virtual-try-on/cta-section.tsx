import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to Transform Your Nail Game?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of nail enthusiasts who are already using AI to
            preview their perfect nail designs. Start with 3 free designs today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-700">
              <Link href="/workspace">
                <Sparkles className="mr-2 h-5 w-5" />
                Try It Free
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">View Plans</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            No credit card required • Cancel anytime • AI Model Updates Weekly
          </p>
        </div>
      </div>
    </section>
  );
}
