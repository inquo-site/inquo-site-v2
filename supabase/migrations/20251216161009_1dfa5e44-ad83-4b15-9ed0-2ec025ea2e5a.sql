-- Remove the public read policy that exposes all promo codes
DROP POLICY IF EXISTS "Anyone can read active promo codes" ON public.promo_codes;