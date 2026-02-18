import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Bot, Headphones, Target, Search, TrendingUp, FileText, Users, Scale, 
  Wrench, DollarSign, Pen, BarChart, Package, Crown, Zap,
  Sparkles, Filter, Briefcase, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  is_premium: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Bot, Headphones, Target, Search, TrendingUp, FileText, Users, Scale,
  Wrench, DollarSign, Pen, BarChart, Package
};

const categoryLabels: Record<string, string> = {
  support: "Support",
  sales: "Sales",
  research: "Research",
  marketing: "Marketing",
  hr: "HR",
  legal: "Legal",
  finance: "Finance",
  creative: "Creative",
  analytics: "Analytics",
  product: "Product",
  general: "General"
};

const agentCapabilities: Record<string, string[]> = {
  "Customer Support Agent": ["Draft response emails", "Create ticket summaries", "Generate FAQ entries"],
  "Lead Generation Agent": ["Email sequences", "Lead scoring", "Cold call scripts"],
  "Research Assistant": ["Research reports", "Comparison analysis", "Presentation outlines"],
  "Sales Coach": ["Sales pitch scripts", "Objection playbooks", "Battle cards"],
  "Content Strategist": ["30-day content calendar", "Social media posts", "SEO keyword clusters"],
  "HR Assistant": ["Job descriptions", "Interview rubrics", "Onboarding checklists"],
  "Legal Advisor": ["Contract drafts", "Policy documents", "Compliance checklists"],
  "Technical Support": ["Troubleshooting guides", "KB articles", "Root cause analysis"],
  "Financial Advisor": ["Budget plans", "Investment analysis", "Financial projections"],
  "Creative Writer": ["Blog posts", "Marketing copy", "Video scripts"],
  "Data Analyst": ["Analysis reports", "KPI dashboards", "Strategy documents"],
  "Product Manager": ["PRDs", "User stories", "Product roadmaps"],
};

const Agents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_agents")
        .select("id, name, description, category, icon, is_premium")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to load AI agents");
    } finally {
      setLoading(false);
    }
  };

  const handleAgentClick = (agent: Agent) => {
    navigate(`/agent/${agent.id}`);
  };

  const categories = [...new Set(agents.map(a => a.category))];

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const IconComponent = ({ iconName, className }: { iconName: string; className?: string }) => {
    const Icon = iconMap[iconName] || Bot;
    return <Icon className={className} />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Autonomous AI Workers</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI Agents That <span className="text-primary">Do Real Work</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Not just chatbots — these agents produce complete deliverables. Get ready-to-use 
            reports, emails, documents, and strategies in seconds.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Ready-to-use outputs</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Copy & download</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Autonomous execution</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              <Filter className="w-4 h-4 mr-1" />
              All
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {categoryLabels[cat] || cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Agents Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="w-12 h-12 bg-muted rounded-lg mb-2" />
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAgents.map((agent) => {
              const capabilities = agentCapabilities[agent.name] || [];
              return (
                <Card 
                  key={agent.id} 
                  className="group cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300 relative overflow-hidden"
                  onClick={() => handleAgentClick(agent)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
                  
                  <CardHeader className="relative pb-2">
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <IconComponent iconName={agent.icon} className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex gap-2">
                        {agent.is_premium && (
                          <Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                            <Crown className="w-3 h-3 mr-1" />
                            Pro
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {agent.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {agent.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {capabilities.slice(0, 3).map((cap) => (
                          <span key={cap} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                            {cap}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {categoryLabels[agent.category] || agent.category}
                      </Badge>
                      <Button size="sm" variant="ghost" className="gap-1 text-primary">
                        <Briefcase className="w-4 h-4" />
                        Start Work
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredAgents.length === 0 && !loading && (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Agents;
