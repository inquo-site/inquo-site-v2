import { useState } from "react";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Copy, Check, Loader2, Smartphone, Shield, AlertCircle, Clock, Tag
} from "lucide-react";

interface AgentPaymentModalProps {
  open: boolean;
  onClose: () => void;
  agent: {
    id: string;
    name: string;
    icon: string;
    monthly_price: number;
    yearly_price: number;
    one_time_price: number;
    usd_monthly_price: number;
    usd_yearly_price: number;
    usd_one_time_price: number;
  };
  purchaseType: 'monthly' | 'yearly' | 'lifetime';
}

export const AgentPaymentModal = ({ open, onClose, agent, purchaseType }: AgentPaymentModalProps) => {
  const [step, setStep] = useState<'init' | 'payment' | 'utr' | 'success'>('init');
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountedAmount, setDiscountedAmount] = useState<number | null>(null);

  const isIndia = () => {
    const country = localStorage.getItem("selectedCountry");
    return !country || country === "IN";
  };

  const inr = isIndia();
  const currency = inr ? 'INR' : 'USD';
  const symbol = inr ? '₹' : '$';

  const priceMap = {
    monthly: inr ? agent.monthly_price : agent.usd_monthly_price,
    yearly: inr ? agent.yearly_price : agent.usd_yearly_price,
    lifetime: inr ? agent.one_time_price : agent.usd_one_time_price,
  };
  const originalAmount = priceMap[purchaseType];
  const amount = discountedAmount !== null ? discountedAmount : originalAmount;

  const billingLabel = {
    monthly: 'Monthly Subscription',
    yearly: 'Yearly Subscription',
    lifetime: 'Lifetime Access',
  }[purchaseType];

  const handleInitPayment = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to continue");
        onClose();
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          action: 'create',
          agent_id: agent.id,
          billing_cycle: purchaseType,
          currency,
          promo_code: promoCode.trim() || undefined,
        }
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setPaymentId(data.payment_id);
      setUpiId(data.upi_id);
      if (data.promo_applied) {
        setAppliedPromo(data.promo_applied);
        setDiscountedAmount(data.amount);
      }
      setStep('payment');
    } catch (error: any) {
      console.error('Payment init error:', error);
      toast.error("Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUPI = async () => {
    await navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success("UPI ID copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitUTR = async () => {
    if (!utrNumber.trim()) {
      toast.error("Please enter UTR/Transaction ID");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { action: 'submit_utr', payment_id: paymentId, utr_number: utrNumber.trim() }
      });
      if (error) throw error;
      if (data.error) { toast.error(data.error); return; }
      setStep('success');
      toast.success("Payment submitted for verification!");
    } catch (error) {
      toast.error("Failed to submit payment details");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('init');
    setPaymentId(null);
    setUpiId('');
    setUtrNumber('');
    setPromoCode('');
    setAppliedPromo(null);
    setDiscountedAmount(null);
    onClose();
  };

  const displayAmount = discountedAmount !== null ? discountedAmount : originalAmount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {step === 'success' ? 'Payment Submitted!' : `Get ${agent.name}`}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 'init' && billingLabel}
            {step === 'payment' && 'Pay using any UPI app'}
            {step === 'utr' && 'Enter your transaction details'}
            {step === 'success' && 'Your payment is being verified. Access will be granted once confirmed.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'init' && (
          <div className="space-y-4">
            <Card className="p-4 bg-muted/50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{agent.name}</span>
                <Badge>{billingLabel}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Price</span>
                <span className="text-2xl font-bold">{symbol}{originalAmount.toLocaleString()}</span>
              </div>
            </Card>

            {/* Promo Code Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Tag className="w-3.5 h-3.5" />
                Have a promo code?
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="uppercase font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Secure payment via UPI</span>
            </div>
            <Button className="w-full" onClick={handleInitPayment} disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <><Smartphone className="w-4 h-4 mr-2" /> Pay {symbol}{originalAmount.toLocaleString()} with UPI</>
              )}
            </Button>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
            <Card className="p-4 bg-accent/5 border-accent/20 text-center">
              <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
              <p className="text-3xl font-bold text-accent">{symbol}{displayAmount.toLocaleString()}</p>
              {appliedPromo && (
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Tag className="w-3 h-3" />
                    {appliedPromo} applied
                  </Badge>
                  {discountedAmount !== null && discountedAmount < originalAmount && (
                    <span className="text-xs text-muted-foreground line-through">{symbol}{originalAmount.toLocaleString()}</span>
                  )}
                </div>
              )}
            </Card>
            <div className="space-y-2">
              <Label>UPI ID (Copy & Pay)</Label>
              <div className="flex gap-2">
                <Input value={upiId} readOnly className="font-mono bg-muted" />
                <Button variant="outline" size="icon" onClick={handleCopyUPI}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="font-medium text-sm">How to pay:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Copy the UPI ID above</li>
                <li>Open any UPI app (GPay, PhonePe, Paytm)</li>
                <li>Pay exactly <strong>{symbol}{displayAmount.toLocaleString()}</strong></li>
                <li>Note the UTR/Transaction ID</li>
              </ol>
            </div>
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Pay exactly {symbol}{displayAmount.toLocaleString()}. Wrong amount may delay verification.
              </p>
            </div>
            <Button className="w-full" onClick={() => setStep('utr')}>
              I've Made the Payment
            </Button>
          </div>
        )}

        {step === 'utr' && (
          <div className="space-y-4">
            <Card className="p-4 bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold">{symbol}{displayAmount.toLocaleString()}</span>
              </div>
            </Card>
            <div className="space-y-2">
              <Label htmlFor="utr">UTR / Transaction ID *</Label>
              <Input
                id="utr"
                placeholder="Enter 12-digit UTR number"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="font-mono"
              />
            </div>
            <Button className="w-full" onClick={handleSubmitUTR} disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Submit for Verification'}
            </Button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Your payment is being verified. You'll get access to <strong>{agent.name}</strong> once confirmed (usually within 1-2 hours).
              </p>
            </div>
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Verification usually takes 1-2 hours</span>
            </div>
            <Button className="w-full" onClick={handleClose}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
