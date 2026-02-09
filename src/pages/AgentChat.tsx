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
  Wrench, DollarSign, Pen, BarChart, Package, Trash2
} from "lucide-react";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  system_prompt: string;
  icon: string;
  is_premium: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Bot, Headphones, Target, Search, TrendingUp, FileText, Users, Scale,
  Wrench, DollarSign, Pen, BarChart, Package
};

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
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
        setAgent(data[0]);
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

  const createConversation = async () => {
    if (!user || !agentId) return null;

    try {
      const { data, error } = await supabase
        .from("agent_conversations")
        .insert({
          user_id: user.id,
          agent_id: agentId,
          title: `Chat with ${agent?.name || "Agent"}`
        })
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
      await supabase
        .from("agent_messages")
        .insert({
          conversation_id: convId,
          role,
          content
        });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    setSending(true);

    // Add user message to UI immediately
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // Create conversation if needed
      let convId = conversationId;
      if (!convId && user) {
        convId = await createConversation();
        setConversationId(convId);
      }

      // Save user message
      if (convId) {
        await saveMessage(convId, "user", userMessage);
      }

      // Build message history for context
      const messageHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Call AI with agent's system prompt
      const response = await supabase.functions.invoke("ai-tool", {
        body: {
          prompt: userMessage,
          toolType: "agent-chat",
          systemPrompt: agent?.system_prompt,
          messages: messageHistory
        }
      });

      if (response.error) throw response.error;

      const assistantContent = response.data?.result || response.data?.content || "I apologize, but I couldn't generate a response. Please try again.";

      // Add assistant message to UI
      const tempAssistantMsg: Message = {
        id: `temp-${Date.now()}-assistant`,
        role: "assistant",
        content: assistantContent,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempAssistantMsg]);

      // Save assistant message
      if (convId) {
        await saveMessage(convId, "assistant", assistantContent);
      }
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
    toast.success("Chat cleared");
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

  if (!agent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
                  {agent.is_premium && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      Pro
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{agent.description}</p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearChat}>
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 container mx-auto px-4 max-w-4xl">
        <ScrollArea className="h-[calc(100vh-280px)] py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="p-4 bg-primary/10 rounded-2xl mb-4">
                <IconComponent iconName={agent.icon} className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Chat with {agent.name}</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                {agent.description}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["How can you help me?", "What are your capabilities?", "Let's get started!"].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInput(suggestion);
                      textareaRef.current?.focus();
                    }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {suggestion}
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
                  <Avatar className={`w-8 h-8 ${message.role === "user" ? "bg-primary" : "bg-primary/10"}`}>
                    <AvatarFallback className={message.role === "user" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}>
                      {message.role === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <IconComponent iconName={agent.icon} className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
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
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${agent.name}...`}
              className="min-h-[52px] max-h-32 resize-none"
              rows={1}
              disabled={sending}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || sending}
              size="icon"
              className="h-[52px] w-[52px]"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            AI responses may not always be accurate. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;
