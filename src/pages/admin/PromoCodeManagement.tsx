import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Tag, 
  Calendar,
  Users,
  Percent,
  IndianRupee
} from "lucide-react";
import { format } from "date-fns";

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  applicable_plans: string[];
  min_amount: number;
  created_at: string;
}

export const PromoCodeManagement = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    max_uses: "",
    expires_at: "",
    applicable_plans: ["starter", "pro", "business"],
    min_amount: "0"
  });

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch promo codes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleCreate = async () => {
    if (!formData.code.trim() || !formData.discount_value) {
      toast({
        title: "Error",
        description: "Code and discount value are required",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('promo_codes')
        .insert({
          code: formData.code.toUpperCase().trim(),
          discount_type: formData.discount_type,
          discount_value: parseFloat(formData.discount_value),
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          expires_at: formData.expires_at || null,
          applicable_plans: formData.applicable_plans,
          min_amount: parseFloat(formData.min_amount) || 0,
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Promo code created successfully"
      });

      setShowCreateModal(false);
      setFormData({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        max_uses: "",
        expires_at: "",
        applicable_plans: ["starter", "pro", "business"],
        min_amount: "0"
      });
      fetchPromoCodes();
    } catch (error: any) {
      console.error('Create error:', error);
      toast({
        title: "Error",
        description: error.message?.includes('duplicate') 
          ? "This promo code already exists" 
          : "Failed to create promo code",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchPromoCodes();
      toast({
        title: "Success",
        description: `Promo code ${!currentStatus ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update promo code",
        variant: "destructive"
      });
    }
  };

  const deletePromoCode = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    
    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPromoCodes();
      toast({ title: "Deleted", description: "Promo code deleted" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete promo code",
        variant: "destructive"
      });
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isMaxedOut = (maxUses: number | null, currentUses: number) => {
    if (maxUses === null) return false;
    return currentUses >= maxUses;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold">Promo Codes</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPromoCodes} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Code
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Plans</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promoCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {loading ? 'Loading...' : 'No promo codes found'}
                </TableCell>
              </TableRow>
            ) : (
              promoCodes.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-mono font-bold text-primary">
                    {promo.code}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {promo.discount_type === 'percentage' ? (
                        <><Percent className="w-3 h-3" />{promo.discount_value}%</>
                      ) : (
                        <><IndianRupee className="w-3 h-3" />{promo.discount_value}</>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {promo.current_uses}/{promo.max_uses ?? '∞'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {promo.expires_at ? (
                      <div className={`flex items-center gap-1 text-sm ${isExpired(promo.expires_at) ? 'text-destructive' : ''}`}>
                        <Calendar className="w-3 h-3" />
                        {format(new Date(promo.expires_at), 'dd MMM yyyy')}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {promo.applicable_plans.map(plan => (
                        <Badge key={plan} variant="outline" className="text-xs">
                          {plan}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {!promo.is_active ? (
                      <Badge variant="secondary">Inactive</Badge>
                    ) : isExpired(promo.expires_at) ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : isMaxedOut(promo.max_uses, promo.current_uses) ? (
                      <Badge variant="secondary">Max Used</Badge>
                    ) : (
                      <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(promo.id, promo.is_active)}
                      >
                        {promo.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deletePromoCode(promo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Create Promo Code
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Promo Code *</Label>
              <Input
                placeholder="e.g., SAVE20, NEWYEAR"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="uppercase"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(v) => setFormData({ ...formData, discount_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discount Value *</Label>
                <Input
                  type="number"
                  placeholder={formData.discount_type === 'percentage' ? "e.g., 20" : "e.g., 100"}
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max Uses (empty = unlimited)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                />
              </div>
              <div>
                <Label>Expires At</Label>
                <Input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Minimum Amount (0 = no minimum)</Label>
              <Input
                type="number"
                placeholder="e.g., 500"
                value={formData.min_amount}
                onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
              />
            </div>

            <div>
              <Label>Applicable To</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['starter', 'pro', 'business', 'agent_monthly', 'agent_yearly', 'agent_lifetime'].map(plan => (
                  <Button
                    key={plan}
                    type="button"
                    variant={formData.applicable_plans.includes(plan) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const plans = formData.applicable_plans.includes(plan)
                        ? formData.applicable_plans.filter(p => p !== plan)
                        : [...formData.applicable_plans, plan];
                      setFormData({ ...formData, applicable_plans: plans });
                    }}
                  >
                    {plan.startsWith('agent_') ? `Agent ${plan.replace('agent_', '')}` : plan}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Select which plan types or agent purchase types this code applies to</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating...' : 'Create Code'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
