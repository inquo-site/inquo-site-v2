import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Zap, Crown, Infinity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  toolName?: string;
}

export function PremiumModal({ open, onClose, toolName }: PremiumModalProps) {
  const plans = [
    {
      name: "Pro Plan",
      price: "$25",
      period: "/month",
      badge: "Pro User",
      icon: Zap,
      features: [
        "Access All 100+ AI Tools 🔓",
        "Early Access to new tools",
        "40 credits/day usage",
        "Premium AI Models (GPT-4, Gemini, Claude)",
        "Fast priority support",
        "Get upcoming versions free"
      ],
      cta: "Upgrade to Pro",
      popular: true
    },
    {
      name: "Yearly Plan",
      price: "$249",
      period: "/year",
      badge: "Yearly Pro",
      icon: Crown,
      savings: "Save $51",
      features: [
        "Access All 100+ AI Tools 🔓",
        "Early Access to new & beta tools",
        "50 credits/day usage",
        "Premium AI Models + API Access",
        "Fastest support priority",
        "Free updates forever"
      ],
      cta: "Get Yearly",
      popular: false
    },
    {
      name: "Lifetime Plan",
      price: "$1999",
      period: "one-time",
      badge: "Lifetime Elite",
      icon: Infinity,
      features: [
        "Unlimited Access to all tools",
        "∞ Unlimited Credits - no daily limits",
        "Early Access Forever",
        "Lifetime Premium Support",
        "No renewal required",
        "Pay once, use forever"
      ],
      cta: "Go Lifetime",
      popular: false
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">
            Unlock Premium Features
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            {toolName ? (
              <>Upgrade to access <span className="font-semibold text-foreground">{toolName}</span> and 90+ more premium tools</>
            ) : (
              "Choose the plan that works best for you"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.name} 
                className={`p-6 relative ${plan.popular ? 'border-primary border-2' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                {plan.savings && (
                  <Badge className="absolute -top-3 right-4 bg-green-500">
                    {plan.savings}
                  </Badge>
                )}
                
                <div className="text-center mb-6">
                  <Icon className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <Badge variant="outline" className="mt-2">{plan.badge}</Badge>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            All premium plans include access to GPT-4, Claude, and Gemini models. 
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
