import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Sparkles, Code2, Palette, TrendingUp, Search, 
  Zap, Shield, ArrowRight, Star, Users, Rocket,
  CheckCircle, Clock, Globe, Award, Heart, Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function NewLanding() {
  const [searchQuery, setSearchQuery] = useState("");
  const [toolsCount, setToolsCount] = useState(0);
  const [freeTools, setFreeTools] = useState(0);
  const [trendingTools, setTrendingTools] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchTrendingTools();
  }, []);

  const fetchStats = async () => {
    const { count: total } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true });
    
    const { count: free } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', false);

    setToolsCount(total || 0);
    setFreeTools(free || 0);
  };

  const fetchTrendingTools = async () => {
    const { data } = await supabase
      .from('tools')
      .select('id, name, description, category, badge, route_path, tool_type')
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
    { icon: Rocket, label: "AI Tools", value: `${toolsCount}+`, color: "text-accent" },
    { icon: Users, label: "Active Users", value: "50K+", color: "text-blue-500" },
    { icon: Star, label: "5-Star Reviews", value: "10K+", color: "text-yellow-500" },
    { icon: Globe, label: "Countries", value: "120+", color: "text-green-500" },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get high-quality AI outputs in seconds, not minutes. Our optimized models deliver faster than competitors.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption protects your data. We never store or share your content with third parties.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Target,
      title: "Precision Accuracy",
      description: "Our fine-tuned AI models deliver 98% accuracy. Get professional-grade results every time.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Heart,
      title: "Free Forever Plan",
      description: "Access 12+ essential AI tools completely free. No credit card required, no hidden fees.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Our AI never sleeps. Generate content, code, or images anytime, anywhere in the world.",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "Powered by GPT-4, Claude, and custom models. Get the best AI has to offer in one platform.",
      color: "from-accent to-red-400"
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Manager at TechCorp",
      avatar: "SC",
      content: "Inquo.site cut my content creation time by 80%. The blog generator alone is worth the subscription!",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Freelance Developer",
      avatar: "MJ", 
      content: "The code generator is incredibly accurate. It understands context better than any tool I've used.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      avatar: "ER",
      content: "We use 10+ tools daily for our campaigns. The ROI has been incredible - 5x our investment.",
      rating: 5
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/dashboard?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section - Redesigned */}
      <section className="relative pt-28 pb-24 px-4 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8 animate-fade-in">
              <div className="flex -space-x-2">
                {['SC', 'MJ', 'ER', 'AK'].map((initials, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground border-2 border-background">
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                Trusted by <span className="font-semibold text-foreground">50,000+</span> creators worldwide
              </span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight animate-fade-in">
              Stop Switching Between
              <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-accent via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  AI Tools Forever
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 4 100 4 150 6C200 8 250 4 298 10" stroke="hsl(var(--accent))" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            
            {/* Sub-headline */}
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
              160+ powerful AI tools for writing, images, code & marketing — 
              <span className="text-foreground font-medium"> all in one platform</span>. 
              Save 10+ hours every week.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <Input
                  type="text"
                  placeholder="Search any AI tool... (e.g., 'blog writer', 'image generator')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 pr-32 h-16 text-lg rounded-2xl border-2 border-border focus:border-accent shadow-lg bg-card"
                />
                <Button 
                  type="submit" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-12 px-6 rounded-xl"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Button asChild size="lg" className="text-lg px-10 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all group">
                <Link to="/dashboard">
                  Start Creating Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-10 h-14 rounded-xl border-2">
                <Link to="/pricing">
                  View Pricing
                  <span className="ml-2 text-sm bg-accent/10 text-accent px-2 py-0.5 rounded-full">Save 40%</span>
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
              <span className="text-muted-foreground font-medium">Featured on:</span>
              <span className="font-bold text-lg">Product Hunt</span>
              <span className="font-bold text-lg">TechCrunch</span>
              <span className="font-bold text-lg">TheNextWeb</span>
              <span className="font-bold text-lg">Hacker News</span>
              <span className="font-bold text-lg">AI Weekly</span>
            </div>
          ))}
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
                <Badge className="mb-4 px-4 py-1" variant="secondary">🔥 Hot Right Now</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                  Trending AI Tools
                </h2>
                <p className="text-lg text-muted-foreground">
                  The most popular tools used by our community this week
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
                        {tool.badge && (
                          <Badge variant={tool.badge === 'free' ? 'outline' : 'default'} className="font-medium">
                            {tool.badge === 'free' ? '🆓 Free' : '⭐ Premium'}
                          </Badge>
                        )}
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

      {/* Benefits Section - Redesigned */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-1">Why Inquo.Site</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Built for <span className="text-gradient">Serious Creators</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've obsessed over every detail so you can focus on what matters — creating amazing work
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/30 group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-1">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Loved by <span className="text-gradient">10,000+ Creators</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our users are saying about Inquo.Site
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="p-8 hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Redesigned */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <Card className="p-12 sm:p-16 bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/30 rounded-full blur-3xl" />
            
            <div className="relative z-10 text-center">
              <Badge className="mb-6 bg-white/20 text-white hover:bg-white/30 px-4 py-1">
                Limited Time Offer
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Start Creating with AI Today
              </h2>
              <p className="text-xl mb-4 opacity-90 max-w-2xl mx-auto">
                Join 50,000+ creators using Inquo.Site to save time and produce better work.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm mb-10 opacity-80">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> No credit card required</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 12+ free tools</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Cancel anytime</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" variant="secondary" className="text-lg px-10 h-14 font-semibold">
                  <Link to="/auth">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-10 h-14 bg-white/10 hover:bg-white/20 text-white border-white/30">
                  <Link to="/pricing">View All Plans</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
