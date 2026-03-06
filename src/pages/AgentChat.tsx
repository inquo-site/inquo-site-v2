import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { 
  Bot, Send, ArrowLeft, Loader2, User, Crown, Sparkles,
  Headphones, Target, Search, TrendingUp, FileText, Users, Scale, 
  Wrench, DollarSign, Pen, BarChart, Package, Trash2, Copy, Download,
  CheckCircle2, Zap, Lock, Paperclip, Image, File, X, LinkIcon,
  Brain, Globe, FileSearch, Database, ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  system_prompt: string;
  icon: string;
  is_premium: boolean;
  monthly_price: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  attachments?: AttachedFile[];
}

interface AttachedFile {
  name: string;
  type: string;
  size: number;
  data: string;
  preview?: string;
}

interface MemoryItem {
  key: string;
  value: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Bot, Headphones, Target, Search, TrendingUp, FileText, Users, Scale,
  Wrench, DollarSign, Pen, BarChart, Package
};

const agentTaskSuggestions: Record<string, string[]> = {
  "Customer Support Agent": [
    "Draft a response for a customer complaining about late delivery",
    "Create a FAQ document for our SaaS product returns policy",
    "Write an apology email for a service outage"
  ],
  "Lead Generation Agent": [
    "Create a 5-email cold outreach sequence for a B2B SaaS product",
    "Build an ideal customer profile for an AI writing tool",
    "Generate a lead scoring rubric for our sales team"
  ],
  "Research Assistant": [
    "Write a competitive analysis report on AI content tools",
    "Research market trends in the Indian EdTech sector for 2026",
    "Create a comparison matrix of top 5 CRM platforms"
  ],
  "Sales Coach": [
    "Create a sales pitch script for an AI-powered analytics tool",
    "Build an objection handling playbook for enterprise software",
    "Write a competitive battle card vs. our top 3 competitors"
  ],
  "Content Strategist": [
    "Create a 30-day content calendar for a tech startup on LinkedIn",
    "Write 10 Instagram posts for a fitness brand launch",
    "Generate SEO keyword clusters for 'AI productivity tools'"
  ],
  "HR Assistant": [
    "Draft a job description for a Senior Full Stack Developer",
    "Create an interview question set for a Product Manager role",
    "Build a complete employee onboarding checklist"
  ],
  "Legal Advisor": [
    "Draft a freelancer service agreement template",
    "Create a privacy policy for a mobile app",
    "Write an NDA template for business partnerships"
  ],
  "Technical Support": [
    "Create a troubleshooting guide for API integration issues",
    "Write a knowledge base article for password reset flow",
    "Build a diagnostic checklist for app performance issues"
  ],
  "Financial Advisor": [
    "Create a monthly budget plan for a startup with $50K revenue",
    "Build an investment comparison analysis: stocks vs mutual funds vs FDs",
    "Generate a 12-month financial projection for a SaaS business"
  ],
  "Creative Writer": [
    "Write a 1000-word blog post about the future of AI in education",
    "Create a complete social media campaign for a product launch",
    "Write a 3-minute video script for a brand story"
  ],
  "Data Analyst": [
    "Create a KPI dashboard framework for an e-commerce business",
    "Write an analysis report template for monthly sales data",
    "Build a data-driven marketing strategy document"
  ],
  "Product Manager": [
    "Write a complete PRD for a user notification feature",
    "Create user stories with acceptance criteria for a checkout flow",
    "Build a feature prioritization matrix using RICE framework"
  ],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;
const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'text/plain', 'text/csv', 'text/markdown',
  'application/json',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const AgentChat = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
  const [showMemory, setShowMemory] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'deepseek' | 'chatgpt'>('gemini');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (agentId) {
      fetchAgent();
      if (user) {
        checkAccess();
        loadMemory();
      }
    }
  }, [agentId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const loadMemory = async () => {
    if (!user || !agentId) return;
    try {
      const { data, error } = await supabase
        .from("agent_memory" as any)
        .select("key, value")
        .eq("user_id", user.id)
        .eq("agent_id", agentId)
        .order("updated_at", { ascending: false });

      if (!error && data) {
        setMemoryItems((data as any[]).map((d: any) => ({ key: d.key, value: d.value })));
      }
    } catch (e) {
      console.error("Error loading memory:", e);
    }
  };

  const clearMemory = async () => {
    if (!user || !agentId) return;
    try {
      await supabase
        .from("agent_memory" as any)
        .delete()
        .eq("user_id", user.id)
        .eq("agent_id", agentId);
      setMemoryItems([]);
      toast.success("Memory cleared");
    } catch (e) {
      toast.error("Failed to clear memory");
    }
  };

  const fetchAgent = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("id", agentId)
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        const a = data[0] as Agent;
        setAgent(a);
        if (a.monthly_price === 0) setHasAccess(true);
      } else {
        toast.error("Agent not found");
        navigate("/agents");
      }
    } catch (error) {
      console.error("Error fetching agent:", error);
      toast.error("Failed to load agent");
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = async () => {
    if (!user || !agentId) return;
    try {
      const { data, error } = await supabase
        .from("agent_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("agent_id", agentId)
        .eq("status", "active")
        .limit(1);

      if (!error && data && data.length > 0) {
        setHasAccess(true);
      }
    } catch (error) {
      console.error("Error checking access:", error);
    }
  };

  const createConversation = async () => {
    if (!user || !agentId) return null;
    try {
      const { data, error } = await supabase
        .from("agent_conversations")
        .insert({ user_id: user.id, agent_id: agentId, title: `Task with ${agent?.name || "Agent"}` })
        .select()
        .single();
      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  };

  const saveMessage = async (convId: string, role: "user" | "assistant", content: string) => {
    try {
      await supabase.from("agent_messages").insert({ conversation_id: convId, role, content });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processFiles = (selectedFiles: File[]) => {
    if (attachedFiles.length + selectedFiles.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    selectedFiles.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newFile: AttachedFile = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: dataUrl,
          preview: file.type.startsWith('image/') ? dataUrl : undefined,
        };
        setAttachedFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    if (!linkInput.trim()) return;
    const url = linkInput.trim();
    setInput(prev => prev ? `${prev}\n\n🔗 Reference Link: ${url}` : `🔗 Reference Link: ${url}`);
    setLinkInput("");
    setShowLinkInput(false);
    toast.success("Link added to message");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  // Extract memory from response and save
  const extractAndSaveMemory = async (responseText: string) => {
    const memoryMatch = responseText.match(/<MEMORY>([\s\S]*?)<\/MEMORY>/);
    if (memoryMatch && user && agentId) {
      const memoryLines = memoryMatch[1].trim().split('\n').filter(l => l.trim());
      const memories = memoryLines.map(line => {
        const [key, ...valueParts] = line.split(':');
        return { key: key.trim(), value: valueParts.join(':').trim() };
      }).filter(m => m.key && m.value);

      if (memories.length > 0) {
        // Save to DB via direct insert/upsert
        for (const mem of memories) {
          await supabase
            .from("agent_memory" as any)
            .upsert(
              { user_id: user.id, agent_id: agentId, key: mem.key, value: mem.value, updated_at: new Date().toISOString() } as any,
              { onConflict: 'user_id,agent_id,key' } as any
            );
        }
        // Update local state
        setMemoryItems(prev => {
          const updated = [...prev];
          for (const mem of memories) {
            const idx = updated.findIndex(m => m.key === mem.key);
            if (idx >= 0) updated[idx] = mem;
            else updated.push(mem);
          }
          return updated;
        });
      }
    }
    // Return cleaned content without memory block
    return responseText.replace(/<MEMORY>[\s\S]*?<\/MEMORY>/g, '').trim();
  };

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || sending) return;

    if (!hasAccess) {
      toast.error("Please subscribe to this agent to start working");
      navigate("/agents");
      return;
    }

    const userMessage = input.trim();
    const currentFiles = [...attachedFiles];
    setInput("");
    setAttachedFiles([]);
    setSending(true);

    const displayContent = userMessage + (currentFiles.length > 0 
      ? `\n\n📎 ${currentFiles.length} file(s) attached: ${currentFiles.map(f => f.name).join(', ')}`
      : '');

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: displayContent,
      created_at: new Date().toISOString(),
      attachments: currentFiles,
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      let convId = conversationId;
      if (!convId && user) {
        convId = await createConversation();
        setConversationId(convId);
      }
      if (convId) await saveMessage(convId, "user", displayContent);

      const messageHistory = messages.map(m => ({ role: m.role, content: m.content }));

      const filesPayload = currentFiles.map(f => ({
        name: f.name,
        type: f.type,
        data: f.data,
      }));

      const requestBody = {
        prompt: userMessage || "Analyze the attached files and provide detailed insights based on the content.",
        toolType: "agent-chat",
        systemPrompt: agent?.system_prompt,
        messages: messageHistory,
        files: filesPayload.length > 0 ? filesPayload : undefined,
        stream: true,
        agentId: agentId,
        webSearch: webSearchEnabled,
        selectedModel: selectedModel,
      };

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tool`;
      const session = (await supabase.auth.getSession()).data.session;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";
      let streamDone = false;

      const assistantMsgId = `temp-${Date.now()}-assistant`;
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: "assistant" as const,
        content: "",
        created_at: new Date().toISOString(),
      }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              // Show content without memory block in real-time
              const displayContent = assistantSoFar.replace(/<MEMORY>[\s\S]*?<\/MEMORY>/g, '').trim();
              setMessages(prev =>
                prev.map(m => m.id === assistantMsgId ? { ...m, content: displayContent } : m)
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
            }
          } catch { /* ignore */ }
        }
      }

      // Extract memory and clean response
      const cleanedContent = await extractAndSaveMemory(assistantSoFar);
      setMessages(prev =>
        prev.map(m => m.id === assistantMsgId ? { ...m, content: cleanedContent } : m)
      );

      if (convId) await saveMessage(convId, "assistant", cleanedContent);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get response. Please try again.");
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
    setAttachedFiles([]);
    toast.success("Chat cleared");
  };

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const IconComponent = ({ iconName, className }: { iconName: string; className?: string }) => {
    const Icon = iconMap[iconName] || Bot;
    return <Icon className={className} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) return null;

  const suggestions = agentTaskSuggestions[agent.name] || [
    "What can you do for me?",
    "Help me with a task",
    "Show me your capabilities"
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col" onDrop={handleDrop} onDragOver={handleDragOver}>
      <Navbar />
      
      {/* Agent Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-16 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/agents")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="p-2 bg-primary/10 rounded-lg">
                <IconComponent iconName={agent.icon} className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold">{agent.name}</h1>
                  {hasAccess ? (
                    <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-600">
                      <Zap className="w-3 h-3 mr-0.5" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px]">
                      <Lock className="w-3 h-3 mr-0.5" /> Locked
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{agent.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Capabilities badges */}
              <div className="hidden md:flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Brain className="w-3 h-3" /> Memory
                  {memoryItems.length > 0 && <span className="text-primary">({memoryItems.length})</span>}
                </Badge>
                <Badge variant="outline" className="text-[10px] gap-1">
                  <FileSearch className="w-3 h-3" /> Docs
                </Badge>
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Globe className="w-3 h-3" /> Search
                </Badge>
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Wrench className="w-3 h-3" /> Tools
                </Badge>
              </div>
              {messages.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearChat}>
                  <Trash2 className="w-4 h-4 mr-1" /> New Task
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Memory Panel */}
      {showMemory && memoryItems.length > 0 && (
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-3 max-w-4xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Brain className="w-4 h-4 text-primary" />
                Agent Memory ({memoryItems.length} items)
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearMemory}>
                  <Trash2 className="w-3 h-3 mr-1" /> Clear Memory
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowMemory(false)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {memoryItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-background/60 rounded-lg px-3 py-2 text-xs border">
                  <Database className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">{item.key}:</span>{" "}
                    <span className="text-muted-foreground">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 container mx-auto px-4 max-w-4xl">
        <ScrollArea className="h-[calc(100vh-320px)] py-6">
          {!hasAccess ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="p-4 bg-destructive/10 rounded-2xl mb-4">
                <Lock className="w-12 h-12 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Subscribe to {agent.name}</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Get full access to this autonomous agent and all its deliverables.
              </p>
              <Button onClick={() => navigate("/agents")} size="lg">
                <Crown className="w-5 h-5 mr-2" /> View Plans & Subscribe
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="p-4 bg-primary/10 rounded-2xl mb-4">
                <IconComponent iconName={agent.icon} className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{agent.name}</h2>
              <p className="text-muted-foreground max-w-md mb-2">{agent.description}</p>
              <p className="text-sm text-primary font-medium mb-3">
                Tell me what to do — I'll produce complete, ready-to-use deliverables.
              </p>
              
              {/* Capabilities Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 w-full max-w-lg">
                <div className="flex flex-col items-center gap-1 p-3 rounded-lg border bg-card text-xs">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="font-medium">Memory</span>
                  <span className="text-muted-foreground text-[10px]">Remembers you</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-3 rounded-lg border bg-card text-xs">
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="font-medium">Web Search</span>
                  <span className="text-muted-foreground text-[10px]">Real-time info</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-3 rounded-lg border bg-card text-xs">
                  <FileSearch className="w-5 h-5 text-primary" />
                  <span className="font-medium">Doc Analysis</span>
                  <span className="text-muted-foreground text-[10px]">Files & images</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-3 rounded-lg border bg-card text-xs">
                  <Wrench className="w-5 h-5 text-primary" />
                  <span className="font-medium">Pro Tools</span>
                  <span className="text-muted-foreground text-[10px]">Tables & plans</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-lg">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Quick Tasks</p>
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    className="text-left justify-start h-auto py-3 px-4 whitespace-normal"
                    onClick={() => {
                      setInput(suggestion);
                      textareaRef.current?.focus();
                    }}
                  >
                    <Zap className="w-4 h-4 mr-2 shrink-0 text-primary" />
                    <span className="text-sm">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className={`w-8 h-8 shrink-0 ${message.role === "user" ? "bg-primary" : "bg-primary/10"}`}>
                    <AvatarFallback className={message.role === "user" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}>
                      {message.role === "user" ? <User className="w-4 h-4" /> : <IconComponent iconName={agent.icon} className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[85%]">
                    {/* Show image previews for user messages with attachments */}
                    {message.role === "user" && message.attachments && message.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2 justify-end">
                        {message.attachments.map((file, idx) => (
                          <div key={idx} className="rounded-lg overflow-hidden border bg-muted">
                            {file.preview ? (
                              <img src={file.preview} alt={file.name} className="max-w-[200px] max-h-[150px] object-cover" />
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-2 text-xs">
                                {getFileIcon(file.type)}
                                <span className="max-w-[120px] truncate">{file.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    {message.role === "assistant" && (
                      <div className="flex gap-2 mt-2 ml-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={() => copyToClipboard(message.content, message.id)}>
                          {copiedId === message.id ? <><CheckCircle2 className="w-3 h-3 text-green-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={() => downloadAsFile(message.content, `${agent.name.replace(/\s+/g, '-').toLowerCase()}-output.md`)}>
                          <Download className="w-3 h-3" /> Download
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 bg-primary/10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <IconComponent iconName={agent.icon} className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Working on your task...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          {/* Attached files preview */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm border">
                  {file.preview ? (
                    <img src={file.preview} alt={file.name} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    getFileIcon(file.type)
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-medium max-w-[120px] truncate">{file.name}</span>
                    <span className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={() => removeFile(idx)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Link input */}
          {showLinkInput && (
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="Paste a link (e.g. https://example.com/doc)"
                className="flex-1 px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddLink(); }}
              />
              <Button size="sm" onClick={handleAddLink} disabled={!linkInput.trim()}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowLinkInput(false); setLinkInput(""); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex gap-2 items-end">
            {/* Attachment & feature buttons */}
            <div className="flex gap-1 pb-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending || !hasAccess || attachedFiles.length >= MAX_FILES}
                title="Attach files"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setShowLinkInput(!showLinkInput)}
                disabled={sending || !hasAccess}
                title="Add link"
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={webSearchEnabled ? "default" : "ghost"}
                size="icon"
                className={`h-9 w-9 ${webSearchEnabled ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => {
                  setWebSearchEnabled(!webSearchEnabled);
                  toast.success(webSearchEnabled ? "Web search disabled" : "Web search enabled");
                }}
                disabled={sending || !hasAccess}
                title="Toggle web search"
              >
                <Globe className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${memoryItems.length > 0 ? 'text-primary' : ''}`}
                onClick={() => setShowMemory(!showMemory)}
                disabled={!hasAccess}
                title={`Memory (${memoryItems.length} items)`}
              >
                <Brain className="w-4 h-4" />
              </Button>

              {/* Model Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs gap-1 px-2"
                    disabled={sending || !hasAccess}
                  >
                    {selectedModel === 'gemini' && '✨ Gemini'}
                    {selectedModel === 'deepseek' && '🐋 DeepSeek'}
                    {selectedModel === 'chatgpt' && '🤖 ChatGPT'}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => { setSelectedModel('gemini'); toast.success('Model: Gemini'); }}>
                    ✨ Gemini Flash
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSelectedModel('deepseek'); toast.success('Model: DeepSeek'); }}>
                    🐋 DeepSeek
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSelectedModel('chatgpt'); toast.success('Model: ChatGPT'); }}>
                    🤖 ChatGPT
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasAccess ? `Give ${agent.name} a task... (attach files, images, docs for context)` : "Subscribe to start working with this agent"}
              className="min-h-[52px] max-h-32 resize-none flex-1"
              rows={1}
              disabled={sending || !hasAccess}
            />
            <Button 
              onClick={handleSend} 
              disabled={(!input.trim() && attachedFiles.length === 0) || sending || !hasAccess} 
              size="icon" 
              className="h-[52px] w-[52px]"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {hasAccess 
              ? `🧠 Memory${memoryItems.length > 0 ? ` (${memoryItems.length})` : ''} • 🔍 ${webSearchEnabled ? 'Search ON' : 'Search OFF'} • 📎 Files • 🔗 Links • ${selectedModel === 'gemini' ? '✨ Gemini' : selectedModel === 'deepseek' ? '🐋 DeepSeek' : '🤖 ChatGPT'}` 
              : "Subscribe to unlock this agent's capabilities."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;
