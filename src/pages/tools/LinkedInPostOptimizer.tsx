import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Sparkles, RefreshCw, Copy, Download, Linkedin, ThumbsUp, MessageCircle, Repeat2, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SEOHead } from "@/components/SEOHead";

interface PostForm {
  authorName: string;
  authorRole: string;
  topic: string;
  rawIdea: string;
  goal: string;
  audience: string;
  tone: string;
  hookStyle: string;
  cta: string;
  hashtags: string;
  length: string;
}

const empty: PostForm = {
  authorName: "", authorRole: "", topic: "", rawIdea: "",
  goal: "Engagement + reach", audience: "Founders, devs, recruiters",
  tone: "Confident, story-driven, human",
  hookStyle: "Bold one-liner that breaks the scroll",
  cta: "Comment your take", hashtags: "", length: "Medium (150-220 words)",
};

const LinkedInPostOptimizer = () => {
  const [form, setForm] = useState<PostForm>(empty);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const set = (k: keyof PostForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const initials = (form.authorName || "You").split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  const handleGenerate = async () => {
    if (!form.rawIdea.trim() && !form.topic.trim()) {
      toast({ title: "Add a topic or raw idea first", variant: "destructive" });
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const prompt = `You are a viral LinkedIn post writer. Rewrite the user's idea into a post that maximises engagement.

Return ONLY the final LinkedIn post text. No headers, no markdown sections, no commentary.

Rules:
- Open with a scroll-stopping hook on line 1.
- Short lines. Frequent line breaks. Easy to scan on mobile.
- 1 idea per paragraph. Use whitespace.
- Include 1 mini-story or concrete example.
- End with a clear CTA question to drive comments.
- Append 3-6 relevant hashtags on the last line.
- Stay under LinkedIn's 3000-char limit.

Author: ${form.authorName || "Anonymous"} — ${form.authorRole || "Professional"}
Topic: ${form.topic || "(infer from idea)"}
Raw idea / draft: ${form.rawIdea || "(none)"}
Goal: ${form.goal}
Target audience: ${form.audience}
Tone: ${form.tone}
Hook style: ${form.hookStyle}
CTA: ${form.cta}
Suggested hashtags: ${form.hashtags || "(suggest 3-6 high-signal ones)"}
Length: ${form.length}`;

      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session) headers.Authorization = `Bearer ${session.access_token}`;

      const { data, error } = await supabase.functions.invoke("ai-tool", {
        body: { prompt, toolType: "linkedin-post" },
        headers,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setOutput(data.result || "");
      toast({ title: "Post ready!", description: "Preview on the right looks just like LinkedIn." });
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message || "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copy = () => { navigator.clipboard.writeText(output); toast({ title: "Copied" }); };
  const download = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "linkedin-post.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SEOHead
        title="LinkedIn Post Optimizer — Viral Post Generator | Inquo"
        description="Turn a rough idea into a scroll-stopping LinkedIn post with the right hook, structure, CTA and hashtags. Free AI LinkedIn post writer."
        keywords="linkedin post generator, viral linkedin post, linkedin hook, linkedin post writer, ai linkedin content"
        canonicalUrl="https://inquo-site.lovable.app/tool/linkedin-post"
      />
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to="/dashboard"><ArrowLeft className="w-4 h-4 mr-2" />Back to Tools</Link>
          </Button>

          <div className="mb-8 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0A66C2] flex items-center justify-center">
              <Linkedin className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">LinkedIn Post Optimizer</h1>
              <p className="text-muted-foreground">Turn any idea into a scroll-stopping, comment-magnet post.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" /> Your Post
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Your Name</Label><Input value={form.authorName} onChange={(e) => set("authorName", e.target.value)} placeholder="Suman Kumar" /></div>
                  <div><Label>Your Role</Label><Input value={form.authorRole} onChange={(e) => set("authorRole", e.target.value)} placeholder="Founder @ Inquo" /></div>
                </div>
                <div><Label>Topic</Label><Input value={form.topic} onChange={(e) => set("topic", e.target.value)} placeholder="Why most AI startups fail in year 1" /></div>
                <div><Label>Raw idea / rough draft *</Label><Textarea rows={5} value={form.rawIdea} onChange={(e) => set("rawIdea", e.target.value)} placeholder="Write your raw thought here — even bullet points are fine. The AI will turn it into a polished post." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Goal</Label><Input value={form.goal} onChange={(e) => set("goal", e.target.value)} /></div>
                  <div><Label>Audience</Label><Input value={form.audience} onChange={(e) => set("audience", e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Tone</Label><Input value={form.tone} onChange={(e) => set("tone", e.target.value)} /></div>
                  <div><Label>Hook Style</Label><Input value={form.hookStyle} onChange={(e) => set("hookStyle", e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>CTA</Label><Input value={form.cta} onChange={(e) => set("cta", e.target.value)} /></div>
                  <div><Label>Length</Label><Input value={form.length} onChange={(e) => set("length", e.target.value)} /></div>
                </div>
                <div><Label>Hashtags (optional)</Label><Input value={form.hashtags} onChange={(e) => set("hashtags", e.target.value)} placeholder="#AI #Startup #BuildInPublic" /></div>

                <Button onClick={handleGenerate} disabled={loading} className="w-full bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white">
                  {loading ? (<><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Crafting your post...</>) : (<><Sparkles className="w-4 h-4 mr-2" /> Generate Post</>)}
                </Button>
              </div>
            </Card>

            {/* LIVE POST PREVIEW */}
            <Card className="overflow-hidden border-2 bg-white text-black">
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold">{initials}</div>
                  <div>
                    <p className="font-semibold text-sm">{form.authorName || "Your Name"}</p>
                    <p className="text-xs text-gray-500">{form.authorRole || "Your role"} • <span className="text-gray-400">Now • 🌐</span></p>
                  </div>
                </div>
              </div>
              <div className="p-4 min-h-[260px] whitespace-pre-wrap text-sm leading-relaxed">
                {output ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
                ) : (
                  <p className="text-gray-400 italic">Your polished LinkedIn post will appear here — formatted exactly like the real feed.</p>
                )}
              </div>
              <div className="flex justify-around items-center border-t py-2 text-gray-600 text-xs">
                <div className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> Like</div>
                <div className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> Comment</div>
                <div className="flex items-center gap-1"><Repeat2 className="w-4 h-4" /> Repost</div>
                <div className="flex items-center gap-1"><Send className="w-4 h-4" /> Send</div>
              </div>
              {output && (
                <div className="flex gap-2 p-3 border-t bg-gray-50">
                  <Button size="sm" variant="outline" onClick={copy}><Copy className="w-4 h-4 mr-1" /> Copy</Button>
                  <Button size="sm" variant="outline" onClick={download}><Download className="w-4 h-4 mr-1" /> Download</Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default LinkedInPostOptimizer;
