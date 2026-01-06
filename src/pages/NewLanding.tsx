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
import { ReviewsSection } from "@/components/ReviewsSection";
import { InternalLinking } from "@/components/InternalLinking";
import { useABTest } from "@/hooks/useABTesting";
import { 
  Sparkles, Code2, Palette, TrendingUp, Search, 
  Zap, Shield, ArrowRight, Star, Users, Rocket,
  CheckCircle, Clock, Globe, Award, Heart, Target,
  Building2, Briefcase, UserCheck, BadgeCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function NewLanding() {
  const [searchQuery, setSearchQuery] = useState("");
  const [toolsCount, setToolsCount] = useState(0);
  const [freeTools, setFreeTools] = useState(0);
  const [trendingTools, setTrendingTools] = useState<any[]>([]);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  
  // A/B Testing hooks
  const heroCTA = useABTest('hero_cta');
  const ctaColor = useABTest('cta_color');

  useEffect(() => {
    fetchStats();
    fetchTrendingTools();
    
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

      {/* Hero Section - B2B Focused */}
      <section className="relative pt-28 pb-24 px-4 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            {/* No Hidden Charges Badge */}
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6 animate-fade-in border-2 border-green-500/30">
              <BadgeCheck className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                ✓ No Hidden Charges • 7-Day Free Trial • Cancel Anytime
              </span>
            </div>
            
            {/* Main Headline - B2B */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight animate-fade-in">
              All-in-One AI Automation
              <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-accent via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  Platform for Businesses
                </span>
              </span>
            </h1>
            
            {/* Sub-headline */}
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
              160+ AI tools for content, code, design & marketing. 
              <span className="text-foreground font-medium"> Trusted by 10,000+ agencies, freelancers & startups</span>. 
              Save 20+ hours every week.
            </p>

            {/* CTAs - B2B focused with A/B Testing */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <Button 
                asChild 
                size="lg" 
                className={`text-lg px-10 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all group ${
                  ctaColor.variant === 'gradient' 
                    ? 'bg-gradient-to-r from-accent to-orange-500 hover:from-accent/90 hover:to-orange-500/90' 
                    : 'bg-accent hover:bg-accent/90'
                }`}
                onClick={handleCTAClick}
              >
                <Link to="/dashboard">
                  {heroCTA.variant === 'try_now' ? 'Try Now Free' : 'Start Free Trial'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-10 h-14 rounded-xl border-2">
                <Link to="/pricing">
                  Buy Business Plan
                  <Building2 className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>


            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="glass-card p-5 rounded-2xl animate-slide-up hover:scale-105 transition-transform"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <stat.icon className={`w-7 h-7 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Banner */}
      <section className="py-6 bg-muted/50 border-y border-border overflow-hidden">
        <div className="flex animate-scroll whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-6">
              <span className="text-muted-foreground font-medium">Trusted by:</span>
              <span className="font-bold text-lg">Agencies</span>
              <span className="font-bold text-lg">Startups</span>
              <span className="font-bold text-lg">Freelancers</span>
              <span className="font-bold text-lg">E-commerce</span>
              <span className="font-bold text-lg">SaaS Companies</span>
            </div>
          ))}
        </div>
      </section>

      {/* Why Businesses Choose InQuo */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-1">For Businesses</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Why Businesses Choose <span className="text-gradient">InQuo.Site</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed specifically for teams and businesses who need reliable AI automation at scale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyBusinessesChoose.map((item, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/30 group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <item.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-1">4 Categories</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              One Platform, <span className="text-gradient">Endless Possibilities</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our carefully organized AI tool categories — each packed with powerful tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainCategories.map((category, index) => (
              <Link 
                key={category.id} 
                to={`/dashboard?category=${category.id}`}
                className="group"
              >
                <Card className="p-8 h-full hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-accent hover:shadow-xl animate-scale-in relative overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${category.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
                  
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold group-hover:text-accent transition-colors">
                      {category.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs">{category.tools}</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center text-accent font-medium text-sm group-hover:gap-2 transition-all">
                    Explore tools <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Tools */}
      {trendingTools.length > 0 && (
        <section className="py-24 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
              <div>
                <Badge className="mb-4 px-4 py-1" variant="secondary">🔥 Popular Tools</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                  Try These Free Tools
                </h2>
                <p className="text-lg text-muted-foreground">
                  No login required for free tools — start using instantly
                </p>
              </div>
              <Button asChild variant="outline" size="lg">
                <Link to="/dashboard">
                  View All 160+ Tools
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingTools.map((tool, index) => {
                const path = tool.route_path || `/tool/${tool.tool_type}`;
                return (
                  <Link key={tool.id} to={path}>
                    <Card className="p-6 h-full hover:scale-[1.02] transition-all duration-300 cursor-pointer hover:shadow-xl border-2 hover:border-accent/50 animate-fade-in group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                          <Sparkles className="w-6 h-6 text-accent" />
                        </div>
                        <Badge variant={tool.is_free_tool ? 'outline' : 'default'} className="font-medium">
                          {tool.is_free_tool ? '🆓 Free' : '⭐ Pro'}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground mb-5 line-clamp-2">
                        {tool.description}
                      </p>
                      <Button variant="outline" size="sm" className="w-full group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-colors">
                        Try Now <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Card>
                  </Link>
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
      
      {/* Reviews Section */}
      <ReviewsSection />

      {/* Referral Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-accent/10 via-background to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 px-4 py-1 bg-accent/20 text-accent border-accent/30">Referral Program</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Invite & Earn <span className="text-accent">20% Commission</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Share InQuo.Site with your network and earn 20% lifetime commission on every referral. 
            No limits, no caps — grow your passive income!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
              <Link to="/auth">
                Join Referral Program
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/pricing">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Automate Your Business?</h3>
            <p className="text-lg mb-8 opacity-90">
              Join 10,000+ businesses already saving 20+ hours every week with InQuo.Site
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                asChild 
                size="lg" 
                variant="secondary" 
                className="text-lg px-10 h-14"
                onClick={handleCTAClick}
              >
                <Link to="/dashboard">
                  {heroCTA.variant === 'try_now' ? 'Try Now Free' : 'Start Free Trial'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-10 h-14 bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link to="/pricing">
                  View Business Plans
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm opacity-75">
              ✓ 7-day free trial • ✓ No credit card required • ✓ Cancel anytime
            </p>
          </Card>
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