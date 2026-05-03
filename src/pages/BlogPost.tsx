import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Eye } from "lucide-react";
import DOMPurify from 'dompurify';
import 'react-quill/dist/quill.snow.css';
import { SEOHead } from "@/components/SEOHead";

interface Blog {
  id: string;
  title: string;
  content: string;
  featured_image: string;
  published_at: string;
  views: number;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;

      setBlog(data);

      // Increment view count
      await supabase.rpc('increment_blog_views', { blog_id: data.id });

      // Track view
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('blog_views').insert({
        blog_id: data.id,
        user_id: user?.id || null,
      });

    } catch (error) {
      console.error("Failed to fetch blog:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const plainText = useMemo(() => {
    if (!blog?.content) return "";
    return blog.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
  }, [blog?.content]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={blog.title}
        description={plainText || `Read ${blog.title} on the Inquo.Site blog.`}
        keywords={`${blog.title}, AI blog, Inquo.site blog, AI tutorial`}
        canonicalUrl={`https://inquo.site/blog/${slug}`}
        ogImage={blog.featured_image || undefined}
        ogType="article"
        article={{
          publishedTime: blog.published_at,
          section: "AI",
          author: "Inquo.Site",
        }}
        schema={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: blog.title,
          image: blog.featured_image || undefined,
          datePublished: blog.published_at,
          author: { "@type": "Organization", name: "Inquo.Site" },
          publisher: { "@type": "Organization", name: "Inquo.Site" },
          url: `https://inquo.site/blog/${slug}`,
        }}
      />
      <article className="container mx-auto max-w-4xl px-4 py-12">
        <Link to="/blog">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        {blog.featured_image && (
          <div className="w-full h-96 mb-8 rounded-lg overflow-hidden">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{blog.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(blog.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {blog.views} views
            </span>
          </div>
        </div>

        <div 
          className="prose prose-lg dark:prose-invert max-w-none ql-editor"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content, {
            ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'img', 'blockquote', 'code', 'pre', 'br', 'span', 'div'],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel']
          }) }}
        />

        <div className="mt-12 pt-8 border-t">
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Read More Articles
            </Button>
          </Link>
        </div>
      </article>
    </div>
  );
}
