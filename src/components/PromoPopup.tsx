import { useState, useEffect } from "react";
import { X, Copy, Check, Gift, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  applicable_plans: string[] | null;
  expires_at: string | null;
}

interface Banner {
  id: string;
  title: string;
  description: string | null;
  promo_code: string | null;
  discount_text: string | null;
  cta_text: string | null;
  cta_link: string | null;
  background_color: string | null;
  text_color: string | null;
}

export const PromoPopup = () => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [promoDetails, setPromoDetails] = useState<PromoCode | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchActivePromo();
  }, []);

  const fetchActivePromo = async () => {
    // Check if user has already seen the popup (use session-based for better UX)
    const dismissed = localStorage.getItem("promo_popup_dismissed");
    const lastDismissed = dismissed ? new Date(dismissed) : null;
    const now = new Date();
    
    // Show popup again after 24 hours
    if (lastDismissed && (now.getTime() - lastDismissed.getTime()) < 24 * 60 * 60 * 1000) {
      return;
    }

    // First fetch active promo codes
    const { data: promoData, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!promoError && promoData && promoData.length > 0) {
      const activePromo = promoData[0];
      // Check if not expired
      if (!activePromo.expires_at || new Date(activePromo.expires_at) > new Date()) {
        setPromoDetails(activePromo);
        
        // Also fetch banner if exists
        const { data: bannerData } = await supabase
          .from('promotional_banners')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .limit(1);

        if (bannerData && bannerData.length > 0) {
          const activeBanner = bannerData[0];
          if (!activeBanner.expires_at || new Date(activeBanner.expires_at) > new Date()) {
            setBanner(activeBanner);
          }
        }
        
        // Show popup with delay for better UX
        setTimeout(() => setIsVisible(true), 1500);
      }
    }
  };

  const formatDiscount = () => {
    if (!promoDetails) return "";
    if (promoDetails.discount_type === "percentage") {
      return `${promoDetails.discount_value}% OFF`;
    }
    return `₹${promoDetails.discount_value} OFF`;
  };

  const getPlanDisplayName = (plan: string) => {
    const names: Record<string, string> = {
      starter: "Starter",
      pro: "Pro",
      business: "Business",
      yearly: "Yearly",
      lifetime: "Lifetime"
    };
    return names[plan.toLowerCase()] || plan;
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Mark as dismissed with timestamp (show again after 24 hours)
    localStorage.setItem("promo_popup_dismissed", new Date().toISOString());
  };

  const copyPromoCode = async () => {
    const code = promoDetails?.code || banner?.promo_code;
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Show popup if we have active promo code
  if (!promoDetails || !isVisible) return null;

  const promoCode = promoDetails.code;
  const bgColor = banner?.background_color || "#EF233C";
  const textColor = banner?.text_color || "#FFFFFF";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleDismiss}
      />
      
      {/* Popup */}
      <div 
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        style={{ 
          backgroundColor: bgColor,
          color: textColor
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 translate-y-12" />
        <div className="absolute top-1/2 right-4 opacity-20">
          <Gift className="w-20 h-20" />
        </div>
        
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-white/20 animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>

          {/* Discount Badge */}
          <div className="inline-block px-4 py-2 mb-4 bg-white/20 rounded-full text-lg font-bold">
            {banner?.discount_text || formatDiscount()}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            {banner?.title || "🎉 Special Offer!"}
          </h2>
          
          <p className="text-lg opacity-90 mb-4">
            {banner?.description || `Get ${formatDiscount()} on your subscription!`}
          </p>

          {/* Applicable Plans */}
          {promoDetails.applicable_plans && promoDetails.applicable_plans.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 text-sm opacity-75 mb-2">
                <Tag className="w-4 h-4" />
                <span>Valid on:</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {promoDetails.applicable_plans.map((plan) => (
                  <Badge
                    key={plan}
                    variant="secondary"
                    className="bg-white/20 text-current border-white/30 px-3 py-1"
                  >
                    {getPlanDisplayName(plan)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Promo Code */}
          {promoCode && (
            <div className="mb-6">
              <p className="text-sm opacity-75 mb-2">Use code at checkout:</p>
              <button
                onClick={copyPromoCode}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-mono text-xl font-bold transition-colors group"
              >
                {promoCode}
                {copied ? (
                  <Check className="w-5 h-5 text-green-300" />
                ) : (
                  <Copy className="w-5 h-5 opacity-75 group-hover:opacity-100" />
                )}
              </button>
              {copied && (
                <p className="text-sm mt-2 opacity-75">Code copied!</p>
              )}
            </div>
          )}

          {/* Expiry info */}
          {promoDetails.expires_at && (
            <p className="text-xs opacity-60 mb-4">
              Expires: {new Date(promoDetails.expires_at).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white hover:bg-white/90 font-semibold shadow-lg"
              style={{ color: bgColor }}
            >
              <a href={banner?.cta_link || "/pricing"}>
                {banner?.cta_text || "Claim Offer"}
              </a>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleDismiss}
              className="border-2 border-white/30 hover:bg-white/10"
              style={{ color: textColor }}
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
