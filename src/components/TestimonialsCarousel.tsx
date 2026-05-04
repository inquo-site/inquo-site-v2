import { useState, useEffect } from "react";
import { Star, Quote, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  industry: string;
  result: string;
  metric: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    role: "CEO",
    company: "TechStartup India",
    avatar: "RS",
    content:
      "InQuo.site transformed our content workflow completely. We now produce 5x more content with half the team. The ROI has been incredible — we saved over ₹2,00,000 in the first quarter alone.",
    rating: 5,
    industry: "Technology",
    result: "5x content output",
    metric: "5×",
  },
  {
    id: "2",
    name: "Priya Patel",
    role: "Marketing Head",
    company: "E-commerce Co.",
    avatar: "PP",
    content:
      "The AI tools for ad copy and social media posts cut our campaign creation time from days to hours. Our conversion rates improved by 40% with AI-optimized content.",
    rating: 5,
    industry: "E-commerce",
    result: "40% higher conversions",
    metric: "+40%",
  },
  {
    id: "3",
    name: "Amit Verma",
    role: "Freelance Developer",
    company: "Self-employed",
    avatar: "AV",
    content:
      "Code Generator and Bug Fixer are absolute game changers. I complete projects 3x faster now and my clients are amazed at the turnaround time. Worth every rupee!",
    rating: 5,
    industry: "Freelancing",
    result: "3x faster delivery",
    metric: "3×",
  },
  {
    id: "4",
    name: "Sneha Gupta",
    role: "Content Manager",
    company: "Digital Agency",
    avatar: "SG",
    content:
      "Managing content for 20+ clients was overwhelming until we found InQuo. Our small team handles everything effortlessly now — the blog generator alone saves us 15 hours every week.",
    rating: 5,
    industry: "Digital Marketing",
    result: "15 hrs/week saved",
    metric: "15h",
  },
  {
    id: "5",
    name: "Vikram Singh",
    role: "Founder",
    company: "SaaS Startup",
    avatar: "VS",
    content:
      "From product descriptions to technical documentation, InQuo handles it all. We've cut content costs by 60% while keeping excellent quality. Highly recommended.",
    rating: 5,
    industry: "SaaS",
    result: "60% cost reduction",
    metric: "−60%",
  },
  {
    id: "6",
    name: "Ananya Reddy",
    role: "Creative Director",
    company: "Design Studio",
    avatar: "AR",
    content:
      "The Image AI tools are phenomenal. We create stunning visuals in minutes that would take hours in Photoshop. Our clients can't believe the speed and quality.",
    rating: 5,
    industry: "Design",
    result: "10x faster designs",
    metric: "10×",
  },
  {
    id: "7",
    name: "Karan Mehta",
    role: "SEO Specialist",
    company: "Growth Agency",
    avatar: "KM",
    content:
      "InQuo's SEO content tools helped us rank 50+ keywords on page 1 for our clients. The meta-description and blog optimization features are incredibly powerful.",
    rating: 5,
    industry: "SEO",
    result: "50+ #1 rankings",
    metric: "50+",
  },
];

