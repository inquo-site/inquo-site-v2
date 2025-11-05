import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Sparkles, Code2, Palette, TrendingUp, GraduationCap, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Landing = () => {
  const [toolsCount, setToolsCount] = useState<number>(160);
  const [freeTools, setFreeTools] = useState<number>(12);
  const [premiumTools, setPremiumTools] = useState<number>(148);
  const categories = [
    { icon: Sparkles, name: "Writing & Content", count: "35+ tools" },
    { icon: Code2, name: "Coding & Dev", count: "30+ tools" },
    { icon: Palette, name: "Design & Creative", count: "25+ tools" },
    { icon: TrendingUp, name: "Marketing", count: "25+ tools" },
    { icon: GraduationCap, name: "Education", count: "20+ tools" },
    { icon: Zap, name: "Productivity", count: "25+ tools" },
  ];

  useEffect(() => {
    const getCount = async () => {
      const { count } = await supabase.from('tools').select('*', { count: 'exact', head: true });
      if (typeof count === 'number') setToolsCount(count);
      
      const { data: tools } = await supabase.from('tools').select('is_premium');
      if (tools) {
        const free = tools.filter(t => !t.is_premium).length;
        const premium = tools.filter(t => t.is_premium).length;
        setFreeTools(free);
        setPremiumTools(premium);
      }
    };
    getCount();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card text-sm font-medium">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>{toolsCount}+ AI Tools ({freeTools} Free + {premiumTools} Premium)</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Your Complete
              <span className="text-gradient"> AI Toolkit</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your workflow with InQuo.site — access premium AI tools for writing, coding, design, marketing, and productivity. All in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 h-14 bg-accent hover:bg-accent/90 text-accent-foreground">
                  Start Free
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>

          {/* Category Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Card
                key={index}
                className="glass-card p-6 hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <category.icon className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose InQuo?</h2>
            <p className="text-xl text-muted-foreground">Everything you need to supercharge your productivity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">Get instant results with our optimized AI models</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">Powered by GPT-4 and latest AI models</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Always Growing</h3>
              <p className="text-muted-foreground">New tools added every month</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of creators, developers, and marketers using InQuo.site
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 h-14 bg-accent hover:bg-accent/90 text-accent-foreground">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">InQuo.site</h3>
              <p className="text-sm text-muted-foreground">Your complete AI toolkit for productivity</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link to="/dashboard" className="hover:text-foreground">Tools</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 InQuo.site. All rights reserved.</p>
            <p className="mt-2">Purnea, Bihar, India | inquo4@gmail.com | 8002551361</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
