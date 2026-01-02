import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
  };
  schema?: object;
}

export const SEOHead = ({
  title,
  description,
  keywords = "AI tools, free AI website, text generator, image AI, code AI generator, AI platform, Inquo.site",
  canonicalUrl,
  ogImage = "https://storage.googleapis.com/gpt-engineer-file-uploads/MIvfSCOSy2WREISzTLxXlN5x6j03/social-images/social-1766206197702-1000020673.png",
  ogType = "website",
  article,
  schema,
}: SEOHeadProps) => {
  const fullTitle = `${title} | Inquo.Site - AI Tools Platform`;
  const baseUrl = "https://inquo.site";
  const canonical = canonicalUrl || baseUrl;

  // Default website schema
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Inquo.Site",
    alternateName: "InQuo AI Tools",
    url: baseUrl,
    description: "160+ AI-powered productivity tools for content, code, design & marketing",
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/dashboard?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  // Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Inquo.Site",
    url: baseUrl,
    logo: "https://storage.googleapis.com/gpt-engineer-file-uploads/MIvfSCOSy2WREISzTLxXlN5x6j03/uploads/1767330225396-1000021517.jpg",
    sameAs: [
      "https://www.instagram.com/inquo.site_ai",
      "https://inquo-site.blogspot.com",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "inquo4@gmail.com",
      contactType: "customer service",
    },
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Inquo.Site" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Inquo.Site" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Article specific */}
      {article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.section && <meta property="article:section" content={article.section} />}
        </>
      )}

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schema || defaultSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
    </Helmet>
  );
};
