import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Search, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { SEOHead } from "@/components/SEOHead";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  published_at: string;
  views: number;
}

export default function ImprovedBlog() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blogs')
      .select('id, title, slug, excerpt, featured_image, published_at, views')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (!error && data) {
      setBlogs(data);
    }
    setLoading(false);
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredBlog = filteredBlogs[0];
  const regularBlogs = filteredBlogs.slice(1);

  // Suggested blog topics for SEO
  const suggestedTopics = [
    { title: "Best AI Tools for Students", category: "Education" },
    { title: "Top AI Tools for Coding", category: "Development" },
    { title: "Free AI Websites Like ChatGPT", category: "AI Tools" },
    { title: "AI for Content Writers", category: "Writing" },
    { title: "Best Image-Generation AI Tools", category: "Design" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="AI Blog - Tips, Tutorials & Industry Insights"
        description="Stay updated with the latest AI tools, tips, and industry insights. Learn how to boost productivity with AI writing, coding, design and marketing tools."
        keywords="AI blog, AI tutorials, AI tips, productivity tips, AI tools guide, Inquo blog, artificial intelligence"
        canonicalUrl="https://inquo.site/blog"
        schema={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Inquo.Site Blog",
          description: "AI tips, tutorials, and industry insights",
          url: "https://inquo.site/blog",
          publisher: {
            "@type": "Organization",
            name: "Inquo.Site",
            logo: "https://storage.googleapis.com/gpt-engineer-file-uploads/MIvfSCOSy2WREISzTLxXlN5x6j03/uploads/1767330225396-1000021517.jpg"
          }
        }}
      />
      <Navbar />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <Badge className="mb-4 px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              Latest AI Insights
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Inquo.Site{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Blog
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Stay updated with the latest AI tools, tips, and industry insights
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-full"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No blog posts found</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featuredBlog && (
                <Link to={`/blog/${featuredBlog.slug}`}>
                  <Card className="p-8 mb-12 hover:scale-[1.02] transition-transform cursor-pointer animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="aspect-video rounded-lg bg-muted overflow-hidden">
                        {featuredBlog.featured_image ? (
                          <img
                            src={featuredBlog.featured_image}
                            alt={featuredBlog.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <TrendingUp className="w-16 h-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <Badge className="mb-4 w-fit">Featured Article</Badge>
                        <h2 className="text-3xl font-bold mb-4 hover:text-accent transition-colors">
                          {featuredBlog.title}
                        </h2>
                        <p className="text-muted-foreground mb-6 line-clamp-3">
                          {featuredBlog.excerpt}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(featuredBlog.published_at), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            {featuredBlog.views} views
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              )}

              {/* Regular Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {regularBlogs.map((blog, index) => (
                  <Link 
                    key={blog.id} 
                    to={`/blog/${blog.slug}`}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Card className="h-full hover:scale-105 transition-transform cursor-pointer overflow-hidden">
                      <div className="aspect-video bg-muted">
                        {blog.featured_image ? (
                          <img
                            src={blog.featured_image}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <TrendingUp className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 hover:text-accent transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {blog.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(blog.published_at), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {blog.views}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Suggested Topics Section */}
              {blogs.length < 5 && (
                <div className="mt-16">
                  <h2 className="text-2xl font-bold mb-6 text-center">Coming Soon</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestedTopics.map((topic, index) => (
                      <Card 
                        key={index} 
                        className="p-6 opacity-60"
                      >
                        <Badge variant="outline" className="mb-3">{topic.category}</Badge>
                        <h3 className="font-semibold">{topic.title}</h3>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* CTA Section - Internal Linking to Pricing */}
          <section className="mt-20 py-16 px-8 rounded-3xl bg-gradient-to-br from-accent/10 via-primary/5 to-background border-2 border-accent/20 animate-fade-in">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Ready to Get Started?
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Try Our <span className="text-gradient">160+ AI Tools</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Put what you learned into practice. Access all our AI tools for writing, coding, design, and marketing.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8">
                  <Link to="/dashboard">
                    Explore All Tools
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-8">
                  <Link to="/pricing">
                    View Pricing Plans
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
