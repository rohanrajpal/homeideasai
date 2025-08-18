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
              Loved by nail artists and enthusiasts
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground text-lg">
              Join thousands of happy customers who are transforming their nail
              art with AI
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "The designs are incredibly unique and creative. Saved me hours of browsing for inspiration!",
                author: "Sarah K.",
                role: "Nail Artist",
              },
              {
                quote:
                  "I love how I can get unlimited design options. It's like having a personal nail art designer.",
                author: "Michelle L.",
                role: "Beauty Salon Owner",
              },
              {
                quote:
                  "Perfect for when I want something unique but don't know exactly what I'm looking for.",
                author: "Jessica R.",
                role: "Nail Enthusiast",
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
