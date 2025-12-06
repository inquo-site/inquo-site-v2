-- Fix search_path for can_access_tool function
CREATE OR REPLACE FUNCTION public.can_access_tool(_user_id uuid, _tool_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tool_premium BOOLEAN;
  _user_plan plan_type;
BEGIN
  SELECT is_premium INTO _tool_premium
  FROM public.tools
  WHERE id = _tool_id;
  
  SELECT plan INTO _user_plan
  FROM public.user_profiles
  WHERE user_id = _user_id;
  
  -- Free tools are accessible to everyone
  IF NOT _tool_premium THEN
    RETURN true;
  END IF;
  
  -- Premium tools require paid plan
  RETURN _user_plan IN ('pro', 'yearly', 'lifetime');
END;
$$;

-- Fix search_path for reset_user_credits function
CREATE OR REPLACE FUNCTION public.reset_user_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_profiles
  SET 
    daily_credits = max_daily_credits,
    credits_reset_at = now() + interval '1 day'
  WHERE credits_reset_at <= now();
END;
$$;

-- Fix search_path for deduct_credits function
CREATE OR REPLACE FUNCTION public.deduct_credits(_user_id uuid, _amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_credits INTEGER;
BEGIN
  -- Check if credits need reset
  PERFORM public.reset_user_credits();
  
  SELECT daily_credits INTO _current_credits
  FROM public.user_profiles
  WHERE user_id = _user_id;
  
  IF _current_credits >= _amount THEN
    UPDATE public.user_profiles
    SET daily_credits = daily_credits - _amount
    WHERE user_id = _user_id;
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Fix blog_views RLS policy to prevent user_id spoofing
DROP POLICY IF EXISTS "Anyone can insert blog views" ON blog_views;

CREATE POLICY "Users can insert their own views"
ON blog_views FOR INSERT
WITH CHECK (user_id IS NULL OR user_id = auth.uid());