import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Sparkles, Code2, Palette, TrendingUp, Lock, ArrowRight,
  Bot, Briefcase, Headphones, Target, FileText, Users, Scale, Wrench,
  DollarSign, Pen, BarChart, Package
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PremiumModal } from "@/components/PremiumModal";
import { TopBar } from "@/components/TopBar";
import { toast } from "@/hooks/use-toast";
import { NSCta } from "@/components/ns/NSCta";
import { Reveal } from "@/components/ns/Reveal";
import { NSBackdrop } from "@/components/ns/NSBackdrop";
import { cn } from "@/lib/utils";
import { getToolSeo } from "@/data/toolSeo";

// Score a tool against the user's query. Higher = more relevant.
// Exact-name match dominates so "code editor" → Code Editor ranks #1.
function scoreToolForQuery(tool: Tool, rawQuery: string): number {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return 0;
  const name = (tool.name || "").toLowerCase();
  const desc = (tool.description || "").toLowerCase();
  const type = (tool.tool_type || "").toLowerCase();
  const seo = getToolSeo(tool.tool_type || tool.name, tool.name, tool.description || "");
  const keywords = (seo.keywords || "").toLowerCase();
  const tagline = (seo.tagline || "").toLowerCase();

  let score = 0;
  if (name === q) score += 1000;
  if (type === q || type.replace(/-/g, " ") === q) score += 900;
  if (name.startsWith(q)) score += 400;
  if (name.includes(q)) score += 250;

  // Token-level keyword matching (top SEO keywords)
  const keywordList = keywords.split(",").map((k) => k.trim()).filter(Boolean);
  keywordList.forEach((kw, idx) => {
    const weight = Math.max(120 - idx * 8, 20); // earlier keywords weigh more
    if (kw === q) score += weight + 200;
    else if (kw.includes(q) || q.includes(kw)) score += weight;
  });

  // Per-word matching for multi-word queries
  const words = q.split(/\s+/).filter((w) => w.length > 1);
  words.forEach((w) => {
    if (name.includes(w)) score += 60;
    if (keywords.includes(w)) score += 30;
    if (tagline.includes(w)) score += 15;
    if (desc.includes(w)) score += 10;
  });

  return score;
}

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
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>("");
  const { profile } = useAuth();

  const mainCategories = [
    { id: "all", name: "All", icon: Sparkles },
    { id: "writing", name: "Text AI", icon: Sparkles },
    { id: "design", name: "Image AI", icon: Palette },
    { id: "coding", name: "Code AI", icon: Code2 },
    { id: "marketing", name: "Marketing", icon: TrendingUp },
  ];

  useEffect(() => {
    fetchTools();
    fetchAgents();
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
      toast({ variant: "destructive", title: "Error", description: "Failed to load tools" });
    } else {
      setTools(data || []);
    }
    setLoading(false);
  };

  const fetchAgents = async () => {
    const { data } = await supabase
      .from('ai_agents')
      .select('id, name, description, category, icon, is_premium, monthly_price, usd_monthly_price')
      .eq('is_active', true)
      .order('display_order')
      .limit(4);
    setAgents(data || []);
  };

  const agentIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Bot, Headphones, Target, Search: Search as any, TrendingUp, FileText, Users, Scale,
    Wrench, DollarSign, Pen, BarChart, Package
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const getTrendingTools = () => uniqueTools.slice(0, 6);

  const resolveToolPath = (tool: Tool) =>
    tool.route_path && tool.route_path.trim()
      ? tool.route_path
      : tool.tool_type
        ? `/tool/${tool.tool_type}`
        : `/tool/${tool.name.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <>
      <TopBar />
      <div className="relative min-h-screen bg-background overflow-hidden">
        <NSBackdrop intensity="subtle" className="opacity-60" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {/* Header */}
          <Reveal immediate>
            <div className="mb-12">
              <div className="text-xs uppercase tracking-[0.25em] text-primary mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-primary/60" /> Workspace
              </div>
              <h1 className="font-display text-4xl sm:text-6xl tracking-[-0.035em] leading-[1]">
                Your AI <span className="font-script text-primary">toolkit</span>
              </h1>
              <p className="mt-5 text-muted-foreground max-w-xl">
                {profile?.plan === 'free'
                  ? `Access free tools or upgrade to unlock all ${tools.length}+ premium tools.`
                  : `Unlimited access to all ${tools.length}+ AI tools.`}
              </p>
            </div>
          </Reveal>

          {/* Upgrade banner */}
          {profile?.plan === 'free' && (
            <Reveal delay={120}>
              <div className="ns-lift relative mb-12 overflow-hidden rounded-2xl border border-border bg-card p-7 sm:p-9">
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl ns-glow-pulse" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="max-w-xl">
                    <div className="text-xs uppercase tracking-[0.25em] text-primary mb-3">Premium</div>
                    <h3 className="font-display text-2xl sm:text-3xl tracking-tight mb-2">
                      Unlock {tools.length}+ <span className="font-script text-primary">premium</span> tools
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Unlimited credits, advanced models, priority access — without compromise.
                    </p>
                  </div>
                  <NSCta size="md" onClick={() => setPremiumModalOpen(true)}>
                    Upgrade to Pro
                  </NSCta>
                </div>
              </div>
            </Reveal>
          )}

          {/* AI Agents row */}
          {agents.length > 0 && (
            <div className="mb-14">
              <Reveal>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-primary mb-2 flex items-center gap-3">
                      <span className="h-px w-8 bg-primary/60" /> Agents
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl tracking-tight">AI workers, on demand</h2>
                  </div>
                  <Link to="/agents" className="ns-link text-sm text-foreground/90 inline-flex items-center gap-1.5">
                    View all <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {agents.map((agent, idx) => {
                  const AgentIcon = agentIconMap[agent.icon] || Bot;
                  return (
                    <Reveal key={agent.id} delay={idx * 80}>
                      <Link to={`/agent/${agent.id}`} className="group block h-full">
                        <div className="ns-lift h-full p-5 rounded-2xl border border-border bg-card">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center group-hover:border-primary/60 transition-colors">
                              <AgentIcon className="w-4 h-4 text-primary" />
                            </div>
                            <h3 className="font-display text-base tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                              {agent.name}
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                            {agent.description}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs ns-link">
                            <Briefcase className="w-3.5 h-3.5" /> Start work
                          </div>
                        </div>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search */}
          <Reveal>
            <div className="mb-8">
              <div className="relative max-w-2xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search 160+ tools…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 h-14 rounded-full bg-card border-border focus-visible:ring-primary/40"
                />
              </div>
            </div>
          </Reveal>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-10">
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-transparent p-0">
              {mainCategories.map((category, idx) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className={cn(
                    "rounded-full border border-border bg-card px-5 py-2.5 text-sm tracking-tight",
                    "data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:border-foreground",
                    "transition-all duration-300"
                  )}
                >
                  <category.icon className="w-3.5 h-3.5 mr-2" />
                  {category.name}
                  <span className="ml-2 text-[10px] tracking-[0.2em] opacity-60">
                    /{getCategoryCount(category.id)}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-10">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
                </div>
              ) : uniqueTools.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">No tools match your search.</p>
                </div>
              ) : (
                <>
                  {/* Trending */}
                  {selectedCategory === "all" && getTrendingTools().length > 0 && (
                    <div className="mb-14">
                      <Reveal>
                        <div className="flex items-end justify-between mb-6">
                          <div>
                            <div className="text-xs uppercase tracking-[0.25em] text-primary mb-2">Trending</div>
                            <h2 className="font-display text-2xl sm:text-3xl tracking-tight">Popular this week</h2>
                          </div>
                        </div>
                      </Reveal>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {getTrendingTools().map((tool, index) => (
                          <ToolCard
                            key={tool.id}
                            tool={tool}
                            index={index}
                            accessible={canAccessTool(tool)}
                            onLockedClick={(e) => handleToolClick(tool, e)}
                            path={resolveToolPath(tool)}
                            featured
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All tools */}
                  <div>
                    <Reveal>
                      <h2 className="font-display text-2xl sm:text-3xl tracking-tight mb-6">
                        {selectedCategory === "all" ? "All tools" :
                          mainCategories.find(c => c.id === selectedCategory)?.name}
                      </h2>
                    </Reveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {uniqueTools.map((tool, index) => (
                        <ToolCard
                          key={tool.id}
                          tool={tool}
                          index={index}
                          accessible={canAccessTool(tool)}
                          onLockedClick={(e) => handleToolClick(tool, e)}
                          path={resolveToolPath(tool)}
                        />
                      ))}
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

interface ToolCardProps {
  tool: Tool;
  index: number;
  accessible: boolean;
  onLockedClick: (e: React.MouseEvent) => void;
  path: string;
  featured?: boolean;
}

function ToolCard({ tool, index, accessible, onLockedClick, path, featured }: ToolCardProps) {
  return (
    <Reveal delay={Math.min(index * 60, 600)}>
      <Link
        to={accessible ? path : "#"}
        onClick={onLockedClick}
        className="group block h-full"
      >
        <div className={cn(
          "ns-lift relative h-full rounded-2xl border border-border bg-card overflow-hidden",
          featured ? "p-7" : "p-6",
          !accessible && "opacity-80"
        )}>
          {/* gold glow on hover */}
          <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {tool.is_premium && !accessible && (
            <div className="absolute top-4 right-4 inline-flex items-center justify-center w-8 h-8 rounded-full border border-primary/40 bg-background/70 backdrop-blur">
              <Lock className="w-3.5 h-3.5 text-primary" />
            </div>
          )}

          <div className="relative">
            <div className="flex items-start justify-between mb-5">
              <div className="w-10 h-10 rounded-xl border border-border flex items-center justify-center group-hover:border-primary/60 transition-colors">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {tool.is_premium ? 'Pro' : 'Free'}
              </span>
            </div>

            <h3 className={cn(
              "font-display tracking-tight mb-2 line-clamp-1 group-hover:text-primary transition-colors",
              featured ? "text-xl" : "text-lg"
            )}>
              {tool.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
              {tool.description || "AI-powered tool"}
            </p>

            <div className="flex items-center gap-2 text-sm ns-link">
              {accessible ? 'Try Now' : 'Unlock'}
              <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
