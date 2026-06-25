import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, RefreshCw, Megaphone } from "lucide-react";

interface CustomAd {
  id: string;
  title: string;
  description: string | null;
  cta_text: string;
  cta_link: string;
  background_gradient: string | null;
  is_active: boolean;
  display_order: number;
  html_code?: string | null;
}

const blank = {
  title: "",
  description: "",
  cta_text: "Learn More",
  cta_link: "/",
  background_gradient: "from-primary to-accent",
  is_active: true,
  display_order: 0,
  html_code: "",
};

const HTML_TEMPLATE = `<div style="padding:24px;background:linear-gradient(135deg,#0A66C2,#7c3aed);color:#fff;font-family:system-ui">
  <div style="font-size:11px;letter-spacing:.2em;opacity:.8">🔥 LIMITED OFFER</div>
  <h3 style="margin:6px 0;font-size:22px;font-weight:800">Your Custom Headline</h3>
  <p style="margin:0 0 12px;font-size:14px;opacity:.9">Describe the offer in one sharp line.</p>
  <a href="/pricing" style="display:inline-block;padding:8px 16px;background:#fff;color:#000;font-weight:700;border-radius:999px;text-decoration:none">Grab Deal →</a>
</div>`;

export default function CustomAdManagement() {
  const [ads, setAds] = useState<CustomAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<typeof blank>(blank);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("custom_ads")
      .select("*")
      .order("display_order");
    if (!error) setAds(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title || !form.cta_link) {
      toast({ title: "Title & CTA link required", variant: "destructive" });
      return;
    }
    const { error } = await (supabase as any).from("custom_ads").insert(form);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Ad created!" });
    setForm(blank);
    load();
  };

  const toggle = async (ad: CustomAd) => {
    await (supabase as any).from("custom_ads").update({ is_active: !ad.is_active }).eq("id", ad.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this ad?")) return;
    await (supabase as any).from("custom_ads").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Create Promo Banner Slide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="New: LinkedIn Optimizer" /></div>
          <div><Label>CTA Link *</Label><Input value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} placeholder="/tool/linkedin" /></div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Build a recruiter-magnet profile in 30 seconds." /></div>
          <div><Label>CTA Text</Label><Input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} /></div>
          <div><Label>Background gradient (Tailwind)</Label><Input value={form.background_gradient} onChange={(e) => setForm({ ...form, background_gradient: e.target.value })} placeholder="from-[#0A66C2] via-[#1e40af] to-[#7c3aed]" /></div>
          <div><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
          <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
        </div>
        <Button onClick={create} className="mt-4"><Plus className="w-4 h-4 mr-2" /> Create Ad</Button>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2"><Megaphone className="w-5 h-5" /> Active Ads ({ads.length})</h3>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></Button>
        </div>
        {ads.length === 0 ? (
          <p className="text-muted-foreground text-sm">No custom ads yet. Tools auto-rotate as default content.</p>
        ) : (
          <div className="space-y-3">
            {ads.map((ad) => (
              <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{ad.title}</h4>
                    <Badge variant={ad.is_active ? "default" : "secondary"}>{ad.is_active ? "Live" : "Paused"}</Badge>
                    <Badge variant="outline">#{ad.display_order}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{ad.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">→ {ad.cta_link}</p>
                </div>
                <div className="flex gap-2">
                  <Switch checked={ad.is_active} onCheckedChange={() => toggle(ad)} />
                  <Button size="sm" variant="ghost" onClick={() => remove(ad.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
