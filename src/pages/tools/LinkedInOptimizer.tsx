import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Sparkles, RefreshCw, Copy, Download, Linkedin,
  Briefcase, GraduationCap, MapPin, Award, CheckCircle2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SEOHead } from "@/components/SEOHead";

interface ProfileForm {
  fullName: string;
  username: string;
  tagline: string;
  location: string;
  hometown: string;
  currentRole: string;
  company: string;
  industry: string;
  yearsExperience: string;
  college: string;
  degree: string;
  graduationYear: string;
  skills: string;
  languages: string;
  experience: string;
  achievements: string;
  certifications: string;
  portfolio: string;
  website: string;
  github: string;
  twitter: string;
  email: string;
  phone: string;
  hobbies: string;
  volunteer: string;
  openTo: string;
  goals: string;
  tone: string;
}

const empty: ProfileForm = {
  fullName: "", username: "", tagline: "", location: "", hometown: "",
  currentRole: "", company: "", industry: "", yearsExperience: "",
  college: "", degree: "", graduationYear: "",
  skills: "", languages: "", experience: "", achievements: "", certifications: "",
  portfolio: "", website: "", github: "", twitter: "",
  email: "", phone: "", hobbies: "", volunteer: "",
  openTo: "Full-time roles, freelance projects, collaborations",
  goals: "", tone: "Professional & confident",
};

