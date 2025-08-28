import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Users, Zap, Palette, TrendingUp } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For Professionals - HomeIdeasAI | Interior Designers & Real Estate",
  description:
    "Accelerate your workflow with AI-powered home design. Perfect for interior designers, real estate agents, and home staging professionals.",
  alternates: {
    canonical: "/professionals",
  },
};

const benefits = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Instant Visualizations",
    description:
      "Generate design concepts in seconds, not hours. Show clients multiple options instantly.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Client Collaboration",
    description:
      "Real-time design changes during client meetings. Chat-based interface anyone can use.",
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: "Unlimited Creativity",
    description:
      "Test any design concept without physical constraints. Explore bold ideas risk-free.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Faster Sales Cycles",
    description:
      "Help clients visualize potential and make decisions faster with instant staging and renovations.",
  },
];

const useCases = [
  {
    profession: "Interior Designers",
    scenarios: [
      "Present multiple design concepts instantly",
      "Show clients different color schemes and layouts",
      "Visualize furniture placement before purchasing",
      "Create mood boards and style variations",
    ],
  },
  {
    profession: "Real Estate Agents",
    scenarios: [
      "Virtual staging for empty properties",
      "Show renovation potential to buyers",
      "Transform dated spaces into modern designs",
      "Increase perceived property value",
    ],
  },
  {
    profession: "Home Stagers",
    scenarios: [
      "Plan staging layouts before moving furniture",
      "Show clients staging potential",
      "Test different furniture arrangements",
      "Create before/after visualizations",
    ],
  },
];

export default function ProfessionalsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            For Professionals
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Accelerate Your Design Workflow
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            HomeIdeasAI empowers design professionals with instant
            visualizations, real-time client collaboration, and unlimited
            creative exploration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/workspace">Try Free Demo</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Why Professionals Choose HomeIdeasAI
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline your workflow and impress clients with AI-powered
              design capabilities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Use Cases by Profession</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how HomeIdeasAI fits into your specific workflow
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {useCase.profession}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {useCase.scenarios.map((scenario, scenarioIndex) => (
                      <li
                        key={scenarioIndex}
                        className="flex items-start gap-3"
                      >
                        <Check className="h-4 w-4 text-primary shrink-0 mt-1" />
                        <span className="text-sm">{scenario}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Your New Workflow</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From concept to client approval in minutes, not hours
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Space Photo</h3>
              <p className="text-muted-foreground">
                Take or upload a photo of any room or space
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Chat Your Vision</h3>
              <p className="text-muted-foreground">
                Describe changes in natural language - "make it modern" or "add
                warm lighting"
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Present Results</h3>
              <p className="text-muted-foreground">
                Download high-res images or share live sessions with clients
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join design professionals who are already using AI to deliver better
            results faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/workspace">Start Free Trial</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
