import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Copy, Download, RefreshCw, Sparkles, Lock, ArrowLeft, ArrowRight, Zap, Upload, Image, FileText, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SEOHead } from "@/components/SEOHead";
import { getToolSeo } from "@/data/toolSeo";
import { ToolSeoSections } from "@/components/ToolSeoSections";
interface ToolTemplateProps {
  title: string;
  description: string;
  placeholder: string;
  toolType: string;
  isFree?: boolean;
}

interface RelatedTool {
  id: string;
  name: string;
  tool_type: string;
  route_path: string | null;
}

const ToolTemplate = ({ title, description, placeholder, toolType, isFree = true }: ToolTemplateProps) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatedTools, setRelatedTools] = useState<RelatedTool[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedPreviews, setUploadedPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    const previews: string[] = [];

    files.forEach((file) => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        return;
      }

      validFiles.push(file);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedPreviews((prev) => [...prev, event.target?.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        previews.push("");
      }
    });

    setUploadedFiles((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadedPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Fetch related tools
  useEffect(() => {
    const fetchRelatedTools = async () => {
      const { data } = await supabase
        .from('tools')
        .select('id, name, tool_type, route_path')
        .neq('tool_type', toolType)
        .limit(4);
      
      if (data) setRelatedTools(data);
    };
    fetchRelatedTools();
  }, [toolType]);

  const sanitizeOutput = (raw: string) => {
    if (!raw) return raw;
    const trimmed = raw.trim();
    if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
      const lines = trimmed.split("\n");
      lines.shift();
      if (lines[lines.length - 1]?.trim() === "```") lines.pop();
      return lines.join("\n").trim();
    }
    return raw;
  };

  // Check if user can access this tool
  const canAccess = () => {
    if (isFree) return true;
    if (!user || !profile) return false;
    return ['pro', 'yearly', 'lifetime'].includes(profile.plan);
  };

  const handleGenerate = async () => {
    if (!input.trim() && uploadedFiles.length === 0) {
      toast({
        title: "Input required",
        description: "Please enter some text or upload a file to process",
        variant: "destructive",
      });
      return;
    }

    // For premium tools, require login
    if (!isFree && !user) {
      toast({
        title: "Premium feature",
        description: "Please sign up for a Pro or Business plan to use this tool",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setOutput("");
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {};
      if (session) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      // Convert uploaded files to base64
      const filesData = await Promise.all(
        uploadedFiles.map(async (file) => ({
          name: file.name,
          type: file.type,
          data: await fileToBase64(file),
        }))
      );

      const { data, error: fnError } = await supabase.functions.invoke("ai-tool", {
        body: { 
          prompt: input, 
          toolType,
          files: filesData.length > 0 ? filesData : undefined
        },
        headers
      });

      if (fnError) throw fnError;

      if (data?.error) {
        throw new Error(data.error);
      }

      setOutput(sanitizeOutput(data.result));
      toast({
        title: "Success!",
        description: "Content generated successfully",
      });
    } catch (err: any) {
      console.error("Error:", err);
      const errorMessage = err.message || "Failed to generate content";
      setError(errorMessage);
      toast({
        title: "Generation failed",
        description: "Tool is loading, please try again in a moment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${toolType}-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Show upgrade prompt for premium tools
  if (!canAccess()) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-accent" />
          <h2 className="text-2xl font-bold mb-2">Premium Tool</h2>
          <p className="text-muted-foreground mb-6">
            {title} is a premium tool. Upgrade to Pro or Business plan to unlock unlimited access.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full bg-accent hover:bg-accent/90">
              <Link to="/pricing">View Plans</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tools
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      {(() => {
        const seo = getToolSeo(toolType, title, description);
        const canonical = `https://inquo.site/tool/${toolType}`;
        return (
          <SEOHead
            title={seo.title}
            description={seo.description}
            keywords={seo.keywords}
            canonicalUrl={canonical}
            schema={{
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "SoftwareApplication",
                  name: title,
                  applicationCategory: "ProductivityApplication",
                  operatingSystem: "Web",
                  description: seo.description,
                  url: canonical,
                  offers: {
                    "@type": "Offer",
                    price: isFree ? "0" : "4.99",
                    priceCurrency: "USD",
                  },
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: "4.8",
                    ratingCount: "1200",
                  },
                },
                {
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: "https://inquo.site/" },
                    { "@type": "ListItem", position: 2, name: "Tools", item: "https://inquo.site/dashboard" },
                    { "@type": "ListItem", position: 3, name: title, item: canonical },
                  ],
                },
                {
                  "@type": "FAQPage",
                  mainEntity: seo.faqs.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                },
                {
                  "@type": "HowTo",
                  name: `How to use ${title}`,
                  step: seo.howTo.map((s, i) => ({
                    "@type": "HowToStep",
                    position: i + 1,
                    name: s.name,
                    text: s.text,
                  })),
                },
              ],
            }}
          />
        );
      })()}
      <main className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm" className="mb-4">
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tools
              </Link>
            </Button>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-accent" />
              {title}
            </h1>
            <p className="text-muted-foreground">{description}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Input</h2>
              <Textarea
                placeholder={placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[200px] mb-4"
              />

              {/* File Upload Section */}
              <div className="mb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json"
                  multiple
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-dashed border-2 h-16 hover:border-accent hover:bg-accent/5"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Image or File
                  <span className="ml-2 text-xs text-muted-foreground">(Max 10MB)</span>
                </Button>

                {/* Uploaded Files Preview */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg border"
                      >
                        {file.type.startsWith("image/") && uploadedPreviews[index] ? (
                          <img
                            src={uploadedPreviews[index]}
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-accent/10 rounded flex items-center justify-center">
                            {file.type.startsWith("image/") ? (
                              <Image className="w-6 h-6 text-accent" />
                            ) : (
                              <FileText className="w-6 h-6 text-accent" />
                            )}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </Card>

            {/* Output Section */}
            <Card className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Output</h2>
                {output && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopy}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDownload}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="min-h-[300px] p-4 bg-background/50 rounded-lg border overflow-auto">
                {error ? (
                  <div className="text-center py-8">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button variant="outline" onClick={handleGenerate}>
                      Try Again
                    </Button>
                  </div>
                ) : output ? (
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-foreground" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 text-foreground" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 text-foreground" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4 text-foreground leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-primary" {...props} />,
                        em: ({node, ...props}) => <em className="italic text-foreground" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-foreground" {...props} />,
                        li: ({node, ...props}) => <li className="text-foreground" {...props} />,
                        code: ({node, inline, ...props}: any) => 
                          inline ? (
                            <code className="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props} />
                          ) : (
                            <code className="block bg-secondary p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4" {...props} />
                          ),
                        pre: ({node, ...props}) => <pre className="bg-secondary p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground" {...props} />,
                        a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
                      }}
                    >
                      {output}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    Your generated content will appear here...
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Try Other Tools Section - Internal Linking */}
          {relatedTools.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Zap className="w-6 h-6 text-accent" />
                    Try Other AI Tools
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Explore more powerful AI tools
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard">
                    View All 160+ Tools
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedTools.map((tool) => {
                  const path = tool.route_path || `/tool/${tool.tool_type}`;
                  return (
                    <Link key={tool.id} to={path}>
                      <Card className="p-4 hover:scale-105 transition-transform cursor-pointer border-2 hover:border-accent/50 group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                            <Sparkles className="w-5 h-5 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate group-hover:text-accent transition-colors">
                              {tool.name}
                            </h3>
                            <Badge variant="secondary" className="text-xs mt-1">
                              Try Now
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* CTA to Pricing */}
          <section className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-accent/10 to-primary/5 border border-accent/20 text-center">
            <h3 className="text-xl font-bold mb-2">Need Unlimited Access?</h3>
            <p className="text-muted-foreground mb-4">
              Upgrade to Pro for unlimited tool usage and premium features
            </p>
            <Button asChild className="bg-accent hover:bg-accent/90">
              <Link to="/pricing">
                View Pricing Plans
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </section>
        </div>
      </div>
    </>
  );
};

export default ToolTemplate;