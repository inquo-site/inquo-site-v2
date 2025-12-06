import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Footer = () => {
  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "All Tools", path: "/dashboard" },
    { name: "Pricing", path: "/pricing" },
    { name: "Blog", path: "/blog" },
  ];

  const categories = [
    { name: "Text AI Tools", path: "/dashboard?category=writing" },
    { name: "Image AI Tools", path: "/dashboard?category=design" },
    { name: "Code AI Tools", path: "/dashboard?category=coding" },
    { name: "Marketing AI", path: "/dashboard?category=marketing" },
  ];

  const legal = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/privacy" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const popularTools = [
    { name: "Blog Generator", path: "/tool/blog" },
    { name: "Image Generator", path: "/tool/image" },
    { name: "Code Generator", path: "/tool/code" },
    { name: "Grammar Fixer", path: "/tool/grammar" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter Section */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold mb-2">Stay Updated with AI Trends</h3>
              <p className="text-muted-foreground">Get weekly tips, new tool updates, and exclusive offers.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="min-w-[280px] h-12"
              />
              <Button className="h-12 px-8">
                Subscribe
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">Inquo.Site</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Your all-in-one platform for 160+ powerful AI tools. Transform ideas into reality with cutting-edge AI technology.
            </p>
            <div className="flex items-center gap-3 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <Badge variant="outline" className="text-xs">
              🔒 SOC 2 Compliant
            </Badge>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Categories</h4>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.path}>
                  <Link
                    to={category.path}
                    className="text-muted-foreground hover:text-accent transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Tools */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Popular Tools</h4>
            <ul className="space-y-3">
              {popularTools.map((tool) => (
                <li key={tool.path}>
                  <Link
                    to={tool.path}
                    className="text-muted-foreground hover:text-accent transition-colors text-sm"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-3">
              {legal.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-muted-foreground hover:text-accent transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <a
                href="mailto:support@inquo.site"
                className="inline-flex items-center text-muted-foreground hover:text-accent transition-colors text-sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                support@inquo.site
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Inquo.Site. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
              <Link to="/privacy" className="hover:text-accent transition-colors">Terms</Link>
              <Link to="/contact" className="hover:text-accent transition-colors">Cookies</Link>
              <span>Made with ❤️ for AI enthusiasts</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
