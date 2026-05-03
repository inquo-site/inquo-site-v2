import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { AgentPaymentModal } from "@/components/AgentPaymentModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Bot, Headphones, Target, Search, TrendingUp, FileText, Users, Scale, 
  Wrench, DollarSign, Pen, BarChart, Package, Crown, Zap,
  Sparkles, Filter, Briefcase, CheckCircle2, IndianRupee, Lock
} from "lucide-react";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  is_premium: boolean;
  monthly_price: number;
  yearly_price: number;
  one_time_price: number;
  usd_monthly_price: number;
  usd_yearly_price: number;
  usd_one_time_price: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Bot, Headphones, Target, Search, TrendingUp, FileText, Users, Scale,
  Wrench, DollarSign, Pen, BarChart, Package
};

const categoryLabels: Record<string, string> = {
  support: "Support", sales: "Sales", research: "Research", marketing: "Marketing",
  hr: "HR", legal: "Legal", finance: "Finance", creative: "Creative",
  analytics: "Analytics", product: "Product", general: "General"
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
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [subscribedAgentIds, setSubscribedAgentIds] = useState<Set<string>>(new Set());
  const [paymentAgent, setPaymentAgent] = useState<Agent | null>(null);
  const [paymentType, setPaymentType] = useState<'monthly' | 'yearly' | 'lifetime'>('monthly');
  const [showPayment, setShowPayment] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isINR = () => {
    const country = localStorage.getItem("selectedCountry");
    return !country || country === "IN";
  };

  useEffect(() => {
    fetchAgents();
    if (user) fetchSubscriptions();
  }, [user]);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_agents")
        .select("id, name, description, category, icon, is_premium, monthly_price, yearly_price, one_time_price, usd_monthly_price, usd_yearly_price, usd_one_time_price")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setAgents((data as Agent[]) || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to load AI agents");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("agent_subscriptions")
        .select("agent_id")
        .eq("user_id", user!.id)
        .eq("status", "active");

      if (!error && data) {
        setSubscribedAgentIds(new Set(data.map(s => s.agent_id)));
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  const handleAgentClick = (agent: Agent) => {
    const isFree = agent.monthly_price === 0;
    const hasAccess = isFree || subscribedAgentIds.has(agent.id);

    if (hasAccess) {
      navigate(`/agent/${agent.id}`);
    } else {
      setSelectedAgent(agent);
      setShowPricing(true);
    }
  };

  const handlePurchase = (agent: Agent, type: "monthly" | "yearly" | "lifetime") => {
    if (!user) {
      toast.error("Please login first");
      navigate("/auth");
      return;
    }
    setShowPricing(false);
    setPaymentAgent(agent);
    setPaymentType(type);
    setShowPayment(true);
  };

  const formatPrice = (agent: Agent, field: "monthly" | "yearly" | "one_time") => {
    const inr = isINR();
    const symbol = inr ? "₹" : "$";
    const priceMap = {
      monthly: inr ? agent.monthly_price : agent.usd_monthly_price,
      yearly: inr ? agent.yearly_price : agent.usd_yearly_price,
      one_time: inr ? agent.one_time_price : agent.usd_one_time_price,
    };
    return `${symbol}${priceMap[field].toLocaleString()}`;
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
      <SEOHead
        title="AI Agents - Autonomous AI Workers"
        description="Hire autonomous AI agents for support, sales, research, marketing, HR, legal & more. Get ready-to-use deliverables in seconds. Monthly, yearly, lifetime plans."
        keywords="AI agents, autonomous AI, AI worker, sales agent, support agent, research agent, marketing AI, AI assistant, Inquo.site agents"
        canonicalUrl="https://inquo.site/agents"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "AI Agents",
          description: "Autonomous AI agents that produce ready-to-use deliverables.",
          url: "https://inquo.site/agents",
        }}
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 mt-16 max-w-6xl">
        {/* Hero - simplified */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">AI Agents</h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            Specialized agents that produce ready-to-use deliverables — reports, emails, documents, and more.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search agents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant={selectedCategory === null ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(null)}>
              All
            </Button>
            {categories.map(cat => (
              <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>
                {categoryLabels[cat] || cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Agents Grid - simplified */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="w-10 h-10 bg-muted rounded-lg mb-2" />
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => {
              const isFree = agent.monthly_price === 0;
              const hasAccess = isFree || subscribedAgentIds.has(agent.id);

              return (
                <Card
                  key={agent.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleAgentClick(agent)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2.5 bg-primary/10 rounded-lg">
                        <IconComponent iconName={agent.icon} className="w-5 h-5 text-primary" />
                      </div>
                      {hasAccess ? (
                        <Badge variant="outline" className="text-xs border-green-500/50 text-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Access
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {formatPrice(agent, "monthly")}/mo
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">{agent.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{categoryLabels[agent.category] || agent.category}</span>
                    <Button size="sm" variant="ghost" className="h-8 gap-1 text-primary">
                      {hasAccess ? <>Start <Briefcase className="w-3.5 h-3.5" /></> : <>Unlock <Lock className="w-3.5 h-3.5" /></>}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredAgents.length === 0 && !loading && (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">No agents found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filter</p>
          </div>
        )}
      </main>

      {/* Pricing Modal */}
      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogContent className="sm:max-w-lg">
          {selectedAgent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent iconName={selectedAgent.icon} className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle>{selectedAgent.name}</DialogTitle>
                    <DialogDescription>{selectedAgent.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3 mt-4">
                {/* Monthly */}
                <div className="border rounded-xl p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Monthly</p>
                      <p className="text-sm text-muted-foreground">Cancel anytime</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatPrice(selectedAgent, "monthly")}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    </div>
                  </div>
                  <Button className="w-full mt-3" onClick={() => handlePurchase(selectedAgent, "monthly")}>
                    Subscribe Monthly
                  </Button>
                </div>

                {/* Yearly */}
                <div className="border rounded-xl p-4 hover:border-primary/50 transition-colors relative">
                  <Badge className="absolute -top-2 right-4 bg-green-500 text-white border-0">Save ~17%</Badge>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Yearly</p>
                      <p className="text-sm text-muted-foreground">Billed annually</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatPrice(selectedAgent, "yearly")}<span className="text-sm font-normal text-muted-foreground">/yr</span></p>
                    </div>
                  </div>
                  <Button className="w-full mt-3" variant="default" onClick={() => handlePurchase(selectedAgent, "yearly")}>
                    Subscribe Yearly
                  </Button>
                </div>

                {/* Lifetime */}
                <div className="border rounded-xl p-4 hover:border-primary/50 transition-colors relative bg-muted/30">
                  <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground border-0">Best Value</Badge>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Lifetime Access</p>
                      <p className="text-sm text-muted-foreground">One-time payment, forever</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatPrice(selectedAgent, "one_time")}</p>
                    </div>
                  </div>
                  <Button className="w-full mt-3" onClick={() => handlePurchase(selectedAgent, "lifetime")}>
                    Buy Lifetime
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-2">
                Secure payment via UPI. Instant access after verification.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>


      {/* Agent Payment Modal */}
      {paymentAgent && (
        <AgentPaymentModal
          open={showPayment}
          onClose={() => {
            setShowPayment(false);
            setPaymentAgent(null);
            fetchSubscriptions();
          }}
          agent={paymentAgent}
          purchaseType={paymentType}
        />
      )}

      <Footer />
    </div>
  );
};

export default Agents;
