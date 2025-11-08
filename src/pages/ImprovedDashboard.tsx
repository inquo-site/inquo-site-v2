import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles, Code2, Palette, TrendingUp, Filter, Zap, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PremiumModal } from "@/components/PremiumModal";
import { TopBar } from "@/components/TopBar";
import { toast } from "@/hooks/use-toast";

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

export default function ImprovedDashboard() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "all");
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>("");
  const { profile } = useAuth();

  const mainCategories = [
    { id: "all", name: "All Tools", icon: Sparkles, color: "text-primary", gradient: "from-blue-500 to-cyan-500" },
    { id: "writing", name: "Text AI", icon: Sparkles, color: "text-blue-500", gradient: "from-blue-500 to-cyan-500" },
    { id: "design", name: "Image AI", icon: Palette, color: "text-purple-500", gradient: "from-purple-500 to-pink-500" },
    { id: "coding", name: "Code AI", icon: Code2, color: "text-green-500", gradient: "from-green-500 to-emerald-500" },
    { id: "marketing", name: "Marketing & Other", icon: TrendingUp, color: "text-orange-500", gradient: "from-orange-500 to-red-500" },
  ];

  useEffect(() => {
    fetchTools();
  }, []);

  useEffect(() => {
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    if (search) setSearchQuery(search);
    if (category) setSelectedCategory(category);
  }, [searchParams]);

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

  // Remove duplicates based on name
  const uniqueTools = filteredTools.filter((tool, index, self) =>
    index === self.findIndex((t) => t.name === tool.name)
  );

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
    if (categoryId === "all") return uniqueTools.length;
    return uniqueTools.filter(t => t.category === categoryId).length;
  };

  const getTrendingTools = () => {
    return uniqueTools.slice(0, 6);
  };

  return (
    <>
      <TopBar />
      <div className="min-h-screen p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              AI Tools{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-muted-foreground">
              {profile?.plan === 'free' ? 
                `Access free tools or upgrade to unlock all ${tools.length}+ premium tools` : 
                `Enjoy unlimited access to all ${tools.length}+ AI tools`
              }
            </p>
          </div>

          {/* Upgrade Banner for Free Users */}
          {profile?.plan === 'free' && (
            <Card className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-accent/20 animate-slide-up">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    🚀 Unlock {tools.length}+ Premium Tools
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get unlimited access, more credits, and premium AI models
                  </p>
                </div>
                <Button onClick={() => setPremiumModalOpen(true)} size="lg" className="shrink-0">
                  Upgrade Now
                </Button>
              </div>
            </Card>
          )}

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-full"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-12">
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-transparent">
              {mainCategories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                >
                  <category.icon className={`w-4 h-4 mr-2 ${category.color}`} />
                  {category.name}
                  <Badge variant="secondary" className="ml-2">{getCategoryCount(category.id)}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tools Content */}
            <div className="mt-8">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : uniqueTools.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">No tools found matching your criteria</p>
                </div>
              ) : (
                <>
                  {/* Trending Section (only on "all" tab) */}
                  {selectedCategory === "all" && getTrendingTools().length > 0 && (
                    <div className="mb-12">
                      <h2 className="text-2xl font-bold mb-6 flex items-center">
                        🔥 Trending AI Tools
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getTrendingTools().map((tool, index) => {
                          const isAccessible = canAccessTool(tool);
                          const path = tool.route_path && tool.route_path.trim() 
                            ? tool.route_path 
                            : tool.tool_type 
                            ? `/tool/${tool.tool_type}`
                            : `/tool/${tool.name.toLowerCase().replace(/\s+/g, '-')}`;
                          
                          return (
                            <Link 
                              key={tool.id} 
                              to={isAccessible ? path : '#'}
                              onClick={(e) => handleToolClick(tool, e)}
                              className="animate-fade-in"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <Card className={`p-6 hover:scale-105 transition-all duration-300 h-full relative ${
                                !isAccessible ? 'opacity-75' : ''
                              }`}>
                                {tool.is_premium && !isAccessible && (
                                  <div className="absolute top-3 right-3 bg-yellow-500/20 backdrop-blur-sm p-2 rounded-full">
                                    <Lock className="w-4 h-4 text-yellow-600" />
                                  </div>
                                )}
                                
                                <div className="flex items-start justify-between mb-3">
                                  <Sparkles className="w-6 h-6 text-accent" />
                                </div>
                                
                                <h3 className="text-lg font-bold mb-2 line-clamp-1">{tool.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                  {tool.description || "AI-powered tool"}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <Badge variant={tool.is_premium ? 'default' : 'outline'}>
                                    {tool.is_premium ? '⭐ Premium' : '🆓 Free'}
                                  </Badge>
                                  
                                  <Button 
                                    variant={isAccessible ? "outline" : "secondary"} 
                                    size="sm"
                                  >
                                    {isAccessible ? 'Try Now' : 'Unlock'}
                                    <ArrowRight className="ml-1 w-4 h-4" />
                                  </Button>
                                </div>
                              </Card>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* All Tools Grid */}
                  <div>
                    <h2 className="text-2xl font-bold mb-6">
                      {selectedCategory === "all" ? "All AI Tools" : 
                       mainCategories.find(c => c.id === selectedCategory)?.name}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {uniqueTools.map((tool, index) => {
                        const isAccessible = canAccessTool(tool);
                        const path = tool.route_path && tool.route_path.trim() 
                          ? tool.route_path 
                          : tool.tool_type 
                          ? `/tool/${tool.tool_type}`
                          : `/tool/${tool.name.toLowerCase().replace(/\s+/g, '-')}`;
                        
                        return (
                          <Link 
                            key={tool.id} 
                            to={isAccessible ? path : '#'}
                            onClick={(e) => handleToolClick(tool, e)}
                          >
                            <Card className={`p-6 hover:scale-105 transition-all duration-300 h-full relative ${
                              !isAccessible ? 'opacity-75' : ''
                            }`}>
                              {tool.is_premium && !isAccessible && (
                                <div className="absolute top-3 right-3 bg-yellow-500/20 backdrop-blur-sm p-2 rounded-full">
                                  <Lock className="w-4 h-4 text-yellow-600" />
                                </div>
                              )}
                              
                              <div className="flex items-start justify-between mb-3">
                                <Sparkles className="w-5 h-5 text-accent" />
                              </div>
                              
                              <h3 className="text-lg font-semibold mb-2 line-clamp-1">{tool.name}</h3>
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {tool.description || "AI-powered tool"}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <Badge variant={tool.is_premium ? 'default' : 'outline'} className="text-xs">
                                  {tool.is_premium ? 'Premium' : 'Free'}
                                </Badge>
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-xs"
                                >
                                  {isAccessible ? 'Use' : 'Unlock'}
                                </Button>
                              </div>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Tabs>
        </div>
      </div>

      <PremiumModal 
        open={premiumModalOpen} 
        onClose={() => setPremiumModalOpen(false)}
        toolName={selectedTool}
      />
    </>
  );
}
