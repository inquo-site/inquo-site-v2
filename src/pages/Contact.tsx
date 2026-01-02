import { Card } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Contact Us - Get in Touch"
        description="Contact Inquo.Site for support, partnerships, or inquiries. Reach us via email at inquo4@gmail.com. We typically respond within 24 hours."
        keywords="contact Inquo.site, AI tools support, customer service, help desk"
        canonicalUrl="https://inquo.site/contact"
        schema={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          mainEntity: {
            "@type": "Organization",
            name: "Inquo.Site",
            email: "inquo4@gmail.com",
            telephone: "+91-8002551361",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Purnea",
              addressRegion: "Bihar",
              addressCountry: "India",
            },
          },
        }}
      />
      <Navbar />
      <main className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <header className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">
              Get in <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              We'd love to hear from you
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" aria-label="Contact methods">
            <Card className="glass-card p-6 text-center">
              <Mail className="w-8 h-8 text-accent mx-auto mb-4" aria-hidden="true" />
              <h2 className="font-semibold mb-2">Email</h2>
              <a 
                href="mailto:inquo4@gmail.com" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Send email to inquo4@gmail.com"
              >
                inquo4@gmail.com
              </a>
            </Card>

            <Card className="glass-card p-6 text-center">
              <Phone className="w-8 h-8 text-accent mx-auto mb-4" aria-hidden="true" />
              <h2 className="font-semibold mb-2">Phone</h2>
              <a 
                href="tel:+918002551361" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Call +91 8002551361"
              >
                +91 8002551361
              </a>
            </Card>

            <Card className="glass-card p-6 text-center">
              <MapPin className="w-8 h-8 text-accent mx-auto mb-4" aria-hidden="true" />
              <h2 className="font-semibold mb-2">Location</h2>
              <address className="text-muted-foreground not-italic">
                Purnea, Bihar<br />India
              </address>
            </Card>
          </section>

          <Card className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6">Support</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                For technical support, billing inquiries, or general questions, please reach out to us via email at{" "}
                <a href="mailto:inquo4@gmail.com" className="text-accent hover:underline">
                  inquo4@gmail.com
                </a>
              </p>
              <p className="text-muted-foreground">
                We typically respond within 24 hours during business days.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;