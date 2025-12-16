import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Tag, Check, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  expires_at: string | null;
}

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  toolName?: string;
}

export function PremiumModal({ open, onClose, toolName }: PremiumModalProps) {
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState("");
  const [activePromos, setActivePromos] = useState<PromoCode[]>([]);

  useEffect(() => {
    if (open) {
      fetchActivePromos();
    }
  }, [open]);

  const fetchActivePromos = async () => {
    try {
      const { data } = await supabase
        .from('promo_codes')
        .select('id, code, discount_type, discount_value, expires_at')
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .limit(3);
      
      setActivePromos(data || []);
    } catch (error) {
      console.error('Error fetching promos:', error);
    }
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setValidatingCode(true);
    setPromoError("");

    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase().trim())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setPromoError("Invalid promo code");
        setAppliedPromo(null);
        return;
      }

      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setPromoError("This promo code has expired");
        setAppliedPromo(null);
        return;
      }

      // Check usage limit
      if (data.max_uses !== null && data.current_uses >= data.max_uses) {
        setPromoError("This promo code has reached its usage limit");
        setAppliedPromo(null);
        return;
      }

      setAppliedPromo(data);
      toast({
        title: "Promo Code Applied!",
        description: `You'll get ${data.discount_type === 'percentage' ? `${data.discount_value}%` : `₹${data.discount_value}`} off!`
      });
    } catch (error) {
      setPromoError("Failed to validate promo code");
    } finally {
      setValidatingCode(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  };

  const handleViewPlans = () => {
    // Store promo code in sessionStorage for the pricing page
    if (appliedPromo) {
      sessionStorage.setItem('appliedPromoCode', JSON.stringify(appliedPromo));
    }
    onClose();
    navigate("/pricing");
  };

  const handleClose = () => {
    setPromoCode("");
    setAppliedPromo(null);
    setPromoError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {/* Promo Banner */}
        {activePromos.length > 0 && !appliedPromo && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1 text-sm animate-pulse">
              🎉 Use code <span className="font-bold">{activePromos[0].code}</span> for {activePromos[0].discount_type === 'percentage' ? `${activePromos[0].discount_value}%` : `₹${activePromos[0].discount_value}`} OFF!
            </Badge>
          </div>
        )}

        <DialogHeader className="text-center pt-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            {toolName ? (
              <>
                <span className="font-semibold text-foreground">{toolName}</span> is a premium tool.
              </>
            ) : (
              "This is a premium feature."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
            <span>Access to all 160+ AI tools</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
            <span>Higher usage limits & priority support</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
            <span>Export, download & API access</span>
          </div>
        </div>

        {/* Promo Code Input */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Have a promo code?</span>
          </div>
          
          {appliedPromo ? (
            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="font-mono font-bold text-green-600">{appliedPromo.code}</span>
                <Badge variant="secondary" className="text-xs">
                  {appliedPromo.discount_type === 'percentage' 
                    ? `${appliedPromo.discount_value}% OFF` 
                    : `₹${appliedPromo.discount_value} OFF`}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={removePromo}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoError("");
                }}
                className="uppercase font-mono"
              />
              <Button 
                variant="secondary" 
                onClick={validatePromoCode}
                disabled={validatingCode}
              >
                {validatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
              </Button>
            </div>
          )}
          
          {promoError && (
            <p className="text-sm text-destructive mt-2">{promoError}</p>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <Button onClick={handleViewPlans} className="w-full" size="lg">
            View Plans & Pricing
            {appliedPromo && (
              <Badge variant="secondary" className="ml-2 text-xs">
                with {appliedPromo.discount_type === 'percentage' ? `${appliedPromo.discount_value}%` : `₹${appliedPromo.discount_value}`} discount
              </Badge>
            )}
          </Button>
          <Button onClick={handleClose} variant="ghost" className="w-full">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
