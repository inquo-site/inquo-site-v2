import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Code2, Palette, TrendingUp, GraduationCap, Zap, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PremiumModal } from "@/components/PremiumModal";
import { TopBar } from "@/components/TopBar";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  is_premium?: boolean | null;
  route_path?: string | null;
  tool_type?: string | null;
  badge?: string | null;
}


const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>("");
  const { profile } = useAuth();

  const categories = [
    { id: "all", name: "All Tools", icon: Sparkles, color: "text-primary" },
    { id: "writing", name: "Writing & Content", icon: Sparkles, color: "text-blue-500" },
    { id: "coding", name: "Coding & Dev", icon: Code2, color: "text-green-500" },
    { id: "design", name: "Design & Creative", icon: Palette, color: "text-purple-500" },
    { id: "marketing", name: "Marketing", icon: TrendingUp, color: "text-orange-500" },
    { id: "education", name: "Education", icon: GraduationCap, color: "text-pink-500" },
    { id: "productivity", name: "Productivity", icon: Zap, color: "text-yellow-500" },
  ];

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tools"
      });
    } else {
      setTools(data || []);
    }
    setLoading(false);
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const canAccessTool = (tool: Tool) => {
    if (!tool.is_premium) return true;
    if (!profile) return false;
    return ['pro', 'yearly', 'lifetime'].includes(profile.plan);
  };

  const handleToolClick = (tool: Tool, e: React.MouseEvent) => {
    if (tool.is_premium && !canAccessTool(tool)) {
      e.preventDefault();
      setSelectedTool(tool.name);
      setPremiumModalOpen(true);
    }
  };

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return tools.length;
    return tools.filter(t => t.category === categoryId).length;
  };

  return (
    <>
      <SEOHead
        title="AI Tools Dashboard - 160+ Productivity Tools"
        description="Access 160+ AI-powered tools for writing, coding, design, and marketing. Text generators, image AI, code assistants, and more. Start free today."
        keywords="AI tools dashboard, AI productivity tools, text generator, code generator, image AI, marketing AI tools"
        canonicalUrl="https://inquo.site/dashboard"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "AI Tools Dashboard",
          description: "160+ AI-powered productivity tools",
          url: "https://inquo.site/dashboard",
          numberOfItems: tools.length,
        }}
      />
      <TopBar />
      <main className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-2">AI Tools Dashboard</h1>
            <p className="text-muted-foreground">
              {profile?.plan === 'free' ? 
                `Access 10 free tools or upgrade to unlock all ${tools.length}+ premium tools` : 
                `Enjoy unlimited access to all ${tools.length}+ AI tools`
              }
            </p>
          </header>

          {/* Upgrade Banner for Free Users */}
          {profile?.plan === 'free' && (
            <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-1">Unlock {tools.length}+ Premium Tools 🚀</h2>
                  <p className="text-sm text-muted-foreground">
                    Get unlimited access, more credits, and premium AI models
                  </p>
                </div>
                <Button onClick={() => setPremiumModalOpen(true)} size="lg">
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}

          {/* Search */}
          <section className="mb-8" aria-label="Search tools">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search for tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
                aria-label="Search AI tools"
              />
            </div>
          </section>

          {/* Categories */}
          <section className="mb-12" aria-label="Tool categories">
            <h2 className="text-2xl font-semibold mb-4">Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className={`glass-card p-4 cursor-pointer hover:scale-105 transition-transform ${
                    selectedCategory === category.id ? 'border-primary border-2' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedCategory === category.id}
                >
                  <category.icon className={`w-8 h-8 mb-2 ${category.color}`} aria-hidden="true" />
                  <h3 className="font-semibold text-sm">{category.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{getCategoryCount(category.id)} tools</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Tools Grid */}
          <section aria-label="AI tools list">
            <h2 className="text-2xl font-semibold mb-4">
              {selectedCategory === "all" ? "All Tools" : 
               categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" role="status" aria-label="Loading tools"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map((tool) => {
                  const isAccessible = canAccessTool(tool);
                  const isPremium = tool.is_premium;
                  const path = tool.route_path && tool.route_path.trim() ? tool.route_path : `/tool/${tool.tool_type}`;
                  
                  return (
                    <article key={tool.id}>
                      <Link 
                        to={isAccessible ? path : '#'}
                        onClick={(e) => handleToolClick(tool, e)}
                        aria-label={`${tool.name} - ${isAccessible ? 'Open tool' : 'Unlock premium'}`}
                      >
                        <Card className={`glass-card p-6 cursor-pointer hover:scale-105 transition-transform h-full relative ${
                          !isAccessible ? 'opacity-75' : ''
                        }`}>
                          {/* Premium Lock Badge */}
                          {isPremium && !isAccessible && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="absolute top-3 right-3 bg-yellow-500/20 backdrop-blur-sm p-2 rounded-full">
                                    <Lock className="w-4 h-4 text-yellow-600" aria-hidden="true" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Premium Access Required</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-semibold pr-8">{tool.name}</h3>
                            <Sparkles className="w-5 h-5 text-accent" aria-hidden="true" />
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant={tool.badge === 'free' ? 'outline' : 'default'}>
                              {tool.badge === 'free' && '🆓 Free'}
                              {tool.badge === 'premium' && '🔒 Premium'}
                              {tool.badge === 'new' && '⚡ New'}
                              {tool.badge === 'early_access' && '⚡ Early Access'}
                            </Badge>
                            
                            <Button 
                              variant={isAccessible ? "outline" : "secondary"} 
                              size="sm"
                            >
                              {isAccessible ? 'Try Now' : 'Unlock'}
                            </Button>
                          </div>
                        </Card>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <PremiumModal 
        open={premiumModalOpen} 
        onClose={() => setPremiumModalOpen(false)}
        toolName={selectedTool}
      />
    </>
  );
};

export default Dashboard;