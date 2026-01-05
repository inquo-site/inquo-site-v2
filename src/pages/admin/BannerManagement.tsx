import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, RefreshCw, Pencil, Trash2, Eye, EyeOff, Megaphone } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  description: string | null;
  promo_code: string | null;
  discount_text: string | null;
  cta_text: string;
  cta_link: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
  display_order: number;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
}

const defaultBanner = {
  title: "",
  description: "",
  promo_code: "",
  discount_text: "",
  cta_text: "Shop Now",
  cta_link: "/pricing",
  background_color: "#EF233C",
  text_color: "#FFFFFF",
  is_active: true,
  display_order: 0,
  expires_at: "",
};

export function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState(defaultBanner);
  const { toast } = useToast();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('promotional_banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setBanners(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    const bannerData = {
      title: formData.title,
      description: formData.description || null,
      promo_code: formData.promo_code || null,
      discount_text: formData.discount_text || null,
      cta_text: formData.cta_text || "Shop Now",
      cta_link: formData.cta_link || "/pricing",
      background_color: formData.background_color,
      text_color: formData.text_color,
      is_active: formData.is_active,
      display_order: formData.display_order,
      expires_at: formData.expires_at || null,
    };

    if (editingBanner) {
      const { error } = await supabase
        .from('promotional_banners')
        .update(bannerData)
        .eq('id', editingBanner.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Banner updated successfully" });
      }
    } else {
      const { error } = await supabase
        .from('promotional_banners')
        .insert(bannerData);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Banner created successfully" });
      }
    }

    setIsDialogOpen(false);
    setEditingBanner(null);
    setFormData(defaultBanner);
    fetchBanners();
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('promotional_banners')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Banner ${!currentStatus ? 'activated' : 'deactivated'}` });
      fetchBanners();
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    const { error } = await supabase
      .from('promotional_banners')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Banner deleted successfully" });
      fetchBanners();
    }
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || "",
      promo_code: banner.promo_code || "",
      discount_text: banner.discount_text || "",
      cta_text: banner.cta_text,
      cta_link: banner.cta_link,
      background_color: banner.background_color,
      text_color: banner.text_color,
      is_active: banner.is_active,
      display_order: banner.display_order,
      expires_at: banner.expires_at ? banner.expires_at.split('T')[0] : "",
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingBanner(null);
    setFormData(defaultBanner);
    setIsDialogOpen(true);
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Megaphone className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold">Banner Management</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchBanners}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingBanner ? "Edit Banner" : "Create New Banner"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="🎉 Flash Sale - 50% OFF!"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Limited time offer on all plans"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Promo Code</Label>
                    <Input
                      value={formData.promo_code}
                      onChange={(e) => setFormData({ ...formData, promo_code: e.target.value.toUpperCase() })}
                      placeholder="SAVE50"
                    />
                  </div>

                  <div>
                    <Label>Discount Text</Label>
                    <Input
                      value={formData.discount_text}
                      onChange={(e) => setFormData({ ...formData, discount_text: e.target.value })}
                      placeholder="50% OFF"
                    />
                  </div>

                  <div>
                    <Label>CTA Button Text</Label>
                    <Input
                      value={formData.cta_text}
                      onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                      placeholder="Shop Now"
                    />
                  </div>

                  <div>
                    <Label>CTA Link</Label>
                    <Input
                      value={formData.cta_link}
                      onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                      placeholder="/pricing"
                    />
                  </div>

                  <div>
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.background_color}
                        onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.background_color}
                        onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                        placeholder="#EF233C"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.text_color}
                        onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.text_color}
                        onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label>Expires At</Label>
                    <Input
                      type="date"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingBanner ? "Update Banner" : "Create Banner"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No banners created yet. Create your first promotional banner!
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Promo Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((banner) => (
              <TableRow key={banner.id}>
                <TableCell>
                  <div 
                    className="w-24 h-8 rounded flex items-center justify-center text-xs font-bold"
                    style={{ 
                      backgroundColor: banner.background_color, 
                      color: banner.text_color 
                    }}
                  >
                    {banner.discount_text || "PROMO"}
                  </div>
                </TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {banner.title}
                </TableCell>
                <TableCell>
                  {banner.promo_code ? (
                    <Badge variant="secondary" className="font-mono">
                      {banner.promo_code}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {isExpired(banner.expires_at) ? (
                    <Badge variant="destructive">Expired</Badge>
                  ) : banner.is_active ? (
                    <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {banner.expires_at ? (
                    <span className={isExpired(banner.expires_at) ? "text-destructive" : ""}>
                      {new Date(banner.expires_at).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Never</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(banner.id, banner.is_active)}
                    >
                      {banner.is_active ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(banner)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBanner(banner.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Help text */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-semibold mb-2">💡 Tips:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Banners appear as a <strong>popup on the Pricing page</strong></li>
          <li>• Users can dismiss popups, they won't see the same one for 24 hours</li>
          <li>• Use eye-catching colors and compelling copy</li>
          <li>• Link promo codes to the pricing page for conversions</li>
          <li>• Toggle Active/Inactive to control visibility</li>
          <li>• Contact email for queries: <strong>inquo4@gmail.com</strong></li>
        </ul>
      </div>
    </Card>
  );
}
