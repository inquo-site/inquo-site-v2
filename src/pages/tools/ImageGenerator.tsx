import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, RefreshCw, Sparkles } from "lucide-react";

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter an image description",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
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

      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      setImageUrl(data.imageUrl);
      toast({
        title: "Success!",
        description: "Image generated successfully",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "ai-generated-image.png";
    a.click();
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-accent" />
            AI Image Generator
          </h1>
          <p className="text-muted-foreground">
            Create stunning images from text descriptions using OpenAI's gpt-image-1
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Prompt</h2>
            <Textarea
              placeholder="Describe the image you want to create (e.g., 'A futuristic city at sunset with flying cars')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[200px] mb-4"
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
                  Generate Image
                </>
              )}
            </Button>
          </Card>

          {/* Output Section */}
          <Card className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Generated Image</h2>
              {imageUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="min-h-[400px] flex items-center justify-center bg-background/50 rounded-lg border">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Generated"
                  className="max-w-full h-auto rounded-lg"
                />
              ) : (
                <p className="text-muted-foreground italic text-center p-8">
                  Your generated image will appear here...
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
