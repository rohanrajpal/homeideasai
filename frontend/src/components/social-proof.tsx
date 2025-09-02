import { Star } from "lucide-react";

export function SocialProof() {
  return (
    <div className="flex justify-center bg-gray-100">
      <section className="py-12 md:py-20">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-1">
              {Array(5)
                .fill(null)
                .map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-primary text-primary" />
                ))}
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Loved by homeowners and design professionals
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground text-lg">
              Join thousands of happy customers who are transforming their homes
              with AI-powered design ideas
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "The home ideas are incredibly creative and personalized. Saved me hours of browsing Pinterest for inspiration!",
                author: "Sarah K.",
                role: "Homeowner",
              },
              {
                quote:
                  "I love how I can visualize different design options before committing. It's like having a personal interior designer.",
                author: "Michelle L.",
                role: "Real Estate Agent",
              },
              {
                quote:
                  "Perfect for when I want to transform my space but don't know exactly what style I'm looking for.",
                author: "Jessica R.",
                role: "Interior Design Enthusiast",
              },
            ].map((testimonial, i) => (
              <blockquote key={i} className="space-y-4 text-center p-4">
                <p className="text-muted-foreground text-sm">
                  &quot;{testimonial.quote}&quot;
                </p>
                <footer>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
