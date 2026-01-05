import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, X, Sparkles, Zap, Building2, Star, ArrowRight, Users, Shield, BadgeCheck, Rocket, Globe, HelpCircle, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CountrySelector, getSelectedCountry, isIndianUser } from "@/components/CountrySelector";
import { PaymentModal } from "@/components/PaymentModal";
import { useAuth } from "@/contexts/AuthContext";
import { SEOHead } from "@/components/SEOHead";
import { PromoPopup } from "@/components/PromoPopup";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [isIndia, setIsIndia] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'business'>('pro');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const country = getSelectedCountry();
    setSelectedCountry(country);
    setIsIndia(isIndianUser());
  }, []);

  // India pricing (INR)
  const indiaPlans = [
    {
      name: "Free",
      subtitle: "Basic",
      description: "Best for: Students & beginners",
      price: "₹0",
      period: "forever",
      icon: Sparkles,
      features: [
        { text: "40-50 basic tools", included: true },
        { text: "Limited daily usage", included: true },
        { text: "Ads enabled", included: true },
        { text: "Login required", included: true },
        { text: "Basic support", included: true },
        { text: "Export/Download", included: false },
        { text: "No watermark", included: false },
        { text: "API access", included: false },
      ],
      limitations: ["Ads enabled", "Watermarked outputs", "Limited daily usage"],
      cta: "Start Free",
      popular: false,
      highlight: false,
    },
    {
      name: "Starter",
      subtitle: "Individual",
      description: "Best for: Students & individuals",
      monthlyPrice: "₹199",
      yearlyPrice: "₹166",
      yearlyTotal: "₹1,999/year",
      savings: "Save ~15%",
      icon: Rocket,
      features: [
        { text: "100+ AI tools", included: true },
        { text: "Limited AI/automation usage", included: true },
        { text: "No ads", included: true },
        { text: "Standard processing speed", included: true },
        { text: "Email support", included: true },
        { text: "Export/Download enabled", included: true },
        { text: "Priority support", included: false },
        { text: "API access", included: false },
      ],
      cta: "Start Free Trial",
      popular: false,
      highlight: false,
    },
    {
      name: "Pro",
      subtitle: "Creator",
      description: "Best for: Creators & freelancers",
      monthlyPrice: "₹499",
      yearlyPrice: "₹416",
      yearlyTotal: "₹4,999/year",
      savings: "Save ₹989/year",
      icon: Zap,
      features: [
        { text: "All 160+ AI tools", included: true },
        { text: "Higher usage limits", included: true },
        { text: "No ads", included: true },
        { text: "Fast processing", included: true },
        { text: "Priority support", included: true },
        { text: "Export/Download enabled", included: true },
        { text: "Basic API access", included: true },
        { text: "Team access", included: false },
      ],
      cta: "Start Free Trial",
      popular: true,
      highlight: true,
    },
    {
      name: "Business",
      subtitle: "Team",
      description: "Best for: Startups & agencies",
      monthlyPrice: "₹999",
      yearlyPrice: "₹833",
      yearlyTotal: "₹9,999/year",
      savings: "Save ₹1,989/year",
      icon: Building2,
      features: [
        { text: "Unlimited tool usage", included: true },
        { text: "Team access (up to 5 users)", included: true },
        { text: "Advanced API access", included: true },
        { text: "Bulk processing tools", included: true },
        { text: "Dedicated support", included: true },
        { text: "Custom templates", included: true },
        { text: "White-label option", included: true },
        { text: "Priority everything", included: true },
      ],
      cta: "Start Free Trial",
      popular: false,
      highlight: false,
    },
  ];

  // International pricing (USD)
  const internationalPlans = [
    {
      name: "Free",
      subtitle: "Basic",
      description: "Best for: Students & beginners",
      price: "$0",
      period: "forever",
      icon: Sparkles,
      features: [
        { text: "40-50 basic tools", included: true },
        { text: "Limited daily usage", included: true },
        { text: "Ads enabled", included: true },
        { text: "Login required", included: true },
        { text: "Basic support", included: true },
        { text: "Export/Download", included: false },
        { text: "No watermark", included: false },
        { text: "API access", included: false },
      ],
      limitations: ["Ads enabled", "Watermarked outputs", "Limited daily usage"],
      cta: "Start Free",
      popular: false,
      highlight: false,
    },
    {
      name: "Starter",
      subtitle: "Individual",
      description: "Best for: Students & individuals",
      monthlyPrice: "$5",
      yearlyPrice: "$4",
      yearlyTotal: "$49/year",
      savings: "Save ~18%",
      icon: Rocket,
      features: [
        { text: "100+ AI tools", included: true },
        { text: "Limited AI/automation usage", included: true },
        { text: "No ads", included: true },
        { text: "Standard processing speed", included: true },
        { text: "Email support", included: true },
        { text: "Export/Download enabled", included: true },
        { text: "Priority support", included: false },
        { text: "API access", included: false },
      ],
      cta: "Start Free Trial",
      popular: false,
      highlight: false,
    },
    {
      name: "Pro",
      subtitle: "Creator",
      description: "Best for: Creators & freelancers",
      monthlyPrice: "$12",
      yearlyPrice: "$10",
      yearlyTotal: "$119/year",
      savings: "Save $25/year",
      icon: Zap,
      features: [
        { text: "All 160+ AI tools", included: true },
        { text: "Higher usage limits", included: true },
        { text: "No ads", included: true },
        { text: "Fast processing", included: true },
        { text: "Priority support", included: true },
        { text: "Export/Download enabled", included: true },
        { text: "Basic API access", included: true },
        { text: "Team access", included: false },
      ],
      cta: "Start Free Trial",
      popular: true,
      highlight: true,
    },
    {
      name: "Business",
      subtitle: "Team",
      description: "Best for: Startups & agencies",
      monthlyPrice: "$25",
      yearlyPrice: "$21",
      yearlyTotal: "$249/year",
      savings: "Save $51/year",
      icon: Building2,
      features: [
        { text: "Unlimited tool usage", included: true },
        { text: "Team access (up to 10 users)", included: true },
        { text: "Advanced API access", included: true },
        { text: "Bulk processing tools", included: true },
        { text: "Dedicated support", included: true },
        { text: "Custom templates", included: true },
        { text: "White-label option", included: true },
        { text: "Priority everything", included: true },
      ],
      cta: "Start Free Trial",
      popular: false,
      highlight: false,
    },
  ];

  const plans = isIndia ? indiaPlans : internationalPlans;

  const comparisonFeatures = isIndia ? [
    { name: "AI Tools Available", free: "40-50", starter: "100+", pro: "160+", business: "Unlimited" },
    { name: "Daily Usage", free: "Limited", starter: "Standard", pro: "High", business: "Unlimited" },
    { name: "Ads", free: "Yes", starter: "No", pro: "No", business: "No" },
    { name: "Processing Speed", free: "Standard", starter: "Standard", pro: "Fast", business: "Priority" },
    { name: "Team Members", free: "1", starter: "1", pro: "1", business: "5" },
    { name: "API Access", free: "—", starter: "—", pro: "Basic", business: "Advanced" },
    { name: "Support", free: "Limited", starter: "Email", pro: "Priority", business: "Dedicated" },
    { name: "Export/Download", free: "—", starter: "✓", pro: "✓", business: "✓" },
  ] : [
    { name: "AI Tools Available", free: "40-50", starter: "100+", pro: "160+", business: "Unlimited" },
    { name: "Daily Usage", free: "Limited", starter: "Standard", pro: "High", business: "Unlimited" },
    { name: "Ads", free: "Yes", starter: "No", pro: "No", business: "No" },
    { name: "Processing Speed", free: "Standard", starter: "Standard", pro: "Fast", business: "Priority" },
    { name: "Team Members", free: "1", starter: "1", pro: "1", business: "10" },
    { name: "API Access", free: "—", starter: "—", pro: "Basic", business: "Advanced" },
    { name: "Support", free: "Limited", starter: "Email", pro: "Priority", business: "Dedicated" },
    { name: "White-label", free: "—", starter: "—", pro: "—", business: "✓" },
  ];

  const faqs = [
    {
      q: "Is there really no hidden charges?",
      a: "Absolutely! What you see is what you pay. No surprise fees, no hidden costs. Cancel anytime."
    },
    {
      q: "Can I try before I buy?",
      a: "Yes! We offer a 7-day free trial for Starter, Pro & Business plans. No credit card required to start."
    },
    {
      q: "What payment methods do you accept?",
      a: isIndia 
        ? "We accept all major credit/debit cards, UPI, Net Banking, and wallets like Paytm, PhonePe, Google Pay."
        : "We accept all major credit/debit cards, PayPal, and bank transfers for international users."
    },
    {
      q: "Can I switch plans anytime?",
      a: "Yes! You can upgrade or downgrade at any time. Changes take effect immediately."
    },
    {
      q: "Do you offer refunds?",
      a: "Yes, we offer a 7-day money-back guarantee if you're not satisfied with our service."
    },
    {
      q: "What happens when I hit my usage limit?",
      a: "You'll receive a notification. You can either upgrade your plan or wait for the next billing cycle."
    },
  ];

  const highlights = [
    { icon: BadgeCheck, text: "No hidden charges" },
    { icon: Shield, text: "7-day free trial" },
    { icon: Star, text: "Cancel anytime" },
    { icon: Zap, text: "Fast global servers" },
  ];

  const handleChangeCountry = () => {
    localStorage.removeItem("user_country");
    window.location.reload();
  };

  const handlePlanSelect = (planName: string) => {
    if (planName === 'Free') {
      navigate('/dashboard');
      return;
    }
    
    if (!user) {
      navigate('/auth');
      return;
    }

    const planKey = planName.toLowerCase() as 'starter' | 'pro' | 'business';
    setSelectedPlan(planKey);
    setPaymentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Pricing - Affordable AI Tools Plans"
        description="Choose from Free, Starter, Pro, or Business plans. No hidden charges. 7-day free trial. Access 160+ AI tools for writing, coding, design & marketing."
        keywords="AI tools pricing, affordable AI, AI subscription plans, Inquo pricing"
        canonicalUrl="https://inquo.site/pricing"
      />
      <PromoPopup />
      <Navbar />
      <CountrySelector onSelect={() => setIsIndia(isIndianUser())} />
      
      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 px-4 py-1">Pricing</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Simple, Transparent <span className="text-gradient">Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              No hidden charges. Start free, upgrade when you need more power. Cancel anytime.
            </p>

            {/* Country Display */}
            {selectedCountry && (
              <button 
                onClick={handleChangeCountry}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <Globe className="w-4 h-4" />
                <span>{selectedCountry.flag} Showing prices for {selectedCountry.name}</span>
                <span className="underline">(Change)</span>
              </button>
            )}

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              {highlights.map((item, index) => (
                <div key={index} className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
                  <item.icon className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>

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
                  Save up to 18%
                </Badge>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`p-6 relative transition-all duration-300 hover:shadow-xl ${
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

                <div className="text-center mb-6">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                    plan.highlight ? "bg-accent" : "bg-muted"
                  }`}>
                    <plan.icon className={`w-6 h-6 ${plan.highlight ? "text-accent-foreground" : "text-foreground"}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-xs text-accent font-medium mb-1">{plan.subtitle}</p>
                  <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>
                  
                  <div className="mb-2">
                    {plan.price ? (
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground text-sm">/{plan.period}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold">
                            {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                          </span>
                          <span className="text-muted-foreground text-sm">/month</span>
                        </div>
                        {isYearly && plan.yearlyTotal && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Billed as {plan.yearlyTotal}
                          </p>
                        )}
                        {isYearly && plan.savings && (
                          <p className="text-sm text-accent font-medium mt-1">
                            {plan.savings}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground/50"}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.limitations && (
                  <div className="mb-4 p-2 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Limitations:</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {plan.limitations.map((limit, i) => (
                        <li key={i}>• {limit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  className={`w-full h-11 font-semibold ${
                    plan.highlight
                      ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                      : ""
                  }`}
                  variant={plan.highlight ? "default" : "outline"}
                  onClick={() => handlePlanSelect(plan.name)}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                
                {plan.highlight && (
                  <p className="text-center text-xs text-muted-foreground mt-3">
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
                      <th className="text-center p-4 font-semibold">Starter</th>
                      <th className="text-center p-4 font-semibold bg-accent/10">Pro</th>
                      <th className="text-center p-4 font-semibold">Business</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="p-4 font-medium">{feature.name}</td>
                        <td className="p-4 text-center text-muted-foreground">{feature.free}</td>
                        <td className="p-4 text-center text-muted-foreground">{feature.starter}</td>
                        <td className="p-4 text-center bg-accent/5 font-medium">{feature.pro}</td>
                        <td className="p-4 text-center text-muted-foreground">{feature.business}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Referral Program */}
          <div className="mb-20">
            <Card className="p-8 text-center bg-gradient-to-br from-accent/10 to-transparent border-2 border-accent/20">
              <Users className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h3 className="text-2xl font-bold mb-4">Affiliate Program — Earn 20% Lifetime</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Share InQuo.Site with your network and earn 20% lifetime commission on every referral. 
                No limits, no caps — passive income made easy!
              </p>
              <Button asChild className="bg-accent hover:bg-accent/90">
                <Link to="/auth">
                  Join Affiliate Program
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </Card>
          </div>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto mb-20">
            <div className="text-center mb-12">
              <Badge className="mb-4 px-4 py-1">
                <HelpCircle className="w-3 h-3 mr-1" />
                FAQs
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Frequently Asked <span className="text-gradient">Questions</span>
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about our pricing and plans
              </p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="border-2 border-border/50 rounded-xl px-6 bg-card/50 backdrop-blur-sm hover:border-accent/50 transition-all duration-300 data-[state=open]:border-accent data-[state=open]:shadow-lg data-[state=open]:shadow-accent/10"
                >
                  <AccordionTrigger className="text-left py-5 hover:no-underline group">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm group-data-[state=open]:bg-accent group-data-[state=open]:text-accent-foreground transition-colors">
                        {index + 1}
                      </div>
                      <span className="font-semibold text-lg pr-4">{faq.q}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 pl-12 text-muted-foreground text-base leading-relaxed animate-fade-in">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">Still have questions?</p>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/contact">
                  Contact Support
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Card className="p-12 bg-gradient-to-br from-primary to-accent text-primary-foreground inline-block max-w-2xl">
              <h3 className="text-3xl font-bold mb-4">Ready to Automate Your Business?</h3>
              <p className="text-lg mb-8 opacity-90">
                Join 10,000+ businesses already saving time with InQuo.Site
              </p>
              <Button asChild size="lg" variant="secondary" className="text-lg px-10 h-14">
                <Link to="/dashboard">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <p className="mt-4 text-sm opacity-75">
                ✓ 7-day free trial • ✓ No credit card required • ✓ Cancel anytime
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      <PaymentModal 
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        planType={selectedPlan}
        billingCycle={isYearly ? 'yearly' : 'monthly'}
      />
    </div>
  );
};

export default Pricing;
