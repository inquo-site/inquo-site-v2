import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Settings, BarChart, LogOut, DollarSign, Activity, Tag, Megaphone, Bot } from "lucide-react";
import { useEffect, useState } from "react";
import UserManagement from "./admin/UserManagement";
import ToolManagement from "./admin/ToolManagement";
import Analytics from "./admin/Analytics";
import BlogManagement from "./admin/BlogManagement";
import { PaymentManagement } from "./admin/PaymentManagement";
import { PromoCodeManagement } from "./admin/PromoCodeManagement";
import { BannerManagement } from "./admin/BannerManagement";
import { AgentSubscriptionManagement } from "./admin/AgentSubscriptionManagement";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalTools: number;
  monthlyRevenue: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalTools: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    fetchDashboardStats();

    // Subscribe to presence channel for realtime online users
    const channel = supabase.channel('online-users');
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, any[]>;
        setOnlineUsers(Object.keys(state).length);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data: users } = await supabase.from('user_profiles').select('plan');
      const { data: tools } = await supabase.from('tools').select('id');

      const totalUsers = users?.length || 0;
      const premiumUsers = users?.filter(u => u.plan !== 'free').length || 0;
      const proUsers = users?.filter(u => u.plan === 'pro').length || 0;
      const yearlyUsers = users?.filter(u => u.plan === 'yearly').length || 0;
      const lifetimeUsers = users?.filter(u => u.plan === 'lifetime').length || 0;
      
      const monthlyRevenue = (proUsers * 29) + (yearlyUsers * 199) + (lifetimeUsers * 399);

      setStats({
        totalUsers,
        activeUsers: totalUsers,
        premiumUsers,
        totalTools: tools?.length || 0,
        monthlyRevenue,
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, Admin</h2>
          <p className="text-muted-foreground">
            Manage your AI tools platform from here
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground mb-2">Total Users</p>
              <h3 className="text-3xl font-bold mb-1">{loading ? '...' : stats.totalUsers}</h3>
              <Users className="w-8 h-8 text-primary mt-2" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground mb-2">Active Users (Realtime)</p>
              <h3 className="text-3xl font-bold mb-1">{loading ? '...' : onlineUsers}</h3>
              <Activity className="w-8 h-8 text-green-500 mt-2" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground mb-2">Premium Users</p>
              <h3 className="text-3xl font-bold mb-1">{loading ? '...' : stats.premiumUsers}</h3>
              <BarChart className="w-8 h-8 text-purple-500 mt-2" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground mb-2">Total Tools</p>
              <h3 className="text-3xl font-bold mb-1">{loading ? '...' : stats.totalTools}</h3>
              <Settings className="w-8 h-8 text-amber-500 mt-2" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground mb-2">Estimated Revenue</p>
              <h3 className="text-3xl font-bold mb-1">${loading ? '...' : stats.monthlyRevenue.toLocaleString()}</h3>
              <DollarSign className="w-8 h-8 text-green-500 mt-2" />
            </div>
          </Card>
        </div>

        {/* Tabs for Management Sections */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="promos">Promos</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => document.querySelector('[value="users"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>
                <Users className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">User Management</h3>
                <p className="text-muted-foreground">
                  Manage users, roles, and permissions
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => document.querySelector('[value="tools"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>
                <Settings className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Tool Configuration</h3>
                <p className="text-muted-foreground">
                  Configure and manage AI tools
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => document.querySelector('[value="analytics"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>
                <BarChart className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analytics</h3>
                <p className="text-muted-foreground">
                  View usage statistics and insights
                </p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentManagement />
          </TabsContent>

          <TabsContent value="agents">
            <AgentSubscriptionManagement />
          </TabsContent>

          <TabsContent value="promos">
            <PromoCodeManagement />
          </TabsContent>

          <TabsContent value="banners">
            <BannerManagement />
          </TabsContent>

          <TabsContent value="tools">
            <ToolManagement />
          </TabsContent>

          <TabsContent value="blog">
            <BlogManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
