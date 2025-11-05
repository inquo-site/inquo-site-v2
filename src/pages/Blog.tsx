import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  views: number;
}

export default function Blog() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, slug, excerpt, featured_image, published_at, views')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold">
              Our <span className="text-gradient">Blog</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Insights, tutorials, and updates from the InQuo.site team
            </p>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading blogs...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No blog posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Link key={blog.id} to={`/blog/${blog.slug}`}>
                  <Card className="h-full hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden">
                    {blog.featured_image && (
                      <div className="w-full h-48 overflow-hidden">
                        <img
                          src={blog.featured_image}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {blog.excerpt || "Read more to discover..."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(blog.published_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {blog.views}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 border-t">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Try Our AI Tools?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Experience the power of AI in your workflow
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
