import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Slide {
  id: string;
  title: string;
  description: string;
  cta_text: string;
  cta_link: string;
  badge?: string;
  gradient: string;
  source: "tool" | "ad";
}

const ROTATE_MS = 30_000; // change every 30s
const DISMISS_KEY = "promo_banner_dismissed_at";
const DISMISS_HOURS = 12;

const gradients = [
  "from-[#0A66C2] via-[#1e40af] to-[#7c3aed]",
  "from-[#f97316] via-[#ec4899] to-[#a855f7]",
  "from-[#10b981] via-[#06b6d4] to-[#3b82f6]",
  "from-[#ef4444] via-[#f59e0b] to-[#eab308]",
  "from-accent via-primary to-accent",
];

const HIDE_ON = ["/admin", "/auth"];

export default function RotatingPromoBanner() {
  const location = useLocation();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [idx, setIdx] = useState(0);
  const [closed, setClosed] = useState(true);

  // Respect dismiss timestamp
  useEffect(() => {
    const at = localStorage.getItem(DISMISS_KEY);
    if (!at) { setClosed(false); return; }
    const hoursPassed = (Date.now() - Number(at)) / 36e5;
    setClosed(hoursPassed < DISMISS_HOURS);
  }, []);

  // Load tools + custom ads
  useEffect(() => {
    (async () => {
      const [toolsRes, adsRes] = await Promise.all([
        supabase.from("tools").select("name, description, route_path, tool_type, badge").limit(40),
        (supabase as any).from("custom_ads").select("*").eq("is_active", true).order("display_order"),
      ]);

      const toolSlides: Slide[] = (toolsRes.data || [])
        .filter((t: any) => t.route_path || t.tool_type)
        .map((t: any, i: number) => ({
          id: `tool-${t.tool_type || i}`,
          title: t.name,
          description: t.description || "Try this AI tool free — no signup required.",
          cta_text: "Try Free",
          cta_link: t.route_path || `/tool/${t.tool_type}`,
          badge: t.badge || "FEATURED TOOL",
          gradient: gradients[i % gradients.length],
          source: "tool",
        }));

      const adSlides: Slide[] = (adsRes.data || []).map((a: any) => ({
        id: `ad-${a.id}`,
        title: a.title,
        description: a.description || "",
        cta_text: a.cta_text || "Learn More",
        cta_link: a.cta_link || "/",
        badge: "PARTNER",
        gradient: a.background_gradient
          ? (a.background_gradient.startsWith("from-") ? a.background_gradient : `from-[${a.background_gradient}] to-primary`)
          : gradients[0],
        source: "ad",
      }));

      // Shuffle for variety
      const all = [...adSlides, ...toolSlides].sort(() => Math.random() - 0.5);
      setSlides(all);
    })();
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  const slide = useMemo(() => slides[idx], [slides, idx]);
  const hideRoute = HIDE_ON.some((p) => location.pathname.startsWith(p));

  if (closed || !slide || hideRoute) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setClosed(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-[92vw] max-w-sm animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div
        key={slide.id}
        className={`relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-gradient-to-br ${slide.gradient} p-5 text-white`}
      >
        {/* grain */}
        <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
             style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.4) 1px, transparent 1px)", backgroundSize: "3px 3px" }} />
        {/* shimmer */}
        <div className="pointer-events-none absolute -inset-y-4 -left-1/2 w-1/2 rotate-12 bg-white/10 blur-2xl animate-[shimmer_3s_ease-in-out_infinite]" />

        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold tracking-widest opacity-90">{slide.badge}</span>
          </div>
          <h4 className="text-lg font-bold leading-tight">{slide.title}</h4>
          <p className="text-sm opacity-90 mt-1 line-clamp-2">{slide.description}</p>

          <Link
            to={slide.cta_link}
            onClick={() => {
              // soft auto-close on click
              setTimeout(dismiss, 200);
            }}
            className="group mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition"
          >
            {slide.cta_text}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {/* progress dots */}
          {slides.length > 1 && (
            <div className="mt-3 flex gap-1">
              {slides.slice(0, Math.min(6, slides.length)).map((_, i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${i === idx % 6 ? "bg-white" : "bg-white/30"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
