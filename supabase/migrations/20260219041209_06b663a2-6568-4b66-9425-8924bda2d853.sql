
-- Add pricing columns to ai_agents
ALTER TABLE public.ai_agents 
ADD COLUMN monthly_price INTEGER DEFAULT 0,
ADD COLUMN one_time_price INTEGER DEFAULT 0,
ADD COLUMN yearly_price INTEGER DEFAULT 0,
ADD COLUMN usd_monthly_price INTEGER DEFAULT 0,
ADD COLUMN usd_one_time_price INTEGER DEFAULT 0,
ADD COLUMN usd_yearly_price INTEGER DEFAULT 0;

-- Create agent_subscriptions table to track per-agent purchases
CREATE TABLE public.agent_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  purchase_type TEXT NOT NULL DEFAULT 'monthly' CHECK (purchase_type IN ('monthly', 'yearly', 'lifetime')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own agent subscriptions"
ON public.agent_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own subscriptions
CREATE POLICY "Users can create agent subscriptions"
ON public.agent_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage agent subscriptions"
ON public.agent_subscriptions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
