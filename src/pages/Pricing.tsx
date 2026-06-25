import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Check,
  X as XIcon,
  Sparkles,
  Crown,
  ArrowRight,
  Copy,
  Globe,
  HelpCircle,
  Coins,
  Building2,
  Info,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  CountrySelector,
  getSelectedCountry,
} from "@/components/CountrySelector";
import { SEOHead } from "@/components/SEOHead";
import { PromoPopup } from "@/components/PromoPopup";
import { toast } from "@/hooks/use-toast";
import {
  PLANS,
  FEATURE_MATRIX,
  getRegionForCountry,
  yearlyPrice,
  buildEnterpriseMailto,
  YEARLY_DISCOUNT_PCT,
  type PlanKey,
  type RegionPricing,
} from "@/lib/pricingPlans";

const UPI_ID = "webcraftmaster915@okicici";
const SUPPORT_EMAIL = "inquo4@gmail.com";

const TOPUP_PRESETS_INR = [
  { tokens: 100, price: 99 },
  { tokens: 300, price: 297 },
  { tokens: 1000, price: 990 },
];
const TOPUP_PRESETS_USD = [
  { tokens: 100, price: 4 },
  { tokens: 300, price: 12 },
  { tokens: 1000, price: 40 },
];

const Pricing = () => {
  const [params, setParams] = useSearchParams();
  const [yearly, setYearly] = useState(params.get("yearly") === "1");
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [region, setRegion] = useState<RegionPricing>(() =>
    getRegionForCountry(null),
  );
  const [buyOpen, setBuyOpen] = useState(false);
  const [activePlan, setActivePlan] = useState<PlanKey | null>(null);
  const [topupOpen, setTopupOpen] = useState(params.get("topup") === "1");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const c = getSelectedCountry();
    setSelectedCountry(c);
    setRegion(getRegionForCountry(c?.code));
  }, []);

  const handleChangeCountry = () => {
    localStorage.removeItem("user_country");
    window.location.reload();
  };

  const handleSelectPlan = (key: PlanKey) => {
    if (key === "free") {
      window.location.href = "/auth";
      return;
    }
    setActivePlan(key);
    setBuyOpen(true);
  };

  const handleCopyUPI = async () => {
    await navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast({ title: "UPI ID copied" });
    setTimeout(() => setCopied(false), 1800);
  };

  const activePlanMeta = useMemo(
    () => PLANS.find((p) => p.key === activePlan),
    [activePlan],
  );

  const activePrice = useMemo(() => {
    if (!activePlan) return 0;
    const m = region.prices[activePlan];
    return yearly ? yearlyPrice(m) : m;
  }, [activePlan, region, yearly]);

  const topupPresets =
    region.code === "IN" ? TOPUP_PRESETS_INR : TOPUP_PRESETS_USD;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I switch plans later?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes — upgrade, downgrade or switch monthly ↔ yearly any time. Yearly billing saves you ${YEARLY_DISCOUNT_PCT}% compared to monthly.`,
        },
      },
      {
        "@type": "Question",
        name: "How do I pay?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            region.code === "IN"
              ? "Pay via UPI to our official ID. Share the UTR with support and your plan activates within minutes."
              : `International payments — email ${SUPPORT_EMAIL} with your chosen plan and we'll share PayPal / bank transfer details.`,
        },
      },
      {
        "@type": "Question",
        name: "What is the Enterprise plan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Custom plan with white-label, SSO/SAML, SLA and private deployment for agencies & large organisations. Contact sales for a quote.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need a card to start?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The Free plan is fully usable with zero payment info.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="InQuo Pricing — Plans & tokens"
        description={`Simple ${region.label} pricing. Free, Basic, Pro and Business plans. Switch monthly or yearly (save ${YEARLY_DISCOUNT_PCT}%).`}
        keywords="InQuo pricing, AI plans, subscription pricing, AI agents pricing"
        canonicalUrl="https://inquo-site.lovable.app/pricing"
        schema={faqSchema}
      />
      <PromoPopup />
      <Navbar />
      <CountrySelector
        onSelect={() => {
          const c = getSelectedCountry();
          setSelectedCountry(c);
          setRegion(getRegionForCountry(c?.code));
        }}
      />

      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-10">
            <Badge className="mb-4 px-4 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              Plans & Pricing
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5">
              Pick the plan that <span className="text-gradient">fits you</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Start free. Upgrade only when you need more. Cancel anytime — no hidden fees.
            </p>

            {/* Country pill */}
            {selectedCountry && (
              <button
                onClick={handleChangeCountry}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <Globe className="w-4 h-4" />
                <span>
                  {selectedCountry.flag} Prices for {region.label} ({region.currency})
                </span>
                <span className="underline">Change</span>
              </button>
            )}

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border bg-card">
              <span
                className={`text-sm font-medium ${!yearly ? "text-foreground" : "text-muted-foreground"}`}
              >
                Monthly
              </span>
              <Switch
                checked={yearly}
                onCheckedChange={(v) => {
                  setYearly(v);
                  const p = new URLSearchParams(params);
                  if (v) p.set("yearly", "1");
                  else p.delete("yearly");
                  setParams(p, { replace: true });
                }}
              />
              <span
                className={`text-sm font-medium ${yearly ? "text-foreground" : "text-muted-foreground"}`}
              >
                Yearly
              </span>
              <Badge variant="secondary" className="text-xs">
                Save {YEARLY_DISCOUNT_PCT}%
              </Badge>
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {PLANS.map((plan) => {
              const monthly = region.prices[plan.key];
              const price = yearly ? yearlyPrice(monthly) : monthly;
              const isFree = monthly === 0;
              return (
                <Card
                  key={plan.key}
                  className={`p-6 flex flex-col relative transition-all ${
                    plan.popular
                      ? "border-2 border-accent shadow-xl scale-[1.02] bg-gradient-to-b from-accent/5 to-transparent"
                      : "border hover:border-accent/40"
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                      Most popular
                    </Badge>
                  )}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.tagline}
                    </p>
                  </div>
                  <div className="mb-5">
                    {isFree ? (
                      <p className="text-4xl font-bold">{region.symbol}0</p>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">
                          {region.symbol}
                          {price.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /{yearly ? "yr" : "mo"}
                        </span>
                      </div>
                    )}
                    {!isFree && yearly && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Equivalent {region.symbol}
                        {Math.round((price / 12)).toLocaleString()}/mo
                      </p>
                    )}
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleSelectPlan(plan.key)}
                    variant={plan.popular ? "default" : "outline"}
                    className={`w-full ${plan.popular ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}`}
                  >
                    {plan.ctaLabel}
                    {!isFree && <ArrowRight className="ml-2 w-4 h-4" />}
                  </Button>
                </Card>
              );
            })}
          </div>

          {/* Enterprise strip */}
          <Card className="p-6 mb-14 border-2 border-dashed bg-gradient-to-r from-primary/5 to-accent/5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold">Enterprise</h3>
                <Badge variant="outline" className="text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  Custom
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Custom agents, SSO/SAML, SLA 99.9%, white-label, API access &
                private deployment. Tailored for agencies & large orgs.
              </p>
            </div>
            <Button asChild size="lg">
              <a href={buildEnterpriseMailto()}>
                Contact Sales <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </Card>

          {/* Feature comparison */}
          <div className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
              Compare features
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              See exactly what each plan unlocks.
            </p>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left p-4 font-semibold">Feature</th>
                    {PLANS.map((p) => (
                      <th
                        key={p.key}
                        className={`text-center p-4 font-semibold ${p.popular ? "text-accent" : ""}`}
                      >
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_MATRIX.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-4 font-medium">{row.label}</td>
                      {(["free", "basic", "pro", "business"] as PlanKey[]).map(
                        (k) => {
                          const v = row[k];
                          return (
                            <td key={k} className="p-4 text-center">
                              {typeof v === "boolean" ? (
                                v ? (
                                  <Check className="w-4 h-4 text-accent inline" />
                                ) : (
                                  <XIcon className="w-4 h-4 text-muted-foreground/50 inline" />
                                )
                              ) : (
                                <span className="text-sm">{v}</span>
                              )}
                            </td>
                          );
                        },
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top-up — collapsed, opens on demand */}
          <Card className="p-6 mb-16 border-2 border-accent/20">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  Need extra capacity? Top-up tokens
                </h3>
                <p className="text-sm text-muted-foreground">
                  One-time packs that stack on top of any plan. Tokens never expire.
                </p>
              </div>
              <Button variant="outline" onClick={() => setTopupOpen(true)}>
                View top-up packs
              </Button>
            </div>
          </Card>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="text-center mb-8">
              <Badge className="mb-3 px-4 py-1">
                <HelpCircle className="w-3 h-3 mr-1" />
                FAQs
              </Badge>
              <h2 className="text-3xl font-bold">
                Frequently asked <span className="text-gradient">questions</span>
              </h2>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              <AccordionItem
                value="faq-1"
                className="border-2 rounded-xl px-6 bg-card/50"
              >
                <AccordionTrigger className="font-semibold">
                  Can I switch plans later?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes — upgrade, downgrade or switch monthly ↔ yearly any time.
                  Yearly billing saves you {YEARLY_DISCOUNT_PCT}% compared to monthly.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="faq-2"
                className="border-2 rounded-xl px-6 bg-card/50"
              >
                <AccordionTrigger className="font-semibold">
                  How do I pay?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {region.code === "IN"
                    ? "Pay via UPI to our official ID. Share the UTR with support and your plan activates within minutes."
                    : `International payments — email ${SUPPORT_EMAIL} with your chosen plan and we'll share PayPal / bank transfer details.`}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="faq-3"
                className="border-2 rounded-xl px-6 bg-card/50"
              >
                <AccordionTrigger className="font-semibold">
                  What is the Enterprise plan?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Custom plan with white-label, SSO/SAML, SLA and private
                  deployment for agencies & large orgs.{" "}
                  <a
                    href={buildEnterpriseMailto()}
                    className="text-accent underline"
                  >
                    Contact sales
                  </a>{" "}
                  for a quote.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="faq-4"
                className="border-2 rounded-xl px-6 bg-card/50"
              >
                <AccordionTrigger className="font-semibold">
                  Do I need a card to start?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. The Free plan is fully usable with zero payment info.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Card className="p-10 bg-gradient-to-br from-primary to-accent text-primary-foreground inline-block max-w-2xl">
              <Sparkles className="w-10 h-10 mx-auto mb-4" />
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                Start free today
              </h3>
              <p className="opacity-90 mb-6">
                No card. Upgrade only when you need more.
              </p>
              <Button asChild size="lg" variant="secondary" className="h-12 px-8">
                <Link to="/auth">
                  Create free account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      {/* Subscribe (manual UPI) */}
      <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Subscribe to {activePlanMeta?.name}
            </DialogTitle>
            <DialogDescription>
              {yearly ? "Yearly" : "Monthly"} billing · {region.label}
            </DialogDescription>
          </DialogHeader>

          <Card className="p-4 bg-muted/50">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-semibold">{activePlanMeta?.name}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Billing</span>
              <span className="font-semibold capitalize">
                {yearly ? "Yearly" : "Monthly"}
              </span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="text-2xl font-bold text-accent">
                {region.symbol}
                {activePrice.toLocaleString()}
              </span>
            </div>
          </Card>

          {region.code === "IN" ? (
            <>
              <Label className="text-xs">UPI ID</Label>
              <div className="flex gap-2">
                <Input value={UPI_ID} readOnly className="font-mono bg-muted" />
                <Button variant="outline" size="icon" onClick={handleCopyUPI}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20 text-sm">
                <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Pay <strong>{region.symbol}{activePrice}</strong> to the UPI ID,
                  then email your UTR + plan name (<strong>{activePlanMeta?.name}</strong>) to{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent underline">
                    {SUPPORT_EMAIL}
                  </a>
                  . Plan activates within minutes.
                </p>
              </div>
            </>
          ) : (
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-sm text-muted-foreground">
              Email{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent underline">
                {SUPPORT_EMAIL}
              </a>{" "}
              with the plan name (<strong>{activePlanMeta?.name}</strong>, {yearly ? "Yearly" : "Monthly"}) and we'll share PayPal / bank transfer details for {region.symbol}{activePrice}.
            </div>
          )}

          <Button className="w-full mt-2" onClick={() => setBuyOpen(false)}>
            Got it
          </Button>
        </DialogContent>
      </Dialog>

      {/* Top-up packs */}
      <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Top-up token packs</DialogTitle>
            <DialogDescription>
              One-time packs · stack on any plan · tokens never expire
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {topupPresets.map((p) => (
              <Card
                key={p.tokens}
                className="p-4 flex items-center justify-between hover:border-accent transition-colors"
              >
                <div>
                  <p className="font-semibold">{p.tokens.toLocaleString()} tokens</p>
                  <p className="text-xs text-muted-foreground">
                    {region.symbol}
                    {(p.price / p.tokens).toFixed(2)} / token
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-accent">
                    {region.symbol}
                    {p.price}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Pay via UPI to <span className="font-mono">{UPI_ID}</span> and email
            UTR + pack to{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent underline">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
