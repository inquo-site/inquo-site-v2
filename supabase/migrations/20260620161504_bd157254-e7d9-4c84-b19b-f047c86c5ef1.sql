
-- 1) Re-revoke column-level access to system_prompt on ai_agents
REVOKE SELECT (system_prompt) ON public.ai_agents FROM anon, authenticated;

-- 2) Re-revoke column-level access to promo_code on promotional_banners
REVOKE SELECT (promo_code) ON public.promotional_banners FROM anon, authenticated;

-- 3) Lock down user_profiles UPDATE policy
-- Drop the broken policy and replace with one that only allows safe fields
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

CREATE POLICY "Users can update their own profile safe fields"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Revoke direct UPDATE on sensitive columns at the column level
REVOKE UPDATE (plan, daily_credits, max_daily_credits, words_used, images_used, credits_reset_at, usage_reset_at)
  ON public.user_profiles FROM anon, authenticated;

-- Grant UPDATE only on safe columns
GRANT UPDATE (full_name, email)
  ON public.user_profiles TO authenticated;
