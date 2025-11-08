import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/dashboard" },
    { name: "Pricing", path: "/pricing" },
    { name: "Blog", path: "/blog" },
  ];

  const categories = [
    { name: "Text AI", path: "/dashboard?category=writing" },
    { name: "Image AI", path: "/dashboard?category=design" },
    { name: "Code AI", path: "/dashboard?category=coding" },
    { name: "Marketing", path: "/dashboard?category=marketing" },
  ];

  const legal = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Inquo.Site
              </div>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Your one-stop platform for 160+ powerful AI tools. Transform your workflow with cutting-edge AI technology.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.path}>
                  <Link
                    to={category.path}
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              {legal.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <a
                href="mailto:support@inquo.site"
                className="flex items-center text-muted-foreground hover:text-accent transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                support@inquo.site
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Inquo.Site. All rights reserved. Made with ❤️ for AI enthusiasts.
          </p>
        </div>
      </div>
    </footer>
  );
};