export function TestimonialsCarousel() {
  const [active, setActive] = useState(0);
  const current = testimonials[active];

  // Auto-rotate spotlight
  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="relative py-24 px-4 overflow-hidden bg-background"
      aria-labelledby="testimonials-heading"
    >
      {/* Decorative grid + diagonal accent */}
      <div className="absolute inset-0 ns-grain opacity-[0.4] pointer-events-none" aria-hidden="true" />
      <div
        className="absolute -top-40 -right-32 w-[36rem] h-[36rem] rounded-full bg-primary/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -left-32 w-[30rem] h-[30rem] rounded-full bg-accent/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Header — editorial */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
          <div>
            <div className="text-xs font-display tracking-[0.3em] uppercase text-muted-foreground mb-4">
              <span className="text-primary">/</span> Customer stories
              <span className="text-primary"> /</span> 010
            </div>
            <h2
              id="testimonials-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-tighter leading-[1.05]"
            >
              Real results from
              <br />
              <span className="italic font-script text-primary">real businesses.</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            10,000+ teams across India ship faster with InQuo.site — read what they say in their own words.
          </p>
        </div>

        {/* Main grid: spotlight + selector list */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Spotlight quote */}
          <article
            key={current.id}
            className="lg:col-span-7 relative animate-fade-in"
          >
            <div className="relative rounded-3xl border border-border bg-card/60 backdrop-blur-md p-8 sm:p-12 overflow-hidden group">
              {/* Diagonal slash accents */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />
              <Quote className="absolute -top-2 -left-2 w-32 h-32 text-primary/5" strokeWidth={1} />

              {/* Massive metric */}
              <div className="flex items-start justify-between gap-6 mb-8">
                <div className="flex items-center gap-1">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                  <span className="ml-3 text-xs font-mono text-muted-foreground">
                    {current.industry}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-display text-5xl sm:text-7xl tracking-tighter leading-none text-primary">
                    {current.metric}
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2 font-display">
                    {current.result}
                  </div>
                </div>
              </div>

              {/* Big quote */}
              <blockquote className="font-display text-2xl sm:text-3xl lg:text-4xl leading-snug tracking-tight text-foreground mb-10">
                <span className="text-primary mr-1">“</span>
                {current.content}
                <span className="text-primary ml-1">”</span>
              </blockquote>

              {/* Author */}
              <footer className="flex items-center gap-4 pt-6 border-t border-border/60">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg">
                  {current.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base">{current.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {current.role} <span className="text-primary">/</span> {current.company}
                  </p>
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  {String(active + 1).padStart(2, "0")}
                  <span className="text-primary mx-1">/</span>
                  {String(testimonials.length).padStart(2, "0")}
                </div>
              </footer>
            </div>
          </article>

          {/* Selector list */}
          <aside className="lg:col-span-5">
            <div className="text-xs font-display tracking-[0.3em] uppercase text-muted-foreground mb-4">
              <span className="text-primary">/</span> Browse stories
            </div>
            <ul className="space-y-1">
              {testimonials.map((t, i) => {
                const isActive = i === active;
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => setActive(i)}
                      className={cn(
                        "w-full text-left group flex items-center gap-4 py-3 px-4 rounded-xl border transition-all duration-300",
                        isActive
                          ? "border-primary/60 bg-primary/5"
                          : "border-transparent hover:border-border hover:bg-card/40"
                      )}
                      aria-pressed={isActive}
                    >
                      <span
                        className={cn(
                          "text-xs font-mono w-7 shrink-0 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground/60"
                        )}
                      >
                        0{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span
                            className={cn(
                              "font-display text-base tracking-tight transition-colors",
                              isActive ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                            )}
                          >
                            {t.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            <span className="text-primary mx-1">/</span>
                            {t.company}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground italic font-script truncate">
                          “{t.content.split(".")[0]}.”
                        </div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 font-display text-sm tracking-tight transition-all",
                          isActive ? "text-primary" : "text-muted-foreground/40 group-hover:text-primary"
                        )}
                      >
                        {t.metric}
                      </span>
                      <ArrowUpRight
                        className={cn(
                          "w-4 h-4 shrink-0 transition-all",
                          isActive
                            ? "opacity-100 text-primary translate-x-0"
                            : "opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0"
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Auto-progress bar */}
            <div className="mt-6 h-px bg-border relative overflow-hidden">
              <div
                key={active}
                className="absolute inset-y-0 left-0 bg-primary"
                style={{ animation: "ns-progress 6s linear forwards" }}
              />
            </div>
          </aside>
        </div>

        {/* Scrolling marquee strip of micro-quotes */}
        <div className="mt-16 border-y border-border/60 py-5 overflow-hidden">
          <div className="flex gap-12 animate-[ns-marquee_40s_linear_infinite] whitespace-nowrap">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={`${t.id}-${i}`}
                className="flex items-center gap-3 text-sm shrink-0"
              >
                <span className="font-display text-primary">{t.metric}</span>
                <span className="text-muted-foreground italic font-script">
                  {t.result}
                </span>
                <span className="text-xs text-muted-foreground/60 font-mono">
                  — {t.name}, {t.company}
                </span>
                <span className="text-primary text-lg ml-6">/</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ns-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes ns-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
