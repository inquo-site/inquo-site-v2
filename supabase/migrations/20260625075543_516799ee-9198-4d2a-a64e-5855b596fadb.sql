
-- 1. custom_ads table for admin-managed promo banners
CREATE TABLE IF NOT EXISTS public.custom_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cta_text TEXT NOT NULL DEFAULT 'Learn More',
  cta_link TEXT NOT NULL DEFAULT '/',
  background_gradient TEXT DEFAULT 'from-primary to-accent',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.custom_ads TO anon, authenticated;
GRANT ALL ON public.custom_ads TO service_role;

ALTER TABLE public.custom_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active custom ads"
  ON public.custom_ads FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage custom ads"
  ON public.custom_ads FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. SECURITY FIX: hide promo_code from anon/authenticated on promotional_banners
REVOKE SELECT (promo_code) ON public.promotional_banners FROM anon, authenticated;

-- 3. SECURITY FIX: prevent users from self-upgrading plan / credits
DROP POLICY IF EXISTS "Users can update their own profile safe fields" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

CREATE POLICY "Users can update their own profile safe fields"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND plan = (SELECT plan FROM public.user_profiles WHERE user_id = auth.uid())
    AND daily_credits = (SELECT daily_credits FROM public.user_profiles WHERE user_id = auth.uid())
    AND max_daily_credits = (SELECT max_daily_credits FROM public.user_profiles WHERE user_id = auth.uid())
    AND words_used = (SELECT words_used FROM public.user_profiles WHERE user_id = auth.uid())
    AND images_used = (SELECT images_used FROM public.user_profiles WHERE user_id = auth.uid())
    AND credits_reset_at = (SELECT credits_reset_at FROM public.user_profiles WHERE user_id = auth.uid())
    AND usage_reset_at = (SELECT usage_reset_at FROM public.user_profiles WHERE user_id = auth.uid())
  );
