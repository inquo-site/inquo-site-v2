import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Coins,
  Sparkles,
  Zap,
  Bot,
  Wrench,
  Gift,
  Globe,
  HelpCircle,
  ArrowRight,
  Copy,
  Check,
  Calculator,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  CountrySelector,
  getSelectedCountry,
  isIndianUser,
} from "@/components/CountrySelector";
import { SEOHead } from "@/components/SEOHead";
import { PromoPopup } from "@/components/PromoPopup";
import { toast } from "@/hooks/use-toast";

const PRESET_OPTIONS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
const TOKEN_PRICE_INR = 0.99;
const TOKEN_PRICE_USD = 0.04;
const FREE_MONTHLY_TOKENS = 20;
const UPI_ID = "webcraftmaster915@okicici";

const Pricing = () => {
  const [isIndia, setIsIndia] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("300");
  const [customTokens, setCustomTokens] = useState<string>("");
  const [buyOpen, setBuyOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSelectedCountry(getSelectedCountry());
    setIsIndia(isIndianUser());
  }, []);

  const tokens = useMemo(() => {
    if (selectedPreset === "custom") {
      const n = parseInt(customTokens, 10);
      return Number.isFinite(n) && n > 0 ? n : 0;
    }
    return parseInt(selectedPreset, 10) || 0;
  }, [selectedPreset, customTokens]);

  const symbol = isIndia ? "₹" : "$";
  const unit = isIndia ? TOKEN_PRICE_INR : TOKEN_PRICE_USD;
  const totalRaw = tokens * unit;
  const total = isIndia ? Math.round(totalRaw) : Number(totalRaw.toFixed(2));

  const handleChangeCountry = () => {
    localStorage.removeItem("user_country");
    window.location.reload();
  };

  const handleCopyUPI = async () => {
    await navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast({ title: "UPI ID copied" });
    setTimeout(() => setCopied(false), 1800);
  };

  const usageExamples = [
    { icon: Wrench, label: "AI Tools", cost: "1–2 tokens", note: "Per use (grammar, summarizer, ad copy, etc.)" },
    { icon: Bot, label: "AI Agents", cost: "5–15 tokens", note: "Per task (depending on complexity & length)" },
    { icon: Sparkles, label: "Image Gen", cost: "5–10 tokens", note: "Per image (size & model dependent)" },
  ];

  const faqs = [
    {
      q: "How does the token system work?",
      a: `Buy any number of tokens you need. Tools cost 1–2 tokens per use, agents cost 5–15 tokens per task. Tokens never expire on paid packs.`,
    },
    {
      q: "Do I get any free tokens?",
      a: `Yes — every account gets ${FREE_MONTHLY_TOKENS} free tokens per month, refreshed automatically. No card required.`,
    },
    {
      q: "What is the price per token?",
      a: `₹${TOKEN_PRICE_INR} per token for India and $${TOKEN_PRICE_USD} per token globally. The more you buy, the longer it lasts — no subscription, no recurring fee.`,
    },
    {
      q: "Can I buy a custom amount?",
      a: `Absolutely. Pick any preset from 100 to 1000, or choose Custom and enter exactly how many tokens you want.`,
    },
    {
      q: "How do I pay?",
      a: isIndia
        ? "Pay via UPI to our official ID. After payment share the UTR with support and tokens are credited within minutes."
        : "International users can pay via UPI (if available) or contact support@inquo.site for PayPal / bank transfer.",
    },
    {
      q: "Do tokens expire?",
      a: "Free monthly tokens reset every month. Purchased tokens stay in your wallet until used.",
    },
  ];

  const isCustom = selectedPreset === "custom";
  const canBuy = tokens > 0;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Token Pricing — Pay Only For What You Use | InQuo"
        description={`Simple token-based pricing. ${symbol}${unit} per token. Buy 100 to 1000 or custom. Tools cost 1–2 tokens, agents 5–15. ${FREE_MONTHLY_TOKENS} free tokens monthly.`}
        keywords="AI tokens, pay per use AI, token pricing, AI credits, InQuo pricing"
        canonicalUrl="https://inquo.site/pricing"
      />
      <PromoPopup />
      <Navbar />
      <CountrySelector onSelect={() => setIsIndia(isIndianUser())} />

      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 px-4 py-1">
              <Coins className="w-3 h-3 mr-1" />
              Token Pricing
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Pay Only For <span className="text-gradient">What You Use</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-3">
              One simple price. <strong>{symbol}{unit}</strong> per token.
              No plans, no subscriptions, no surprises.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              <Gift className="inline w-4 h-4 mr-1 text-accent" />
              Every account gets <strong>{FREE_MONTHLY_TOKENS} free tokens / month</strong>
            </p>

            {selectedCountry && (
              <button
                onClick={handleChangeCountry}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>
                  {selectedCountry.flag} Showing prices for {selectedCountry.name}
                </span>
                <span className="underline">(Change)</span>
              </button>
            )}
          </div>

          {/* Token Calculator */}
          <Card className="p-8 mb-12 border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="w-5 h-5 text-accent" />
              <h2 className="text-2xl font-bold">Choose Your Tokens</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Selector */}
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Token Quantity</Label>
                  <Select
                    value={selectedPreset}
                    onValueChange={(v) => setSelectedPreset(v)}
                  >
                    <SelectTrigger className="h-14 text-lg font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {PRESET_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n.toLocaleString()} tokens
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom amount…</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isCustom && (
                  <div className="animate-fade-in">
                    <Label className="mb-2 block">Enter custom token count</Label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 1500"
                      value={customTokens}
                      onChange={(e) => setCustomTokens(e.target.value)}
                      className="h-12 text-lg"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  {[100, 300, 500, 1000].map((q) => (
                    <button
                      key={q}
                      onClick={() => setSelectedPreset(String(q))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selectedPreset === String(q)
                          ? "bg-accent text-accent-foreground border-accent"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="rounded-xl bg-card border-2 border-border p-6 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">You'll get</p>
                  <p className="text-4xl font-bold mb-4">
                    {tokens.toLocaleString()}{" "}
                    <span className="text-base text-muted-foreground font-normal">
                      tokens
                    </span>
                  </p>
                  <div className="h-px bg-border my-4" />
                  <p className="text-sm text-muted-foreground mb-1">Total price</p>
                  <p className="text-5xl font-bold text-accent">
                    {symbol}
                    {total.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {symbol}{unit} per token · one-time payment
                  </p>
                </div>

                <Button
                  size="lg"
                  className="w-full mt-6 h-12 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={!canBuy}
                  onClick={() => setBuyOpen(true)}
                >
                  Buy {tokens.toLocaleString()} Tokens
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Usage Examples */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-2">
              How tokens are spent
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Transparent usage. You always see the cost before you run anything.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {usageExamples.map((u, i) => (
                <Card
                  key={i}
                  className="p-6 border-2 hover:border-accent/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-3">
                    <u.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold mb-1">{u.label}</h3>
                  <p className="text-accent font-semibold mb-1">{u.cost}</p>
                  <p className="text-sm text-muted-foreground">{u.note}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Free tier highlight */}
          <Card className="p-6 mb-16 border-2 border-dashed border-accent/40 bg-accent/5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center text-accent flex-shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">
                {FREE_MONTHLY_TOKENS} free tokens every month
              </h3>
              <p className="text-sm text-muted-foreground">
                Sign up and use {FREE_MONTHLY_TOKENS} tokens per month at zero cost.
                Resets automatically. Top up only when you need more.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/auth">
                Get free tokens <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </Card>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="text-center mb-10">
              <Badge className="mb-4 px-4 py-1">
                <HelpCircle className="w-3 h-3 mr-1" />
                FAQs
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Frequently Asked <span className="text-gradient">Questions</span>
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border-2 border-border/50 rounded-xl px-6 bg-card/50 hover:border-accent/50 transition-all data-[state=open]:border-accent"
                >
                  <AccordionTrigger className="text-left py-4 hover:no-underline">
                    <span className="font-semibold">{faq.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Card className="p-10 bg-gradient-to-br from-primary to-accent text-primary-foreground inline-block max-w-2xl">
              <Zap className="w-10 h-10 mx-auto mb-4" />
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                Start with {FREE_MONTHLY_TOKENS} free tokens today
              </h3>
              <p className="opacity-90 mb-6">
                No card. No commitment. Top up only when you love it.
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

      {/* Buy Tokens Modal — manual UPI */}
      <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buy {tokens.toLocaleString()} Tokens</DialogTitle>
            <DialogDescription>
              Pay {symbol}
              {total.toLocaleString()} via UPI. Tokens credit within minutes after we verify the payment.
            </DialogDescription>
          </DialogHeader>

          <Card className="p-4 bg-muted/50 mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Tokens</span>
              <span className="font-semibold">{tokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Price / token</span>
              <span className="font-semibold">
                {symbol}
                {unit}
              </span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="text-2xl font-bold text-accent">
                {symbol}
                {total.toLocaleString()}
              </span>
            </div>
          </Card>

          {isIndia ? (
            <>
              <Label className="text-xs">UPI ID</Label>
              <div className="flex gap-2">
                <Input value={UPI_ID} readOnly className="font-mono bg-muted" />
                <Button variant="outline" size="icon" onClick={handleCopyUPI}>
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20 text-sm">
                <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Pay <strong>exactly {symbol}{total}</strong> to the UPI ID, then
                  email your UTR + this token amount to{" "}
                  <a
                    href="mailto:inquo4@gmail.com"
                    className="text-accent underline"
                  >
                    inquo4@gmail.com
                  </a>
                  . Tokens credit within minutes.
                </p>
              </div>
            </>
          ) : (
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-sm text-muted-foreground">
              International payments: please email{" "}
              <a
                href="mailto:inquo4@gmail.com"
                className="text-accent underline"
              >
                inquo4@gmail.com
              </a>{" "}
              with the token quantity ({tokens.toLocaleString()}) and we'll share PayPal / bank transfer details for ${total}.
            </div>
          )}

          <Button className="w-full mt-2" onClick={() => setBuyOpen(false)}>
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
