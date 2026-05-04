
-- Drop the previously created view (was flagged as SECURITY DEFINER)
DROP VIEW IF EXISTS public.ai_agents_public;

-- Restore public-facing SELECT policy so clients can list active agents
DROP POLICY IF EXISTS "Anyone can view active agents" ON public.ai_agents;
CREATE POLICY "Anyone can view active agents"
ON public.ai_agents FOR SELECT
USING (is_active = true);

-- Use column-level privileges to hide system_prompt from regular users.
-- Edge Functions use the service_role key, which bypasses column GRANTs.
REVOKE SELECT ON public.ai_agents FROM anon, authenticated;

GRANT SELECT (
  id, name, description, category, icon, is_premium, is_active,
  monthly_price, yearly_price, one_time_price,
  usd_monthly_price, usd_yearly_price, usd_one_time_price,
  display_order, created_at, updated_at
) ON public.ai_agents TO anon, authenticated;
