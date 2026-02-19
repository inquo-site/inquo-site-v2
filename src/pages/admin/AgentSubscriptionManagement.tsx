import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Trash2, CheckCircle2, XCircle, Bot, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Subscription {
  id: string;
  user_id: string;
  agent_id: string;
  purchase_type: string;
  status: string;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
  user_email?: string;
  agent_name?: string;
}

interface Agent {
  id: string;
  name: string;
  monthly_price: number;
}

interface UserProfile {
  user_id: string;
  email: string | null;
  full_name: string | null;
}

export const AgentSubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [selectedType, setSelectedType] = useState("monthly");
  const [adding, setAdding] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [subsRes, agentsRes, usersRes] = await Promise.all([
        supabase.from("agent_subscriptions").select("*").order("created_at", { ascending: false }),
        supabase.from("ai_agents").select("id, name, monthly_price").order("name"),
        supabase.from("user_profiles").select("user_id, email, full_name").order("email"),
      ]);

      const agentMap = new Map((agentsRes.data || []).map(a => [a.id, a.name]));
      const userMap = new Map((usersRes.data || []).map(u => [u.user_id, u.email || u.full_name || u.user_id]));

      const enriched = (subsRes.data || []).map(s => ({
        ...s,
        agent_name: agentMap.get(s.agent_id) || "Unknown",
        user_email: userMap.get(s.user_id) || s.user_id,
      }));

      setSubscriptions(enriched);
      setAgents((agentsRes.data as Agent[]) || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: string) => {
    const { error } = await supabase
      .from("agent_subscriptions")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error("Failed to activate"); return; }
    toast.success("Subscription activated");
    fetchAll();
  };

  const handleDeactivate = async (id: string) => {
    const { error } = await supabase
      .from("agent_subscriptions")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error("Failed to deactivate"); return; }
    toast.success("Subscription deactivated");
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("agent_subscriptions").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Subscription deleted");
    fetchAll();
  };

  const handleAdd = async () => {
    if (!selectedUserId || !selectedAgentId) {
      toast.error("Please select both user and agent");
      return;
    }
    setAdding(true);
    try {
      const expiresAt = selectedType === "lifetime" ? null :
        selectedType === "yearly" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() :
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase.from("agent_subscriptions").insert({
        user_id: selectedUserId,
        agent_id: selectedAgentId,
        purchase_type: selectedType,
        status: "active",
        expires_at: expiresAt,
      });

      if (error) throw error;
      toast.success("Subscription added successfully");
      setShowAddDialog(false);
      setSelectedUserId("");
      setSelectedAgentId("");
      fetchAll();
    } catch (error: any) {
      toast.error(error.message || "Failed to add subscription");
    } finally {
      setAdding(false);
    }
  };

  const filtered = subscriptions.filter(s => {
    const matchesSearch = (s.user_email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.agent_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(u =>
    (u.email || "").toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.full_name || "").toLowerCase().includes(userSearch.toLowerCase())
  );

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === "active").length,
    expired: subscriptions.filter(s => s.status === "expired").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Subscriptions</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Expired/Cancelled</p>
          <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by user or agent..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" /> Grant Access
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium text-sm">{sub.user_email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Bot className="w-4 h-4 text-primary" />
                        <span className="text-sm">{sub.agent_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">{sub.purchase_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sub.status === "active" ? "default" : "destructive"} className="text-xs">
                        {sub.status === "active" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(sub.starts_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {sub.status === "active" ? (
                          <Button variant="outline" size="sm" onClick={() => handleDeactivate(sub.id)}>
                            <XCircle className="w-3 h-3 mr-1" /> Deactivate
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => handleActivate(sub.id)}>
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Activate
                          </Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(sub.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add Subscription Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Agent Access</DialogTitle>
            <DialogDescription>Manually grant a user access to an AI agent.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Search User</Label>
              <Input placeholder="Search by email..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="mb-2" />
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                <SelectContent>
                  {filteredUsers.slice(0, 20).map(u => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {u.email || u.full_name || u.user_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Agent</Label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                <SelectContent>
                  {agents.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} (₹{a.monthly_price}/mo)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subscription Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly (30 days)</SelectItem>
                  <SelectItem value="yearly">Yearly (365 days)</SelectItem>
                  <SelectItem value="lifetime">Lifetime (No expiry)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={adding}>
              {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Grant Access
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
