import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function PricingFAQ() {
  const faqs = [
    {
      question: "What are credits and how do they work?",
      answer:
        "Credits are our virtual currency used to generate nail designs. One credit equals one unique nail design generation. Once you purchase credits, they never expire and you can use them whenever you want.",
    },
    {
      question: "Do credits expire?",
      answer:
        "No, your credits never expire. Once you purchase them, they remain in your account until you use them, no matter how long that takes.",
    },
    {
      question: "Can I use the designs commercially?",
      answer:
        "Yes! With our Professional package, you get full commercial usage rights for all generated designs. This means you can use them in your salon, for marketing materials, or any other business purposes.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay for secure, hassle-free transactions.",
    },
    {
      question: "Can I get a refund if I'm not satisfied?",
      answer:
        "Yes, we offer a 100% satisfaction guarantee. If you're not happy with our service, contact us within 7 days of your purchase for a full refund of unused credits.",
    },
    {
      question: "What's the difference between the packages?",
      answer:
        "The main difference is the number of designs you can generate and the cost per design. Larger packages offer a lower price per design and additional features like priority generation and commercial usage rights.",
    },
    {
      question: "How high-quality are the generated designs?",
      answer:
        "All generated designs are high-resolution images suitable for both digital display and printing. You can use them for social media, client presentations, or as reference images for nail artists.",
    },
    {
      question: "Can I share my credits with my team?",
      answer:
        "Currently, credits are tied to individual accounts. However, if you're interested in team usage, contact us about our salon and enterprise solutions.",
    },
    {
      question: "What happens if I run out of credits?",
      answer:
        "When you run out of credits, you can simply purchase more at any time. Your generated designs remain accessible in your gallery even if you have no credits left.",
    },
    {
      question: "Do you offer custom packages for salons?",
      answer:
        "Yes! For nail salons and larger businesses, we offer custom packages with special pricing and features. Contact our sales team to learn more.",
    },
  ];

  return (
    <section className="max-w-3xl mx-auto">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl font-bold tracking-tighter">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground">
          Everything you need to know about our pricing and credits system
        </p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
