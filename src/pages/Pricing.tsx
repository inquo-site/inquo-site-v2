import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Zap, Crown, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(true);

  const plans = [
    {
      name: "Free",
      description: "Perfect for trying out AI tools",
      price: "$0",
      period: "forever",
      icon: Sparkles,
      features: [
        { text: "12 Free AI Tools Access", included: true },
        { text: "10 AI credits daily", included: true },
        { text: "Basic AI models (GPT-3.5)", included: true },
        { text: "Community support", included: true },
        { text: "Premium tools", included: false },
        { text: "GPT-4 & advanced models", included: false },
        { text: "Priority processing", included: false },
        { text: "API access", included: false },
      ],
      cta: "Start Free",
      popular: false,
      highlight: false,
    },
    {
      name: "Pro",
      description: "For professionals & power users",
      monthlyPrice: "$25",
      yearlyPrice: "$15",
      yearlyTotal: "$180",
      savings: "Save $120/year",
      icon: Zap,
      features: [
        { text: "All 160 AI Tools (12 Free + 148 Premium)", included: true },
        { text: "40 AI credits daily", included: true },
        { text: "GPT-4 & premium models", included: true },
        { text: "Premium templates library", included: true },
        { text: "Priority email support", included: true },
        { text: "Export in all formats", included: true },
        { text: "No watermarks", included: true },
        { text: "API access", included: false },
      ],
      cta: "Start Pro Trial",
      popular: true,
      highlight: true,
    },
    {
      name: "Team",
      description: "For teams & businesses",
      monthlyPrice: "$49",
      yearlyPrice: "$39",
      yearlyTotal: "$468",
      savings: "Save $120/year",
      icon: Crown,
      features: [
        { text: "Everything in Pro", included: true },
        { text: "5 team member seats", included: true },
        { text: "Shared workspace", included: true },
        { text: "Team collaboration tools", included: true },
        { text: "Admin dashboard", included: true },
        { text: "API access (10K calls/mo)", included: true },
        { text: "Priority support (24h)", included: true },
        { text: "Custom integrations", included: true },
      ],
      cta: "Start Team Trial",
      popular: false,
      highlight: false,
    },
  ];

  const comparisonFeatures = [
    { name: "AI Tools Available", free: "12", pro: "160+", team: "160+" },
    { name: "Daily Credits", free: "10", pro: "40", team: "Unlimited" },
    { name: "AI Models", free: "GPT-3.5", pro: "GPT-4 & More", team: "GPT-4 & More" },
    { name: "Export Formats", free: "TXT only", pro: "All formats", team: "All formats" },
    { name: "Support", free: "Community", pro: "Email (48h)", team: "Priority (24h)" },
    { name: "API Access", free: "—", pro: "—", team: "10K calls/mo" },
    { name: "Team Members", free: "1", pro: "1", team: "5" },
    { name: "Custom Branding", free: "—", pro: "—", team: "✓" },
  ];

  const faqs = [
    {
      q: "Can I switch plans anytime?",
      a: "Yes! You can upgrade or downgrade at any time. Changes take effect immediately."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards, PayPal, and UPI for Indian users."
    },
    {
      q: "Is there a refund policy?",
      a: "Yes, we offer a 7-day money-back guarantee if you're not satisfied."
    },
    {
      q: "What happens when I run out of credits?",
      a: "You can either wait for daily reset or purchase additional credits à la carte."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-1">Pricing</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Simple, Transparent <span className="text-gradient">Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Start free, upgrade when you need more power. No hidden fees, cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-2 glass-card rounded-full">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  !isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                  isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly
                <Badge variant="secondary" className="bg-accent text-accent-foreground text-xs">
                  Save 40%
                </Badge>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`p-8 relative transition-all duration-300 hover:shadow-xl ${
                  plan.highlight 
                    ? "border-2 border-accent scale-105 shadow-lg bg-gradient-to-b from-accent/5 to-transparent" 
                    : "border-2 hover:border-accent/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground px-4 py-1 font-semibold shadow-lg">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    plan.highlight ? "bg-accent" : "bg-muted"
                  }`}>
                    <plan.icon className={`w-7 h-7 ${plan.highlight ? "text-accent-foreground" : "text-foreground"}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  
                  <div className="mb-2">
                    {plan.price ? (
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">/{plan.period}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-5xl font-bold">
                            {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        {isYearly && plan.savings && (
                          <p className="text-sm text-accent font-medium mt-2">
                            {plan.savings}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground/50"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth" className="block">
                  <Button
                    className={`w-full h-12 text-lg font-semibold ${
                      plan.highlight
                        ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                        : ""
                    }`}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                
                {plan.highlight && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    7-day free trial included
                  </p>
                )}
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Compare Plans</h2>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4 font-semibold">Free</th>
                      <th className="text-center p-4 font-semibold bg-accent/10">Pro</th>
                      <th className="text-center p-4 font-semibold">Team</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="p-4 font-medium">{feature.name}</td>
                        <td className="p-4 text-center text-muted-foreground">{feature.free}</td>
                        <td className="p-4 text-center bg-accent/5 font-medium">{feature.pro}</td>
                        <td className="p-4 text-center text-muted-foreground">{feature.team}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <Card className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Need More Credits?</h3>
              <p className="text-muted-foreground mb-6">
                Top up anytime with our credit packs. Perfect for occasional heavy usage.
              </p>
              <div className="inline-flex items-baseline gap-2 bg-muted rounded-xl px-6 py-4">
                <span className="text-4xl font-bold">$5</span>
                <span className="text-muted-foreground">= 500 credits</span>
              </div>
            </Card>

            <Card className="p-8 text-center bg-gradient-to-br from-accent/10 to-transparent">
              <h3 className="text-2xl font-bold mb-4">Affiliate Program</h3>
              <p className="text-muted-foreground mb-6">
                Earn money by referring users to Inquo.Site
              </p>
              <div className="inline-flex items-baseline gap-2 bg-accent/20 rounded-xl px-6 py-4">
                <span className="text-4xl font-bold text-accent">20%</span>
                <span className="text-muted-foreground">lifetime commission</span>
              </div>
            </Card>
          </div>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="p-6">
                  <h4 className="font-semibold text-lg mb-2">{faq.q}</h4>
                  <p className="text-muted-foreground">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <Card className="p-12 bg-gradient-to-br from-primary to-accent text-primary-foreground inline-block">
              <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-lg mb-8 opacity-90">
                Join 50,000+ creators already using Inquo.Site
              </p>
              <Button asChild size="lg" variant="secondary" className="text-lg px-10 h-14">
                <Link to="/auth">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
