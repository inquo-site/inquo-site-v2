import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Download, RefreshCw, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ToolTemplateProps {
  title: string;
  description: string;
  placeholder: string;
  toolType: string;
}

const ToolTemplate = ({ title, description, placeholder, toolType }: ToolTemplateProps) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

const sanitizeOutput = (raw: string) => {
  if (!raw) return raw;
  const trimmed = raw.trim();
  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    const lines = trimmed.split("\n");
    // drop opening fence (and optional language)
    lines.shift();
    // drop closing fence if present
    if (lines[lines.length - 1]?.trim() === "```") lines.pop();
    return lines.join("\n").trim();
  }
  return raw;
};

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to process",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setOutput("");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to use this tool",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("ai-tool", {
        body: { prompt: input, toolType },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      setOutput(sanitizeOutput(data.result));
      toast({
        title: "Success!",
        description: "Content generated successfully",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
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
              className="min-h-[300px] mb-4"
            />
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="min-h-[300px] p-4 bg-background/50 rounded-lg border overflow-auto">
              {output ? (
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
      </div>
    </div>
  );
};

export default ToolTemplate;
