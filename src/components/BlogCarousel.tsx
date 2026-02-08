import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Eye, ArrowRight } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  views: number;
  published_at: string | null;
}

const BlogCarousel = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data } = await supabase
        .from("blogs")
        .select("id, title, slug, excerpt, featured_image, views, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(10);

      if (data) setBlogs(data);
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || blogs.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % blogs.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, blogs.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + blogs.length) % blogs.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % blogs.length);
  };

  const getVisibleBlogs = () => {
    if (blogs.length === 0) return [];
    const visibleCount = Math.min(3, blogs.length);
    const result = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % blogs.length;
      result.push({ ...blogs[index], position: i });
    }
    return result;
  };

  if (blogs.length === 0) return null;

  const visibleBlogs = getVisibleBlogs();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Latest from Our Blog</h2>
          <p className="text-xl text-muted-foreground">
            Stay updated with AI tips, tutorials, and industry insights
          </p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            onClick={goToNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Carousel Container */}
          <div className="overflow-hidden px-8">
            <div className="flex gap-6 transition-transform duration-500 ease-out">
              {visibleBlogs.map((blog, idx) => (
                <Link
                  key={`${blog.id}-${idx}`}
                  to={`/blog/${blog.slug}`}
                  className={`flex-shrink-0 w-full md:w-[calc(33.333%-1rem)] transition-all duration-500 ${
                    idx === 0
                      ? "opacity-100 scale-100"
                      : idx === 1
                      ? "opacity-90 scale-[0.98]"
                      : "opacity-80 scale-[0.96]"
                  }`}
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                >
                  <Card className="h-full overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                      {blog.featured_image ? (
                        <img
                          src={blog.featured_image}
                          alt={blog.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl font-bold text-primary/30">
                            {blog.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {blog.excerpt || "Read more about this topic..."}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          {blog.published_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(blog.published_at).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {blog.views}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-accent group-hover:translate-x-1 transition-transform">
                          Read <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {blogs.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "bg-accent w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Link to="/blog">
            <Button variant="outline" size="lg" className="group">
              View All Articles
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogCarousel;
