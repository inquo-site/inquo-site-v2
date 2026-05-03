import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SEOHead
        title="Page Not Found (404)"
        description="The page you're looking for doesn't exist. Return home to explore 160+ AI tools on Inquo.Site."
        canonicalUrl={`https://inquo.site${location.pathname}`}
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <Link to="/" className="text-primary underline hover:text-accent">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
