import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ToolTemplate from "@/components/ToolTemplate";
import { Loader2 } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  tool_type: string;
}

const DynamicTool = () => {
  const { toolType } = useParams<{ toolType: string }>();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTool = async () => {
      if (!toolType) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('tools')
          .select('id, name, description, tool_type')
          .eq('tool_type', toolType)
          .single();

        if (error) throw error;

        setTool(data);
      } catch (error: any) {
        console.error('Error fetching tool:', error);
        toast({
          title: "Error",
          description: "Failed to load tool information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [toolType, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!tool) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ToolTemplate
      title={tool.name}
      description={tool.description}
      placeholder={`Enter your ${tool.name.toLowerCase()} prompt here...`}
      toolType={tool.tool_type}
    />
  );
};

export default DynamicTool;
