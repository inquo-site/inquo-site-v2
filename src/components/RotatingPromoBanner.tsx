import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Sparkles, ArrowRight, Zap, Megaphone } from "lucide-react";
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
  html_code?: string | null;
}

const ROTATE_MS = 30_000;
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
  const [bursting, setBursting] = useState(false);
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    const at = localStorage.getItem(DISMISS_KEY);
    if (!at) { setClosed(false); return; }
    const hoursPassed = (Date.now() - Number(at)) / 36e5;
    setClosed(hoursPassed < DISMISS_HOURS);
  }, []);

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
        gradient: a.background_gradient && a.background_gradient.startsWith("from-")
          ? a.background_gradient
          : gradients[0],
        source: "ad",
        html_code: a.html_code || null,
      }));

      const all = [...adSlides, ...toolSlides].sort(() => Math.random() - 0.5);
      setSlides(all);
    })();
  }, []);

  // Auto-rotate w/ tear animation
  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => {
      setBursting(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % slides.length);
        setBursting(false);
        setEntering(true);
        setTimeout(() => setEntering(false), 700);
      }, 480);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 700);
    return () => clearTimeout(t);
  }, []);

  const slide = useMemo(() => slides[idx], [slides, idx]);
  const hideRoute = HIDE_ON.some((p) => location.pathname.startsWith(p));

  if (closed || !slide || hideRoute) return null;

  const dismiss = () => {
    setBursting(true);
    setTimeout(() => {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
      setClosed(true);
    }, 450);
  };

  return (
    <>
      {/* Inline keyframes — scoped */}
      <style>{`
        @keyframes promo-tear-in {
          0%   { transform: translateY(120%) rotate(-8deg) scale(.7); opacity: 0; filter: blur(8px); }
          60%  { transform: translateY(-12px) rotate(2deg) scale(1.04); opacity: 1; filter: blur(0); }
          80%  { transform: translateY(4px) rotate(-1deg) scale(.99); }
          100% { transform: translateY(0) rotate(0) scale(1); opacity: 1; }
        }
        @keyframes promo-tear-out {
          0%   { transform: translate(0,0) rotate(0) scale(1); opacity: 1; clip-path: polygon(0 0,100% 0,100% 100%,0 100%); }
          40%  { transform: translate(8px,-6px) rotate(3deg) scale(1.02); clip-path: polygon(0 0,100% 0,92% 60%,80% 100%,0 100%); }
          100% { transform: translate(140%,40%) rotate(18deg) scale(.6); opacity: 0; clip-path: polygon(0 0,60% 0,40% 50%,20% 100%,0 100%); }
        }
        @keyframes promo-shimmer-x {
          0% { transform: translateX(-120%) skewX(-20deg); }
          100% { transform: translateX(220%) skewX(-20deg); }
        }
        @keyframes promo-pulse-ring {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,.35), 0 20px 60px -10px rgba(0,0,0,.5); }
          50%     { box-shadow: 0 0 0 14px rgba(255,255,255,0),   0 30px 80px -10px rgba(0,0,0,.6); }
        }
        .promo-enter { animation: promo-tear-in .7s cubic-bezier(.2,.9,.25,1.2) both; }
        .promo-leave { animation: promo-tear-out .48s cubic-bezier(.6,0,.8,.2) both; }
        .promo-shimmer::after {
          content:''; position:absolute; inset:0; pointer-events:none;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
          width: 40%; animation: promo-shimmer-x 2.6s ease-in-out infinite;
        }
        .promo-tape {
          position:absolute; top:-10px; left:50%; transform:translateX(-50%) rotate(-3deg);
          width:80px; height:18px; background:rgba(255,255,255,.35);
          border:1px dashed rgba(255,255,255,.6); backdrop-filter: blur(4px);
        }
      `}</style>

      <div className="fixed bottom-4 right-4 z-[60] w-[92vw] max-w-sm">
        <div
          key={slide.id}
          className={`relative ${entering ? "promo-enter" : ""} ${bursting ? "promo-leave" : ""}`}
          style={{ perspective: "800px" }}
        >
          {/* Custom HTML ad takes over completely */}
          {slide.html_code ? (
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div dangerouslySetInnerHTML={{ __html: slide.html_code }} />
            </div>
          ) : (
            <div
              className={`promo-shimmer relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br ${slide.gradient} p-5 text-white`}
              style={{ animation: "promo-pulse-ring 3s ease-in-out infinite" }}
            >
              <div className="promo-tape" />

              {/* grain */}
              <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
                   style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.4) 1px, transparent 1px)", backgroundSize: "3px 3px" }} />

              {/* diagonal slash */}
              <div className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rotate-12 bg-white/10 blur-2xl" />

              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/15 hover:bg-white/30 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex h-5 w-5 items-center justify-center">
                    <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                    <Zap className="w-3 h-3 relative" />
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.2em] opacity-90">{slide.badge}</span>
                </div>
                <h4 className="text-lg font-bold leading-tight drop-shadow">{slide.title}</h4>
                <p className="text-sm opacity-90 mt-1 line-clamp-2">{slide.description}</p>

                <Link
                  to={slide.cta_link}
                  onClick={() => setTimeout(dismiss, 200)}
                  className="group mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  {slide.cta_text}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

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
          )}
        </div>
      </div>
    </>
  );
}
