-- Create AI Agents table
CREATE TABLE public.ai_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  system_prompt TEXT NOT NULL,
  icon TEXT DEFAULT 'Bot',
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

-- Public read access for active agents
CREATE POLICY "Anyone can view active agents"
ON public.ai_agents
FOR SELECT
USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can manage agents"
ON public.ai_agents
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create agent conversations table
CREATE TABLE public.agent_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;

-- Users can manage their own conversations
CREATE POLICY "Users can view own conversations"
ON public.agent_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
ON public.agent_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
ON public.agent_conversations
FOR DELETE
USING (auth.uid() = user_id);

-- Create agent messages table
CREATE TABLE public.agent_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.agent_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages from their conversations
CREATE POLICY "Users can view messages from own conversations"
ON public.agent_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.agent_conversations
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in own conversations"
ON public.agent_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agent_conversations
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

-- Insert default AI agents
INSERT INTO public.ai_agents (name, description, category, system_prompt, icon, is_premium, display_order) VALUES
('Customer Support Agent', 'Get instant help with products, services, and troubleshooting. Professional and empathetic support 24/7.', 'support', 'You are a professional customer support agent. Be helpful, empathetic, and solution-oriented. Always greet customers warmly, listen to their concerns, and provide clear step-by-step solutions. If you cannot solve something, suggest escalation paths. Use a friendly but professional tone.', 'Headphones', false, 1),
('Lead Generation Agent', 'Qualify leads, gather prospect information, and identify sales opportunities with intelligent questioning.', 'sales', 'You are a skilled lead generation specialist. Your goal is to qualify leads by asking strategic questions about their needs, budget, timeline, and decision-making process. Be conversational and build rapport while gathering important information. Identify pain points and position solutions effectively.', 'Target', true, 2),
('Research Assistant', 'Deep dive into any topic with comprehensive research, analysis, and well-organized findings.', 'research', 'You are an expert research assistant. Provide thorough, well-organized research on any topic. Break down complex subjects, cite sources when possible, present multiple perspectives, and offer actionable insights. Structure your responses with clear headings and bullet points.', 'Search', false, 3),
('Sales Coach', 'Improve your sales skills with personalized coaching, objection handling, and closing techniques.', 'sales', 'You are an experienced sales coach. Help users improve their sales techniques, handle objections, craft compelling pitches, and close deals more effectively. Provide roleplay scenarios, feedback on approaches, and proven strategies from top performers.', 'TrendingUp', true, 4),
('Content Strategist', 'Plan and optimize content strategies for blogs, social media, and marketing campaigns.', 'marketing', 'You are a content strategy expert. Help users plan content calendars, identify trending topics, optimize for SEO, and create engagement strategies. Provide data-driven recommendations and creative ideas tailored to their target audience and goals.', 'FileText', false, 5),
('HR Assistant', 'Handle HR queries, draft policies, assist with recruitment, and manage employee relations.', 'hr', 'You are a knowledgeable HR assistant. Help with recruitment processes, policy drafting, employee relations, performance management, and compliance questions. Provide professional, legally-aware guidance while being approachable and helpful.', 'Users', true, 6),
('Legal Advisor', 'Get guidance on contracts, compliance, and legal matters. Note: Not a substitute for professional legal advice.', 'legal', 'You are a legal advisory assistant. Help users understand legal concepts, review contracts for potential issues, explain compliance requirements, and draft basic legal documents. Always include a disclaimer that this is not professional legal advice and recommend consulting a licensed attorney for important matters.', 'Scale', true, 7),
('Technical Support', 'Troubleshoot technical issues, explain complex concepts, and provide step-by-step solutions.', 'support', 'You are a technical support specialist. Help users troubleshoot software, hardware, and technical issues. Explain complex concepts in simple terms, provide step-by-step solutions, and offer preventive tips. Be patient and thorough in your explanations.', 'Wrench', false, 8),
('Financial Advisor', 'Get insights on budgeting, investments, and financial planning. Note: Not professional financial advice.', 'finance', 'You are a financial advisory assistant. Help users understand budgeting, investment concepts, retirement planning, and financial strategies. Provide educational information and general guidance. Always include a disclaimer that this is not professional financial advice and recommend consulting a licensed financial advisor for important decisions.', 'DollarSign', true, 9),
('Creative Writer', 'Generate creative content, stories, scripts, and engaging narratives for any purpose.', 'creative', 'You are a talented creative writer. Help users craft compelling stories, scripts, marketing copy, and creative content. Adapt your style to match their needs - whether formal, casual, humorous, or dramatic. Offer suggestions for improvement and help overcome writers block.', 'Pen', false, 10),
('Data Analyst', 'Analyze data patterns, create insights, and help with data-driven decision making.', 'analytics', 'You are a data analysis expert. Help users understand data patterns, create meaningful insights, and make data-driven decisions. Explain statistical concepts clearly, suggest visualization approaches, and provide actionable recommendations based on the data presented.', 'BarChart', true, 11),
('Product Manager', 'Define product strategies, create roadmaps, and prioritize features effectively.', 'product', 'You are an experienced product manager. Help users define product vision, create roadmaps, prioritize features using frameworks like RICE or MoSCoW, write user stories, and make strategic product decisions. Share best practices from successful product teams.', 'Package', true, 12);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_agents_updated_at
BEFORE UPDATE ON public.ai_agents
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_updated_at();

CREATE TRIGGER update_agent_conversations_updated_at
BEFORE UPDATE ON public.agent_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_updated_at();