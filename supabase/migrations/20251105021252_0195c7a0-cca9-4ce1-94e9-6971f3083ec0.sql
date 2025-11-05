-- Create blogs table
CREATE TABLE public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image text,
  author_id uuid REFERENCES auth.users(id) NOT NULL,
  published boolean DEFAULT false,
  published_at timestamp with time zone,
  views integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create blog_views table for analytics
CREATE TABLE public.blog_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id uuid REFERENCES public.blogs(id) ON DELETE CASCADE NOT NULL,
  viewed_at timestamp with time zone DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blogs
CREATE POLICY "Anyone can view published blogs"
  ON public.blogs FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can view all blogs"
  ON public.blogs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create blogs"
  ON public.blogs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blogs"
  ON public.blogs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blogs"
  ON public.blogs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for blog_views
CREATE POLICY "Anyone can insert blog views"
  ON public.blog_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all blog views"
  ON public.blog_views FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update blog views
CREATE OR REPLACE FUNCTION public.increment_blog_views(blog_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.blogs
  SET views = views + 1
  WHERE id = blog_id;
END;
$$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_blog_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blog_updated_at();

-- Create index for better performance
CREATE INDEX idx_blogs_slug ON public.blogs(slug);
CREATE INDEX idx_blogs_published ON public.blogs(published, published_at DESC);
CREATE INDEX idx_blog_views_blog_id ON public.blog_views(blog_id);