const LinkedInOptimizer = () => {
  const [form, setForm] = useState<ProfileForm>(empty);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const set = (k: keyof ProfileForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const initials = (form.fullName || "Your Name")
    .split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  const handleGenerate = async () => {
    if (!form.fullName.trim() || !form.skills.trim()) {
      toast({ title: "Add at least your name and skills", variant: "destructive" });
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const prompt = `Optimize this LinkedIn profile. Return clean markdown with these exact H2 sections in order:
## Headline
## About
## Featured Skills
## Experience Highlights
## Education
## Recommended Keywords
## 3 Engagement Post Ideas

Profile details:
- Full name: ${form.fullName}
- Username/handle: ${form.username || "(suggest one)"}
- Current tagline: ${form.tagline || "(none yet)"}
- Location: ${form.location || "Not specified"}
- Current role: ${form.currentRole || "Open to opportunities"}
- Company: ${form.company || "—"}
- College / University: ${form.college || "—"}
- Degree: ${form.degree || "—"}
- Skills: ${form.skills}
- Experience summary: ${form.experience || "—"}
- Achievements / awards: ${form.achievements || "—"}
- Portfolio / links: ${form.portfolio || "—"}
- Career goals: ${form.goals || "Grow professional network and opportunities"}
- Desired tone: ${form.tone}

Rules:
- Headline must be ONE punchy line under 220 chars with role | value | proof.
- About section first-person, 4–6 short paragraphs, recruiter-friendly, with a clear CTA.
- Skills as a comma list of 15–20 high-signal skills (no fluff).
- Experience as bullet points (action verb + metric + impact).
- Keywords as comma list optimised for LinkedIn search.`;

      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session) headers.Authorization = `Bearer ${session.access_token}`;

      const { data, error } = await supabase.functions.invoke("ai-tool", {
        body: { prompt, toolType: "linkedin" },
        headers,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setOutput(data.result || "");
      toast({ title: "Profile optimized!", description: "Scroll down to see your new LinkedIn-ready content." });
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message || "Try again in a moment", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copied to clipboard" });
  };
  const download = () => {
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${form.fullName || "linkedin"}-profile.md`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SEOHead
        title="LinkedIn Profile Optimizer — Free AI Tool | Inquo"
        description="Generate a recruiter-magnet LinkedIn headline, about section, skills, and experience bullets in seconds. Free AI LinkedIn optimizer."
        keywords="linkedin optimizer, linkedin headline generator, linkedin about generator, ai profile writer, free linkedin tool"
        canonicalUrl="https://inquo-site.lovable.app/tool/linkedin"
      />
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to="/dashboard"><ArrowLeft className="w-4 h-4 mr-2" />Back to Tools</Link>
          </Button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-[#0A66C2] flex items-center justify-center">
                <Linkedin className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">LinkedIn Optimizer</h1>
                <p className="text-muted-foreground">Turn your raw details into a magnetic, recruiter-ready profile.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* INPUT FORM */}
            <Card className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" /> Your Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Full Name *</Label><Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Suman Kumar" /></div>
                  <div><Label>Username</Label><Input value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="sumankumar" /></div>
                </div>
                <div><Label>Current Tagline / Bio</Label><Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Aspiring SWE | building AI products" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Location</Label><Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Purnea, Bihar" /></div>
                  <div><Label>Current Role</Label><Input value={form.currentRole} onChange={(e) => set("currentRole", e.target.value)} placeholder="Frontend Developer" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Company</Label><Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Inquo.site" /></div>
                  <div><Label>College / University</Label><Input value={form.college} onChange={(e) => set("college", e.target.value)} placeholder="IIT Delhi" /></div>
                </div>
                <div><Label>Degree</Label><Input value={form.degree} onChange={(e) => set("degree", e.target.value)} placeholder="B.Tech Computer Science" /></div>
                <div><Label>Skills * (comma-separated)</Label><Textarea rows={2} value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="React, TypeScript, Node.js, Supabase, AI..." /></div>
                <div><Label>Experience Summary</Label><Textarea rows={3} value={form.experience} onChange={(e) => set("experience", e.target.value)} placeholder="2 yrs building SaaS products, shipped 10+ tools..." /></div>
                <div><Label>Achievements / Awards</Label><Textarea rows={2} value={form.achievements} onChange={(e) => set("achievements", e.target.value)} placeholder="Hackathon winner, Top 1% on Kaggle..." /></div>
                <div><Label>Portfolio / Links</Label><Input value={form.portfolio} onChange={(e) => set("portfolio", e.target.value)} placeholder="github.com/you, your-site.com" /></div>
                <div><Label>Goals</Label><Input value={form.goals} onChange={(e) => set("goals", e.target.value)} placeholder="Land a senior SWE role at a product company" /></div>
                <div><Label>Tone</Label><Input value={form.tone} onChange={(e) => set("tone", e.target.value)} /></div>

                <Button onClick={handleGenerate} disabled={loading} className="w-full bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white">
                  {loading ? (<><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Optimizing your profile...</>)
                    : (<><Sparkles className="w-4 h-4 mr-2" /> Generate LinkedIn Profile</>)}
                </Button>
              </div>
            </Card>

            {/* LIVE LINKEDIN-STYLE PREVIEW */}
            <div className="space-y-6">
              <Card className="overflow-hidden border-2">
                <div className="h-24 bg-gradient-to-r from-[#0A66C2] via-[#0a4fa6] to-[#072e6b]" />
                <div className="px-6 pb-6 -mt-12">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-primary border-4 border-background flex items-center justify-center text-3xl font-bold text-background">
                    {initials}
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">{form.fullName || "Your Name"}</h3>
                      <CheckCircle2 className="w-5 h-5 text-[#0A66C2]" />
                    </div>
                    <p className="text-base text-foreground/90 mt-1">{form.tagline || form.currentRole || "Your headline will appear here"}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-2">
                      {form.location && (<span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{form.location}</span>)}
                      {form.company && (<span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{form.company}</span>)}
                      {form.college && (<span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{form.college}</span>)}
                    </div>
                    {form.skills && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {form.skills.split(",").slice(0, 8).map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{s.trim()}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2"><Award className="w-5 h-5 text-accent" /> Optimized Output</h2>
                  {output && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={copy}><Copy className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" onClick={download}><Download className="w-4 h-4" /></Button>
                    </div>
                  )}
                </div>
                <div className="min-h-[200px] max-h-[600px] overflow-auto p-4 bg-background/50 rounded-lg border">
                  {output ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({ ...p }) => <h2 className="text-lg font-bold mt-4 mb-2 text-accent border-b border-border pb-1" {...p} />,
                          p: ({ ...p }) => <p className="mb-3 leading-relaxed" {...p} />,
                          ul: ({ ...p }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...p} />,
                          strong: ({ ...p }) => <strong className="text-primary" {...p} />,
                        }}
                      >{output}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic text-sm">Fill the form on the left and click <strong>Generate</strong> — your headline, about, skills and experience will be crafted here.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LinkedInOptimizer;
