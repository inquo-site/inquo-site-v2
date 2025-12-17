import { useState, useEffect } from "react";
import { X, Tag, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Banner {
  id: string;
  title: string;
  description: string | null;
  promo_code: string | null;
  discount_text: string | null;
  cta_text: string;
  cta_link: string;
  background_color: string;
  text_color: string;
}

export function PromotionalBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    // Auto-rotate banners every 5 seconds
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const fetchBanners = async () => {
    const { data } = await supabase
      .from('promotional_banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (data) {
      const dismissed = JSON.parse(localStorage.getItem('dismissed_banners') || '[]');
      const activeBanners = data.filter(b => !dismissed.includes(b.id));
      setBanners(activeBanners);
    }
  };

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissed, id];
    setDismissed(newDismissed);
    localStorage.setItem('dismissed_banners', JSON.stringify(newDismissed));
    setBanners(banners.filter(b => b.id !== id));
    if (currentIndex >= banners.length - 1) {
      setCurrentIndex(0);
    }
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (banners.length === 0) return null;

  const banner = banners[currentIndex];
  if (!banner) return null;

  return (
    <div 
      className="relative overflow-hidden animate-fade-in"
      style={{ 
        backgroundColor: banner.background_color,
        color: banner.text_color 
      }}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-xl animate-bounce" style={{ animationDuration: '3s' }} />
      </div>

      <div className="relative py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left">
          {/* Sparkle icon */}
          <Sparkles className="w-5 h-5 animate-pulse hidden sm:block" />
          
          {/* Main content */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <span className="font-bold text-sm sm:text-base">
              {banner.title}
            </span>
            
            {banner.description && (
              <span className="text-sm opacity-90 hidden md:inline">
                {banner.description}
              </span>
            )}
            
            {banner.discount_text && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm font-bold animate-pulse">
                {banner.discount_text}
              </span>
            )}
            
            {banner.promo_code && (
              <button
                onClick={() => copyPromoCode(banner.promo_code!)}
                className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors group"
              >
                <Tag className="w-4 h-4" />
                <span className="font-mono font-bold text-sm">{banner.promo_code}</span>
                <span className="text-xs opacity-75 group-hover:opacity-100">
                  {copied ? '✓ Copied!' : 'Copy'}
                </span>
              </button>
            )}
          </div>

          {/* CTA Button */}
          <Button
            asChild
            size="sm"
            className="bg-white/20 hover:bg-white/30 border-0 text-inherit font-semibold"
          >
            <Link to={banner.cta_link}>
              {banner.cta_text}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>

          {/* Banner indicators */}
          {banners.length > 1 && (
            <div className="flex gap-1 ml-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Dismiss button */}
          <button
            onClick={() => handleDismiss(banner.id)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors sm:relative sm:right-0 sm:top-0 sm:translate-y-0"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
