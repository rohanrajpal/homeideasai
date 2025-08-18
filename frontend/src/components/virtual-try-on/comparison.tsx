import { Check, X } from "lucide-react";

export function Comparison() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Why Choose HomeIdeasAI?
          </h2>
          <p className="text-xl text-muted-foreground mx-auto max-w-[800px]">
            See how our AI-powered solution compares to template-based apps
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-pink-600 mb-6">
              HomeIdeasAI
            </h3>
            <ul className="space-y-4">
              {[
                "Describe any design in natural language",
                "Unlimited design possibilities",
                "AI understands complex patterns",
                "Create unique, custom designs",
                "Preview multiple variations instantly",
                "No design experience needed",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-600 mb-6">
              Template-Based Apps
            </h3>
            <ul className="space-y-4">
              {[
                "Limited to pre-made templates",
                "Fixed number of designs",
                "Basic color changes only",
                "Same designs as everyone else",
                "Time-consuming template browsing",
                "Need to combine multiple templates",
              ].map((limitation, i) => (
                <li key={i} className="flex items-center gap-3">
                  <X className="h-5 w-5 text-red-600 shrink-0" />
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
