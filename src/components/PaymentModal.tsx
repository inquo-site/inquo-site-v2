import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Copy, 
  Check, 
  Loader2, 
  Smartphone, 
  Shield,
  AlertCircle,
  Clock,
  Tag,
  X
} from "lucide-react";
import { isIndianUser } from "./CountrySelector";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  planType: 'starter' | 'pro' | 'business';
  billingCycle: 'monthly' | 'yearly';
}

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
}

// Pricing display (matches backend)
const PRICING_DISPLAY = {
  INR: {
    starter: { monthly: 199, yearly: 1999 },
    pro: { monthly: 499, yearly: 4999 },
    business: { monthly: 999, yearly: 9999 },
  },
  USD: {
    starter: { monthly: 5, yearly: 49 },
    pro: { monthly: 12, yearly: 119 },
    business: { monthly: 25, yearly: 249 },
  }
};

const PLAN_NAMES = {
  starter: 'Starter',
  pro: 'Pro',
  business: 'Business'
};

export const PaymentModal = ({ open, onClose, planType, billingCycle }: PaymentModalProps) => {
  const [step, setStep] = useState<'init' | 'payment' | 'utr' | 'success'>('init');
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [upiId, setUpiId] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState("");

  const isIndia = isIndianUser();
  const currency = isIndia ? 'INR' : 'USD';
  const currencySymbol = isIndia ? '₹' : '$';
  const originalAmount = PRICING_DISPLAY[currency][planType][billingCycle];
  
  // Calculate discounted amount
  const getDiscountedAmount = () => {
    if (!appliedPromo) return originalAmount;
    
    if (appliedPromo.discount_type === 'percentage') {
      return Math.round(originalAmount * (1 - appliedPromo.discount_value / 100));
    } else {
      // For fixed discount, convert based on currency
      const discount = currency === 'INR' ? appliedPromo.discount_value : appliedPromo.discount_value;
      return Math.max(0, originalAmount - discount);
    }
  };

  const finalAmount = getDiscountedAmount();
  const discount = originalAmount - finalAmount;

  // Check for promo code from session storage (from PremiumModal)
  useEffect(() => {
    if (open) {
      const storedPromo = sessionStorage.getItem('appliedPromoCode');
      if (storedPromo) {
        try {
          const promo = JSON.parse(storedPromo);
          setAppliedPromo(promo);
          setPromoCode(promo.code);
          sessionStorage.removeItem('appliedPromoCode');
        } catch (e) {
          console.error('Error parsing stored promo:', e);
        }
      }
    }
  }, [open]);

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

      // Check applicable plans
      if (!data.applicable_plans.includes(planType)) {
        setPromoError(`This code is not valid for ${PLAN_NAMES[planType]} plan`);
        setAppliedPromo(null);
        return;
      }

      // Check minimum amount
      if (data.min_amount && originalAmount < data.min_amount) {
        setPromoError(`Minimum order of ${currencySymbol}${data.min_amount} required`);
        setAppliedPromo(null);
        return;
      }

      setAppliedPromo(data);
      toast({
        title: "Promo Code Applied!",
        description: `You'll save ${currencySymbol}${discount > 0 ? discount : (data.discount_type === 'percentage' ? Math.round(originalAmount * data.discount_value / 100) : data.discount_value)}!`
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

  const handleInitPayment = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Login Required",
          description: "Please login to continue with payment",
          variant: "destructive"
        });
        onClose();
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          action: 'create',
          plan_type: planType,
          billing_cycle: billingCycle,
          currency,
          promo_code: appliedPromo?.code
        }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      setPaymentId(data.payment_id);
      setUpiId(data.upi_id);
      setStep('payment');
    } catch (error: any) {
      console.error('Payment init error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUPI = async () => {
    await navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "UPI ID copied to clipboard"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitUTR = async () => {
    if (!utrNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter the UTR/Transaction ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          action: 'submit_utr',
          payment_id: paymentId,
          utr_number: utrNumber.trim()
        }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      setStep('success');
      toast({
        title: "Payment Submitted!",
        description: "Your payment is being verified. You'll be notified once confirmed."
      });
    } catch (error: any) {
      console.error('UTR submit error:', error);
      toast({
        title: "Error",
        description: "Failed to submit payment details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('init');
    setPaymentId(null);
    setUpiId('');
    setUtrNumber('');
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {step === 'success' ? 'Payment Submitted!' : `Upgrade to ${PLAN_NAMES[planType]}`}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 'init' && 'Complete your payment to unlock premium features'}
            {step === 'payment' && 'Pay using any UPI app'}
            {step === 'utr' && 'Enter your transaction details'}
            {step === 'success' && 'Your payment is being verified'}
          </DialogDescription>
        </DialogHeader>

        {step === 'init' && (
          <div className="space-y-4">
            <Card className="p-4 bg-muted/50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{PLAN_NAMES[planType]} Plan</span>
                <Badge>{billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Price</span>
                <span className={appliedPromo ? "line-through text-muted-foreground" : "text-2xl font-bold"}>
                  {currencySymbol}{originalAmount}
                </span>
              </div>
              {appliedPromo && (
                <>
                  <div className="flex justify-between items-center text-green-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-{currencySymbol}{discount}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t mt-2">
                    <span className="font-medium">Total</span>
                    <span className="text-2xl font-bold text-green-600">{currencySymbol}{finalAmount}</span>
                  </div>
                </>
              )}
            </Card>

            {/* Promo Code Input */}
            <div className="p-3 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Have a promo code?</span>
              </div>
              
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="font-mono font-bold text-green-600 text-sm">{appliedPromo.code}</span>
                    <Badge variant="secondary" className="text-xs">
                      {appliedPromo.discount_type === 'percentage' 
                        ? `${appliedPromo.discount_value}% OFF` 
                        : `${currencySymbol}${appliedPromo.discount_value} OFF`}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removePromo} className="h-6 w-6 p-0">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoError("");
                    }}
                    className="uppercase font-mono text-sm h-9"
                  />
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={validatePromoCode}
                    disabled={validatingCode}
                    className="h-9"
                  >
                    {validatingCode ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                  </Button>
                </div>
              )}
              
              {promoError && (
                <p className="text-xs text-destructive mt-1">{promoError}</p>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Secure payment via UPI</span>
            </div>

            <Button 
              className="w-full" 
              onClick={handleInitPayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Pay {currencySymbol}{finalAmount} with UPI
                </>
              )}
            </Button>

            {!isIndia && (
              <p className="text-xs text-center text-muted-foreground">
                International payments are processed in USD via PayPal. Contact support@inquo.site for assistance.
              </p>
            )}
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
            <Card className="p-4 bg-accent/5 border-accent/20">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
                <p className="text-3xl font-bold text-accent">{currencySymbol}{finalAmount}</p>
                {appliedPromo && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {appliedPromo.code} applied • Saved {currencySymbol}{discount}
                  </Badge>
                )}
              </div>
            </Card>

            <div className="space-y-2">
              <Label>UPI ID (Copy & Pay)</Label>
              <div className="flex gap-2">
                <Input 
                  value={upiId} 
                  readOnly 
                  className="font-mono bg-muted"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleCopyUPI}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="font-medium text-sm">How to pay:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Copy the UPI ID above</li>
                <li>Open any UPI app (GPay, PhonePe, Paytm, etc.)</li>
                <li>Enter the exact amount: <strong>{currencySymbol}{finalAmount}</strong></li>
                <li>Complete the payment</li>
                <li>Note down the UTR/Transaction ID</li>
              </ol>
            </div>

            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Important:</p>
                <p className="text-muted-foreground">
                  Pay exactly {currencySymbol}{finalAmount}. Wrong amount may delay verification.
                </p>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={() => setStep('utr')}
            >
              I've Made the Payment
            </Button>
          </div>
        )}

        {step === 'utr' && (
          <div className="space-y-4">
            <Card className="p-4 bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold">{currencySymbol}{finalAmount}</span>
              </div>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="utr">UTR / Transaction ID *</Label>
              <Input 
                id="utr"
                placeholder="Enter 12-22 digit UTR number"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                className="font-mono"
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground">
                Find UTR in your UPI app → Transaction History → Transaction Details
              </p>
            </div>

            <Button 
              className="w-full" 
              onClick={handleSubmitUTR}
              disabled={loading || !utrNumber.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit for Verification'
              )}
            </Button>

            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={() => setStep('payment')}
            >
              Go Back
            </Button>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-accent" />
            </div>

            <div>
              <p className="font-medium mb-2">Verification in Progress</p>
              <p className="text-sm text-muted-foreground">
                Our team will verify your payment within 24 hours. 
                You'll receive a notification once your plan is activated.
              </p>
            </div>

            <Card className="p-4 bg-muted/50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{PLAN_NAMES[planType]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">{currencySymbol}{finalAmount}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo ({appliedPromo.code})</span>
                    <span>-{currencySymbol}{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UTR</span>
                  <span className="font-mono text-xs">{utrNumber}</span>
                </div>
              </div>
            </Card>

            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
