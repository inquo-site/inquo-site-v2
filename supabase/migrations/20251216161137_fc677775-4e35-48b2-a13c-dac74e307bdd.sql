-- Remove unused Stripe payment columns that expose sensitive data structure
-- The app uses manual UPI payments, not Stripe, so these columns are unnecessary
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS stripe_subscription_id;