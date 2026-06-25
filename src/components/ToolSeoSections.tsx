import { Card } from "@/components/ui/card";
import { Check, HelpCircle, ListChecks, Sparkles } from "lucide-react";
import type { ToolSeoConfig } from "@/data/toolSeo";

/**
 * Visible SEO content rendered below every tool's input/output.
 * Crawlers index these H2/H3 sections — they're what makes a tool
 * page rank for long-tail queries like "free online code editor".
 */
export function ToolSeoSections({ seo, toolName }: { seo: ToolSeoConfig; toolName: string }) {
  return (
    <div className="mt-16 space-y-12">
      {/* What it is */}
      <section aria-labelledby="about-tool">
        <h2 id="about-tool" className="text-3xl font-bold mb-3 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-accent" />
          About {toolName}
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl">
          {seo.intro}
        </p>
      </section>

      {/* Features */}
      <section aria-labelledby="features-tool">
        <h2 id="features-tool" className="text-2xl font-bold mb-4">
          Why use this {toolName.toLowerCase()}?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
          {seo.features.map((f, i) => (
            <Card key={i} className="p-4 flex items-start gap-3">
              <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span className="text-sm">{f}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section aria-labelledby="usecases-tool">
        <h2 id="usecases-tool" className="text-2xl font-bold mb-4">
          Popular use cases
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-4xl">
          {seo.useCases.map((u, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <ListChecks className="w-4 h-4 text-accent shrink-0 mt-1" />
              <span>{u}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* How to use */}
      <section aria-labelledby="howto-tool">
        <h2 id="howto-tool" className="text-2xl font-bold mb-4">
          How to use {toolName}
        </h2>
        <ol className="space-y-4 max-w-4xl">
          {seo.howTo.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold mb-1">{step.name}</h3>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-tool">
        <h2 id="faq-tool" className="text-2xl font-bold mb-4 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-accent" />
          Frequently asked questions
        </h2>
        <div className="space-y-4 max-w-4xl">
          {seo.faqs.map((faq, i) => (
            <Card key={i} className="p-5">
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
