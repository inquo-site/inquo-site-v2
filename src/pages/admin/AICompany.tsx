import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Crown, Trash2, Sparkles, RefreshCw } from "lucide-react";

interface Directive {
  id: string;
  directive: string;
  ceo_plan: any;
  team_outputs: any;
  final_report: string | null;
  status: string;
  error: string | null;
  created_at: string;
}

const TEAM_BADGES: Record<string, string> = {
  marketing: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  content: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  engineering: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  design: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  support: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  analytics: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  sales: "bg-red-500/20 text-red-300 border-red-500/40",
  operations: "bg-slate-500/20 text-slate-300 border-slate-500/40",
};

export default function AICompany() {
  const { toast } = useToast();
  const [directive, setDirective] = useState("");
  const [running, setRunning] = useState(false);
  const [list, setList] = useState<Directive[]>([]);
  const [selected, setSelected] = useState<Directive | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("company_directives" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setList((data as any) || []);
    if (data && data[0] && !selected) setSelected(data[0] as any);
  };

  useEffect(() => {
    load();
  }, []);

  const run = async () => {
    if (!directive.trim()) return;
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-company", {
        body: { directive },
      });
      if (error) throw error;
      toast({ title: "Directive executed", description: "Team has delivered." });
      setDirective("");
      await load();
      if (data?.id) {
        const fresh = await supabase
          .from("company_directives" as any)
          .select("*")
          .eq("id", data.id)
          .single();
        if (fresh.data) setSelected(fresh.data as any);
      }
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const del = async (id: string) => {
    await supabase.from("company_directives" as any).delete().eq("id", id);
    if (selected?.id === id) setSelected(null);
    await load();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
        <div className="flex items-start gap-3 mb-4">
          <Crown className="w-8 h-8 text-amber-400 mt-1" />
          <div>
            <h2 className="text-2xl font-bold">Founder's Desk</h2>
            <p className="text-sm text-muted-foreground">
              Give one directive. Your internal CEO will plan it and dispatch the right departments (Marketing, Content, Engineering, Design, Support, Analytics, Sales, Operations).
            </p>
          </div>
        </div>

        <Textarea
          value={directive}
          onChange={(e) => setDirective(e.target.value)}
          placeholder="e.g. Launch the new LinkedIn Optimizer this week — I want traffic, a blog post, an in-app banner, and an outreach plan."
          rows={4}
          className="mb-3"
        />
        <div className="flex gap-2">
          <Button onClick={run} disabled={running || !directive.trim()} className="bg-amber-500 text-black hover:bg-amber-400">
            {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {running ? "Team working..." : "Dispatch to team"}
          </Button>
          <Button variant="outline" onClick={load} disabled={running}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-1">
          <h3 className="font-semibold mb-3">Recent directives</h3>
          <ScrollArea className="h-[500px] pr-2">
            <div className="space-y-2">
              {list.length === 0 && <p className="text-sm text-muted-foreground">No directives yet.</p>}
              {list.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    selected?.id === d.id ? "border-amber-500/60 bg-amber-500/5" : "border-border hover:border-amber-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm line-clamp-2 flex-1">{d.directive}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        del(d.id);
                      }}
                      className="text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px]">{d.status}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(d.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="p-6 lg:col-span-2">
          {!selected ? (
            <p className="text-muted-foreground text-center py-12">Select a directive to view the team's work.</p>
          ) : (
            <ScrollArea className="h-[500px] pr-3">
              <div className="space-y-5">
                <div>
                  <Badge className="mb-2 bg-amber-500/20 text-amber-300 border-amber-500/40">Directive</Badge>
                  <p className="text-base">{selected.directive}</p>
                </div>

                {selected.ceo_plan && (
                  <div>
                    <Badge className="mb-2 bg-amber-500/20 text-amber-300 border-amber-500/40">
                      <Crown className="w-3 h-3 mr-1" /> CEO Plan
                    </Badge>
                    <p className="text-sm text-muted-foreground mb-2">{selected.ceo_plan.summary}</p>
                    <ul className="space-y-1.5 text-sm">
                      {(selected.ceo_plan.tasks || []).map((t: any, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <Badge variant="outline" className={`text-[10px] ${TEAM_BADGES[t.department] || ""}`}>
                            {t.department}
                          </Badge>
                          <span className="flex-1">{t.task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.team_outputs && Array.isArray(selected.team_outputs) && (
                  <div className="space-y-4">
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40">Department Deliverables</Badge>
                    {selected.team_outputs.map((o: any, i: number) => (
                      <div key={i} className="border border-border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={`text-[10px] ${TEAM_BADGES[o.department] || ""}`}>
                            {o.title || o.department}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{o.task}</span>
                        </div>
                        <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{o.output}</pre>
                      </div>
                    ))}
                  </div>
                )}

                {selected.final_report && (
                  <div>
                    <Badge className="mb-2 bg-amber-500/20 text-amber-300 border-amber-500/40">CEO Report</Badge>
                    <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed bg-card/50 p-4 rounded-lg border">
                      {selected.final_report}
                    </pre>
                  </div>
                )}

                {selected.error && (
                  <div className="text-sm text-red-400">Error: {selected.error}</div>
                )}
              </div>
            </ScrollArea>
          )}
        </Card>
      </div>
    </div>
  );
}
