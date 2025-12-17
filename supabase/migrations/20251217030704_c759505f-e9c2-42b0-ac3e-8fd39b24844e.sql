-- Create promotional banners table for admin-managed ads and promotions
CREATE TABLE public.promotional_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  promo_code TEXT,
  discount_text TEXT,
  cta_text TEXT DEFAULT 'Shop Now',
  cta_link TEXT DEFAULT '/pricing',
  background_color TEXT DEFAULT '#EF233C',
  text_color TEXT DEFAULT '#FFFFFF',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;

-- Anyone can view active banners
CREATE POLICY "Anyone can view active banners"
ON public.promotional_banners
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Admins can manage all banners
CREATE POLICY "Admins can manage banners"
ON public.promotional_banners
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));