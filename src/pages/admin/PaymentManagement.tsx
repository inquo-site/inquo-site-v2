import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Check, 
  X, 
  Clock, 
  RefreshCw,
  Eye,
  IndianRupee,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";

interface PaymentRequest {
  id: string;
  user_id: string;
  plan_type: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  utr_number: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  user_email?: string;
}

export const PaymentManagement = () => {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
  const [actionModal, setActionModal] = useState<'verify' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch user emails
      const userIds = [...new Set(data?.map(p => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      const emailMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);

      const paymentsWithEmail = data?.map(p => ({
        ...p,
        user_email: emailMap.get(p.user_id) || 'Unknown'
      })) || [];

      setPayments(paymentsWithEmail);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const handleVerify = async () => {
    if (!selectedPayment) return;
    setProcessing(true);

    try {
      // Update payment status
      const { error: paymentError } = await supabase
        .from('payment_requests')
        .update({
          status: 'verified',
          admin_notes: adminNotes,
          verified_at: new Date().toISOString()
        })
        .eq('id', selectedPayment.id);

      if (paymentError) throw paymentError;

      const isAgentPurchase = selectedPayment.plan_type.startsWith('agent_');

      if (isAgentPurchase && (selectedPayment as any).agent_id) {
        // Grant agent access
        const agentId = (selectedPayment as any).agent_id;
        const purchaseType = selectedPayment.plan_type.replace('agent_', '');
        
        let expiresAt: string | null = null;
        if (purchaseType === 'monthly') {
          expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        } else if (purchaseType === 'yearly') {
          expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        }
        // lifetime = null (no expiry)

        const { error: subError } = await supabase
          .from('agent_subscriptions')
          .insert({
            user_id: selectedPayment.user_id,
            agent_id: agentId,
            purchase_type: purchaseType,
            status: 'active',
            expires_at: expiresAt,
          });

        if (subError) throw subError;

        toast({
          title: "Payment Verified",
          description: `Agent access granted to user`
        });
      } else {
        // Update user plan (platform plan purchase)
        const planMap: Record<string, 'free' | 'pro' | 'yearly' | 'lifetime'> = {
          'starter': 'pro',
          'pro': 'yearly',
          'business': 'lifetime'
        };

        const newPlan = planMap[selectedPayment.plan_type] || 'pro';
        const creditsMap: Record<string, number> = {
          'starter': 30,
          'pro': 50,
          'business': 999
        };

        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            plan: newPlan,
            daily_credits: creditsMap[selectedPayment.plan_type] || 50,
            max_daily_credits: creditsMap[selectedPayment.plan_type] || 50
          })
          .eq('user_id', selectedPayment.user_id);

        if (profileError) throw profileError;

        toast({
          title: "Payment Verified",
          description: `User upgraded to ${selectedPayment.plan_type} plan`
        });
      }

      setActionModal(null);
      setSelectedPayment(null);
      setAdminNotes("");
      fetchPayments();
    } catch (error) {
      console.error('Verify error:', error);
      toast({
        title: "Error",
        description: "Failed to verify payment",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment) return;
    setProcessing(true);

    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({
          status: 'rejected',
          admin_notes: adminNotes
        })
        .eq('id', selectedPayment.id);

      if (error) throw error;

      toast({
        title: "Payment Rejected",
        description: "User has been notified"
      });

      setActionModal(null);
      setSelectedPayment(null);
      setAdminNotes("");
      fetchPayments();
    } catch (error) {
      console.error('Reject error:', error);
      toast({
        title: "Error",
        description: "Failed to reject payment",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const filteredPayments = payments.filter(p => 
    p.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    p.utr_number?.toLowerCase().includes(search.toLowerCase()) ||
    p.plan_type.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600"><Check className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const displayAmount = amount / 100;
    return currency === 'INR' 
      ? `₹${displayAmount.toLocaleString('en-IN')}`
      : `$${displayAmount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold">Payment Verification</h2>
        <Button variant="outline" onClick={fetchPayments} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by email, UTR, or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'verified', 'rejected'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>UTR</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {loading ? 'Loading...' : 'No payments found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {payment.user_email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {payment.plan_type} ({payment.billing_cycle})
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatAmount(payment.amount, payment.currency)}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {payment.utr_number || '-'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(payment.created_at), 'dd MMM yyyy, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setActionModal(null);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {payment.status === 'pending' && payment.utr_number && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setActionModal('verify');
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setActionModal('reject');
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* View Payment Details */}
      <Dialog open={!!selectedPayment && !actionModal} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">User Email</p>
                  <p className="font-medium">{selectedPayment.user_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plan</p>
                  <p className="font-medium">{selectedPayment.plan_type} ({selectedPayment.billing_cycle})</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatAmount(selectedPayment.amount, selectedPayment.currency)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">UTR Number</p>
                  <p className="font-mono">{selectedPayment.utr_number || 'Not submitted'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  {getStatusBadge(selectedPayment.status)}
                </div>
                <div>
                  <p className="text-muted-foreground">Created At</p>
                  <p className="font-medium">{format(new Date(selectedPayment.created_at), 'PPpp')}</p>
                </div>
              </div>
              {selectedPayment.admin_notes && (
                <div>
                  <p className="text-muted-foreground text-sm">Admin Notes</p>
                  <p className="text-sm bg-muted p-2 rounded">{selectedPayment.admin_notes}</p>
                </div>
              )}
              {selectedPayment.status === 'pending' && selectedPayment.utr_number && (
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => setActionModal('verify')}>
                    <Check className="w-4 h-4 mr-2" />
                    Verify Payment
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => setActionModal('reject')}>
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Verify Modal */}
      <Dialog open={actionModal === 'verify'} onOpenChange={() => setActionModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
            <DialogDescription>
              This will upgrade the user to {selectedPayment?.plan_type} plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm"><strong>User:</strong> {selectedPayment?.user_email}</p>
              <p className="text-sm"><strong>UTR:</strong> {selectedPayment?.utr_number}</p>
              <p className="text-sm"><strong>Amount:</strong> {selectedPayment && formatAmount(selectedPayment.amount, selectedPayment.currency)}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Admin Notes (optional)</label>
              <Textarea
                placeholder="Add any notes about this verification..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModal(null)}>Cancel</Button>
            <Button onClick={handleVerify} disabled={processing}>
              {processing ? 'Processing...' : 'Confirm Verification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={actionModal === 'reject'} onOpenChange={() => setActionModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm"><strong>User:</strong> {selectedPayment?.user_email}</p>
              <p className="text-sm"><strong>UTR:</strong> {selectedPayment?.utr_number}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Rejection Reason *</label>
              <Textarea
                placeholder="e.g., UTR not found, amount mismatch..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing || !adminNotes.trim()}>
              {processing ? 'Processing...' : 'Reject Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
