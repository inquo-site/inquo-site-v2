
-- Add agent_id to payment_requests to track agent purchases
ALTER TABLE public.payment_requests ADD COLUMN agent_id uuid REFERENCES public.ai_agents(id);
