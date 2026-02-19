
-- Allow admins to update agent subscriptions
CREATE POLICY "Admins can update agent subscriptions"
ON public.agent_subscriptions FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete agent subscriptions
CREATE POLICY "Admins can delete agent subscriptions"
ON public.agent_subscriptions FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
