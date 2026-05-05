import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmailPopup } from "@/components/EmailPopup";
import { SEOHead } from "@/components/SEOHead";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { ValueProposition } from "@/components/ValueProposition";

import { InternalLinking } from "@/components/InternalLinking";
import { useABTest } from "@/hooks/useABTesting";
import { NSCta } from "@/components/ns/NSCta";
import { Reveal } from "@/components/ns/Reveal";
import { NSBackdrop } from "@/components/ns/NSBackdrop";
import { 
  Sparkles, Code2, Palette, TrendingUp, Search, 
  Zap, Shield, ArrowRight, Star, Users, Rocket,
  CheckCircle, Clock, Globe, Award, Heart, Target,
  Building2, Briefcase, UserCheck, BadgeCheck, Bot,
  Headphones, FileText, Scale, Wrench, DollarSign, Pen, BarChart, Package
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function NewLanding() {
  const [searchQuery, setSearchQuery] = useState("");
  const [toolsCount, setToolsCount] = useState(0);
  const [freeTools, setFreeTools] = useState(0);
  const [trendingTools, setTrendingTools] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  
  // A/B Testing hooks
  const heroCTA = useABTest('hero_cta');
  const ctaColor = useABTest('cta_color');

  useEffect(() => {
    fetchStats();
    fetchTrendingTools();
    fetchAgents();
    
    // Show email popup after 5 seconds
    const timer = setTimeout(() => {
      const hasSeenPopup = localStorage.getItem('inquo_email_popup_seen');
      if (!hasSeenPopup) {
        setShowEmailPopup(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchStats = async () => {
    const { count: total } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true });
    
    const { count: free } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true })
      .eq('is_free_tool', true);

    setToolsCount(total || 0);
    setFreeTools(free || 0);
  };

  const fetchTrendingTools = async () => {
    const { data } = await supabase
      .from('tools')
      .select('id, name, description, category, badge, route_path, tool_type, is_free_tool')
      .limit(6);
    
    setTrendingTools(data || []);
  };

  const fetchAgents = async () => {
    const { data } = await supabase
      .from('ai_agents')
      .select('id, name, description, category, icon, is_premium, monthly_price, usd_monthly_price')
      .eq('is_active', true)
      .order('display_order')
      .limit(6);
    setAgents(data || []);
  };

  const agentIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Bot, Headphones, Target, Search: Search as any, TrendingUp, FileText, Users, Scale,
    Wrench, DollarSign, Pen, BarChart, Package
  };

  const mainCategories = [
    { 
      id: "writing", 
      name: "Text AI", 
      icon: Sparkles, 
      color: "from-blue-500 to-cyan-500",
      description: "Generate content, fix grammar, summarize",
      tools: "50+"
    },
    { 
      id: "design", 
      name: "Image AI", 
      icon: Palette, 
      color: "from-purple-500 to-pink-500",
      description: "Create images, edit photos, design graphics",
      tools: "35+"
    },
    { 
      id: "coding", 
      name: "Code AI", 
      icon: Code2, 
      color: "from-green-500 to-emerald-500",
      description: "Generate code, debug, optimize",
      tools: "40+"
    },
    { 
      id: "marketing", 
      name: "Marketing AI", 
      icon: TrendingUp, 
      color: "from-orange-500 to-red-500",
      description: "Ads copy, SEO, social media content",
      tools: "35+"
    },
  ];

  const stats = [
    { icon: Rocket, label: "AI Tools", value: "160+", color: "text-accent" },
    { icon: Users, label: "Active Businesses", value: "10K+", color: "text-blue-500" },
    { icon: Star, label: "5-Star Reviews", value: "5K+", color: "text-yellow-500" },
    { icon: Globe, label: "Countries", value: "50+", color: "text-green-500" },
  ];

  const whyBusinessesChoose = [
    {
      icon: Building2,
      title: "Built for Teams",
      description: "Multi-user access, shared workspaces, and team collaboration features designed for business workflows.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption, GDPR compliant, and we never store or share your proprietary content.",
    },
    {
      icon: Zap,
      title: "10x Faster Output",
      description: "Automate repetitive tasks. Generate content, code, and designs in seconds, not hours.",
    },
    {
      icon: BadgeCheck,
      title: "No Hidden Charges",
      description: "Transparent pricing. What you see is what you pay. No surprise fees, ever.",
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/dashboard?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleClosePopup = () => {
    setShowEmailPopup(false);
    localStorage.setItem('inquo_email_popup_seen', 'true');
  };

  // Track CTA clicks for A/B testing
  const handleCTAClick = () => {
    heroCTA.trackEvent('cta_clicked');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="160+ Free AI Tools for Writing, Images, Coding & More"
        description="Use 160+ AI tools in one platform. Text, image, code, business, and marketing tools. Fast, powerful and free to try. Trusted by 10,000+ businesses worldwide."
        keywords="AI tools, free AI website, text generator, image AI, code AI generator, AI platform, chatgpt alternative, free ai tools, ai writing tools, ai image generator, Inquo.site, AI automation"
        canonicalUrl="https://inquo.site"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Inquo.Site",
          applicationCategory: "ProductivityApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "5000",
          },
        }}
      />
      <Navbar />

      {/* Hero — Never Settle inspired */}
      <section className="relative pt-36 pb-28 px-4 overflow-hidden bg-background">
        <NSBackdrop intensity="hero" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Eyebrow */}
          <Reveal immediate>
            <div className="flex items-center gap-3 mb-10 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              <span className="h-px w-10 bg-primary/60" />
              Creative AI &amp; Automation Platform
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-12 gap-10 items-end">
            {/* Headline */}
            <div className="lg:col-span-8">
              <Reveal immediate delay={80}>
                <h1 className="font-display text-[3rem] sm:text-[4.5rem] lg:text-[6.5rem] leading-[0.95] tracking-[-0.04em] text-foreground">
                  Building <span className="font-script text-primary">Brands</span>
                  <br />
                  That <span className="italic font-light">Move</span> The
                  <br />
                  <span className="ns-shimmer-text">World With AI</span>
                </h1>
              </Reveal>

              <Reveal delay={250}>
                <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-base sm:text-lg text-muted-foreground">
                  <span>On Time</span>
                  <span className="text-primary/70">/</span>
                  <span>On Budget</span>
                  <span className="text-primary/70">/</span>
                  <span className="text-foreground">Never Settle</span>
                </div>
              </Reveal>

              <Reveal delay={380}>
                <p className="mt-8 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                  160+ AI tools and autonomous agents for content, code, design and marketing.
                  Trusted by 10,000+ teams to ship faster — without compromise.
                </p>
              </Reveal>

              <Reveal delay={500}>
                <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <NSCta to="/dashboard" size="lg" variant="solid" onClick={handleCTAClick}>
                    Start Free Trial
                  </NSCta>
                  <NSCta to="/pricing" size="lg" variant="outline">
                    Upgrade to Pro
                  </NSCta>
                </div>
              </Reveal>
            </div>

            {/* Side review card */}
            <div className="lg:col-span-4">
              <Reveal delay={600}>
                <div className="ns-lift relative rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6">
                  <div className="flex gap-1 mb-3 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    "Super communicative and easy to work with. InQuo hit the ground running and changed how our team ships."
                  </p>
                  <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                    Jason Theraube <span className="text-primary mx-1">/</span> Selfbook
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Stats strip */}
          <Reveal delay={720}>
            <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 border-y border-border divide-x divide-border">
              {stats.map((stat, index) => (
                <div key={index} className="px-6 py-8 text-center sm:text-left">
                  <div className="font-display text-3xl sm:text-4xl text-foreground mb-1">{stat.value}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Trusted by — refined marquee */}
      <section className="py-10 border-y border-border overflow-hidden bg-background">
        <div className="flex items-center gap-16">
          <div className="shrink-0 pl-6 text-xs uppercase tracking-[0.3em] text-muted-foreground">Trusted by</div>
          <div className="flex ns-marquee whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-16 pr-16 text-2xl font-display tracking-tight text-foreground/40">
                <span>Agencies</span><span className="text-primary/60">/</span>
                <span>Startups</span><span className="text-primary/60">/</span>
                <span>Freelancers</span><span className="text-primary/60">/</span>
                <span>E-commerce</span><span className="text-primary/60">/</span>
                <span>SaaS</span><span className="text-primary/60">/</span>
                <span>Enterprises</span><span className="text-primary/60">/</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Businesses Choose InQuo */}
      <section className="relative py-28 px-4 overflow-hidden">
        <NSBackdrop intensity="subtle" />
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal>
            <div className="mb-16 max-w-3xl">
              <div className="text-xs uppercase tracking-[0.25em] text-primary mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-primary/60" /> For Businesses
              </div>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-[-0.035em] text-foreground leading-[1]">
                Why teams choose <span className="font-script text-primary">InQuo</span>
              </h2>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl">
                Designed for teams that need reliable AI automation at scale — without the bloat.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {whyBusinessesChoose.map((item, index) => (
              <Reveal key={index} delay={index * 100}>
                <div className="ns-lift bg-card p-8 h-full group">
                  <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center mb-6 group-hover:border-primary/60 group-hover:bg-primary/5 transition-colors">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-xl mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative py-28 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
              <div className="max-w-3xl">
                <div className="text-xs uppercase tracking-[0.25em] text-primary mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-primary/60" /> Capabilities
                </div>
                <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-[-0.035em] leading-[1]">
                  One platform.
                  <br />
                  <span className="font-script text-primary">Endless</span> possibilities.
                </h2>
              </div>
              <p className="text-muted-foreground max-w-sm">
                Carefully organized AI categories — each packed with powerful, production-grade tools.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {mainCategories.map((category, index) => (
              <Reveal key={category.id} delay={index * 100}>
                <Link to={`/dashboard?category=${category.id}`} className="group block h-full">
                  <div className="ns-lift relative h-full p-8 rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center mb-6 group-hover:border-primary/60 transition-colors">
                        <category.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display text-2xl tracking-tight">{category.name}</h3>
                        <span className="text-xs text-primary/80">/{category.tools}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                        {category.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-foreground ns-link">
                        Explore <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Tools */}
      {trendingTools.length > 0 && (
        <section className="relative py-28 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-6">
                <div className="max-w-2xl">
                  <div className="text-xs uppercase tracking-[0.25em] text-primary mb-5 flex items-center gap-3">
                    <span className="h-px w-8 bg-primary/60" /> Popular Tools
                  </div>
                  <h2 className="font-display text-4xl sm:text-5xl tracking-[-0.035em] leading-[1]">
                    Try these <span className="font-script text-primary">free</span> tools
                  </h2>
                  <p className="mt-5 text-muted-foreground">No login required — start using instantly.</p>
                </div>
                <NSCta to="/dashboard" variant="outline">View All 160+ Tools</NSCta>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {trendingTools.map((tool, index) => {
                const path = tool.route_path || `/tool/${tool.tool_type}`;
                return (
                  <Reveal key={tool.id} delay={index * 80}>
                    <Link to={path} className="group block h-full">
                      <div className="ns-lift relative h-full p-7 rounded-2xl border border-border bg-card overflow-hidden">
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-11 h-11 rounded-xl border border-border flex items-center justify-center group-hover:border-primary/60 transition-colors">
                            <Sparkles className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {tool.is_free_tool ? 'Free' : 'Pro'}
                          </span>
                        </div>
                        <h3 className="font-display text-xl mb-2 tracking-tight group-hover:text-primary transition-colors">{tool.name}</h3>
                        <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                          {tool.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm ns-link">
                          Try Now <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* AI Agents Section */}
      {agents.length > 0 && (
        <section className="relative py-28 px-4 overflow-hidden">
          <NSBackdrop intensity="subtle" />
          <div className="max-w-7xl mx-auto relative z-10">
            <Reveal>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-6">
                <div className="max-w-2xl">
                  <div className="text-xs uppercase tracking-[0.25em] text-primary mb-5 flex items-center gap-3">
                    <span className="h-px w-8 bg-primary/60" /> AI Agents
                  </div>
                  <h2 className="font-display text-4xl sm:text-5xl tracking-[-0.035em] leading-[1]">
                    Agents that <span className="font-script text-primary">do real work</span>
                  </h2>
                  <p className="mt-5 text-muted-foreground">
                    Autonomous AI workers that ship complete deliverables for your team.
                  </p>
                </div>
                <NSCta to="/agents" variant="outline">View All Agents</NSCta>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {agents.map((agent, index) => {
                const AgentIcon = agentIconMap[agent.icon] || Bot;
                const isINR = !localStorage.getItem("selectedCountry") || localStorage.getItem("selectedCountry") === "IN";
                const price = isINR ? agent.monthly_price : agent.usd_monthly_price;
                const symbol = isINR ? "₹" : "$";
                const isFree = price === 0;

                return (
                  <Reveal key={agent.id} delay={index * 80}>
                    <Link to="/agents" className="group block h-full">
                      <div className="ns-lift relative h-full p-7 rounded-2xl border border-border bg-card overflow-hidden">
                        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative">
                          <div className="flex items-start justify-between mb-6">
                            <div className="w-11 h-11 rounded-xl border border-border flex items-center justify-center group-hover:border-primary/60 transition-colors">
                              <AgentIcon className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              {isFree ? 'Free' : `${symbol}${price?.toLocaleString()}/mo`}
                            </span>
                          </div>
                          <h3 className="font-display text-xl mb-2 tracking-tight group-hover:text-primary transition-colors">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">{agent.description}</p>
                          <div className="flex items-center gap-2 text-sm ns-link">
                            <Briefcase className="w-4 h-4" /> Start Work
                            <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-500 group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Carousel */}
      <TestimonialsCarousel />
      
      {/* Value Proposition */}
      <ValueProposition />
      
      {/* Referral Section */}
      <section className="relative py-28 px-4 overflow-hidden">
        <NSBackdrop intensity="subtle" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Reveal>
            <div className="text-xs uppercase tracking-[0.25em] text-primary mb-5">Referral Program</div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-[-0.035em] leading-[1] mb-6">
              Invite &amp; earn <span className="font-script text-primary">20%</span> commission
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Share InQuo.Site with your network and earn 20% lifetime commission. No caps, no limits.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <NSCta to="/auth" size="lg">Join Referral Program</NSCta>
              <NSCta to="/pricing" size="lg" variant="outline">Learn More</NSCta>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA Section — Never Settle big-statement */}
      <section className="relative py-32 px-4 overflow-hidden bg-background">
        <NSBackdrop intensity="hero" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Reveal>
            <h3 className="font-display text-4xl sm:text-6xl lg:text-7xl tracking-[-0.04em] leading-[0.95] mb-6">
              Ready to <span className="font-script text-primary">automate</span>
              <br /> your business?
            </h3>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Join 10,000+ teams already saving 20+ hours a week with InQuo.
            </p>
          </Reveal>
          <Reveal delay={280}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <NSCta to="/dashboard" size="lg" onClick={handleCTAClick}>
                Start Free Trial
              </NSCta>
              <NSCta to="/pricing" size="lg" variant="outline">
                Upgrade to Pro
              </NSCta>
            </div>
            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              7-day trial <span className="text-primary mx-2">/</span> No card required <span className="text-primary mx-2">/</span> Cancel anytime
            </p>
          </Reveal>
        </div>
      </section>

      {/* Internal Linking Section */}
      <InternalLinking />

      <Footer />
      
      {/* Email Popup */}
      <EmailPopup isOpen={showEmailPopup} onClose={handleClosePopup} />
    </div>
  );
}