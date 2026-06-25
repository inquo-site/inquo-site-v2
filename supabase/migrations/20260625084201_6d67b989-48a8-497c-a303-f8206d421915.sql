
-- 1) ai_agents: revoke SELECT on system_prompt from anon/authenticated (defense-in-depth)
REVOKE SELECT (system_prompt) ON public.ai_agents FROM anon, authenticated, public;

-- 2) promotional_banners: revoke SELECT on promo_code from anon/authenticated
REVOKE SELECT (promo_code) ON public.promotional_banners FROM anon, authenticated, public;

-- 3) Lock down SECURITY DEFINER functions: revoke EXECUTE from public/anon/authenticated
--    Keep has_role executable (needed by RLS policies) and increment_blog_views (called from client).
REVOKE EXECUTE ON FUNCTION public.deduct_credits(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_user_credits() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_monthly_usage() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.use_words(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.use_images(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_access_tool(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Ensure service_role retains access for edge functions
GRANT EXECUTE ON FUNCTION public.deduct_credits(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_user_credits() TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_monthly_usage() TO service_role;
GRANT EXECUTE ON FUNCTION public.use_words(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.use_images(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.can_access_tool(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
