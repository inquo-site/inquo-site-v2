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
  Zap, Lock, ArrowRight, Star, Users, Rocket
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
      description: "Generate content, fix grammar, summarize"
    },
    { 
      id: "design", 
      name: "Image AI", 
      icon: Palette, 
      color: "from-purple-500 to-pink-500",
      description: "Create images, edit photos, design graphics"
    },
    { 
      id: "coding", 
      name: "Code AI", 
      icon: Code2, 
      color: "from-green-500 to-emerald-500",
      description: "Generate code, debug, optimize"
    },
    { 
      id: "marketing", 
      name: "Marketing AI", 
      icon: TrendingUp, 
      color: "from-orange-500 to-red-500",
      description: "Ads copy, SEO, social media content"
    },
  ];

  const stats = [
    { icon: Rocket, label: "AI Tools", value: `${toolsCount}+` },
    { icon: Users, label: "Free Tools", value: `${freeTools}+` },
    { icon: Star, label: "Categories", value: "4" },
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background animate-gradient-shift bg-300%" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center animate-fade-in">
            <Badge className="mb-6 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              160+ AI Tools in One Platform
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Explore 160+ Free & Premium
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-orange-500 bg-clip-text text-transparent">
                AI Tools
              </span>{" "}
              — Text, Image, Code & More
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              All AI tools in one place. Fast, powerful and easy to use.
              Transform your workflow with cutting-edge AI technology.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search any AI tool..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-14 text-lg rounded-full border-2 focus:border-accent"
                />
              </div>
            </form>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button asChild size="lg" className="text-lg px-8 h-12 rounded-full">
                <Link to="/dashboard">
                  Explore All Tools
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 h-12 rounded-full">
                <Link to="/dashboard">Browse Categories</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="glass-card p-6 rounded-xl animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Explore by Category
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our carefully organized AI tool categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainCategories.map((category, index) => (
              <Link 
                key={category.id} 
                to={`/dashboard?category=${category.id}`}
                className="group"
              >
                <Card className="p-6 h-full hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-accent animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <category.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Tools */}
      {trendingTools.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                  🔥 Trending AI Tools
                </h2>
                <p className="text-lg text-muted-foreground">
                  Most popular tools used by our community
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/dashboard">View All</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingTools.map((tool, index) => {
                const path = tool.route_path || `/tool/${tool.tool_type}`;
                return (
                  <Link key={tool.id} to={path}>
                    <Card className="p-6 h-full hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-xl animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Sparkles className="w-6 h-6 text-accent" />
                        {tool.badge && (
                          <Badge variant={tool.badge === 'free' ? 'outline' : 'default'}>
                            {tool.badge === 'free' ? '🆓 Free' : '⭐ Premium'}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-bold mb-2">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {tool.description}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
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

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose Inquo.Site?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to supercharge your productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Get instant results with our optimized AI models
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your data is encrypted and never shared
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <Star className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">
                Access the best AI models and tools available
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 bg-gradient-to-br from-primary to-accent text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of users already using Inquo.Site
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 h-12">
                <Link to="/auth">Start Free Trial</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 h-12 bg-white/10 hover:bg-white/20 text-white border-white/30">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
