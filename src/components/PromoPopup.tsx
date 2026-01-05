import { useState, useEffect } from "react";
import { X, Copy, Check, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchActiveBanner();
  }, []);

  const fetchActiveBanner = async () => {
    // Check if user dismissed this popup recently
    const dismissed = localStorage.getItem("promo_popup_dismissed");
    if (dismissed) {
      const dismissedData = JSON.parse(dismissed);
      const dismissedTime = new Date(dismissedData.time).getTime();
      const now = new Date().getTime();
      // Don't show for 24 hours after dismissal
      if (now - dismissedTime < 24 * 60 * 60 * 1000) {
        return;
      }
    }

    const { data, error } = await supabase
      .from('promotional_banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(1);

    if (!error && data && data.length > 0) {
      const activeBanner = data[0];
      // Check if not expired
      if (!activeBanner.expires_at || new Date(activeBanner.expires_at) > new Date()) {
        setBanner(activeBanner);
        // Show popup with delay for better UX
        setTimeout(() => setIsVisible(true), 1500);
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("promo_popup_dismissed", JSON.stringify({
      time: new Date().toISOString(),
      bannerId: banner?.id
    }));
  };

  const copyPromoCode = async () => {
    if (banner?.promo_code) {
      await navigator.clipboard.writeText(banner.promo_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!banner || !isVisible) return null;

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
          backgroundColor: banner.background_color || "#EF233C",
          color: banner.text_color || "#FFFFFF"
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

          {banner.discount_text && (
            <div className="inline-block px-4 py-2 mb-4 bg-white/20 rounded-full text-lg font-bold">
              {banner.discount_text}
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            {banner.title}
          </h2>
          
          {banner.description && (
            <p className="text-lg opacity-90 mb-6">
              {banner.description}
            </p>
          )}

          {banner.promo_code && (
            <div className="mb-6">
              <p className="text-sm opacity-75 mb-2">Use code at checkout:</p>
              <button
                onClick={copyPromoCode}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-mono text-xl font-bold transition-colors group"
              >
                {banner.promo_code}
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

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white hover:bg-white/90 font-semibold shadow-lg"
              style={{ color: banner.background_color || "#EF233C" }}
            >
              <a href={banner.cta_link || "/pricing"}>
                {banner.cta_text || "Claim Offer"}
              </a>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleDismiss}
              className="border-2 border-white/30 hover:bg-white/10"
              style={{ color: banner.text_color || "#FFFFFF" }}
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
