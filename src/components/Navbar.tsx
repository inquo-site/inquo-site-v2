import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Hexagon, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NSCta } from "@/components/ns/NSCta";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close on ESC + lock body scroll
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: "Tools", path: "/dashboard", desc: "160+ AI utilities" },
    { name: "Agents", path: "/agents", desc: "Autonomous AI workers" },
    { name: "Projects", path: "/projects", desc: "Showcase & history" },
    { name: "Blog", path: "/blog", desc: "Guides & news" },
    { name: "About", path: "/about", desc: "Our mission" },
    { name: "Contact", path: "/contact", desc: "Talk to us" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled ? "py-3" : "py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-500 px-4 sm:px-5 h-14",
              isScrolled ? "ns-pill" : ""
            )}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-md border border-primary/40 group-hover:border-primary transition-colors">
                <Hexagon className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </span>
              <span className="font-display text-lg tracking-tight text-foreground">InQuo</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link, idx) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "relative px-3 py-2 text-sm tracking-tight transition-colors flex items-center gap-3",
                    isActive(link.path) ? "text-primary" : "text-foreground/80 hover:text-foreground"
                  )}
                >
                  <span className="ns-link">{link.name}</span>
                  {idx < navLinks.length - 1 && (
                    <span className="text-primary/50 select-none -mr-2 inline-block transform -skew-x-12">/</span>
                  )}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                {user ? (
                  <NSCta to="/dashboard" size="sm">Dashboard</NSCta>
                ) : (
                  <NSCta to="/auth" size="sm">Start Free</NSCta>
                )}
              </div>

              {/* Unique Menu Trigger */}
              <button
                onClick={() => setIsMenuOpen((v) => !v)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                className="relative inline-flex items-center gap-2 h-10 px-3 rounded-full border border-border bg-card/60 backdrop-blur-md hover:border-primary/60 hover:text-primary transition-all group"
              >
                <span className="hidden sm:inline text-xs font-display tracking-[0.2em] uppercase">
                  {isMenuOpen ? "Close" : "Menu"}
                </span>
                <span className="relative w-5 h-5 flex flex-col justify-center items-end gap-1">
                  <span
                    className={cn(
                      "block h-[1.5px] bg-current transition-all duration-300 origin-right",
                      isMenuOpen ? "w-5 rotate-[-45deg] translate-y-[3px]" : "w-5"
                    )}
                  />
                  <span
                    className={cn(
                      "block h-[1.5px] bg-current transition-all duration-300",
                      isMenuOpen ? "w-5 rotate-45 -translate-y-[3px]" : "w-3 group-hover:w-5"
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Unique full-screen mega overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-all duration-500",
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!isMenuOpen}
      >
        {/* Heavy blur layer over everything behind */}
        <div
          onClick={() => setIsMenuOpen(false)}
          className={cn(
            "absolute inset-0 backdrop-blur-2xl bg-background/40 transition-opacity duration-500",
            isMenuOpen ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Animated diagonal accent layers */}
        <div
          className={cn(
            "absolute inset-0 overflow-hidden transition-opacity duration-700",
            isMenuOpen ? "opacity-100" : "opacity-0"
          )}
        >
          <div
            className={cn(
              "absolute -top-1/2 -left-1/4 w-[80%] h-[200%] origin-top-left bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              isMenuOpen ? "rotate-[-12deg] translate-x-0" : "rotate-[-12deg] -translate-x-full"
            )}
          />
          <div
            className={cn(
              "absolute -bottom-1/2 -right-1/4 w-[70%] h-[200%] origin-bottom-right bg-gradient-to-tl from-accent/10 via-accent/5 to-transparent transition-transform duration-700 delay-100 ease-[cubic-bezier(0.22,1,0.36,1)]",
              isMenuOpen ? "rotate-[-12deg] translate-x-0" : "rotate-[-12deg] translate-x-full"
            )}
          />
        </div>

        {/* Content */}
        <div
          className={cn(
            "relative h-full w-full flex flex-col transition-opacity duration-300",
            isMenuOpen ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="flex-1 flex items-center">
            <div className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 pt-24 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left: huge nav links */}
              <div className="lg:col-span-8">
                <div className="text-xs font-display tracking-[0.3em] uppercase text-muted-foreground mb-6">
                  <span className="text-primary">/</span> Navigate
                </div>
                <ul className="space-y-1">
                  {navLinks.map((link, i) => (
                    <li
                      key={link.path}
                      className={cn(
                        "transition-all duration-500 ease-out",
                        isMenuOpen
                          ? "opacity-100 translate-x-0 blur-0"
                          : "opacity-0 -translate-x-8 blur-sm"
                      )}
                      style={{ transitionDelay: isMenuOpen ? `${150 + i * 70}ms` : "0ms" }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="group relative flex items-baseline gap-4 py-2 sm:py-3 border-b border-border/40 hover:border-primary/60 transition-colors"
                      >
                        <span className="text-xs font-mono text-muted-foreground/60 w-8 shrink-0">
                          0{i + 1}
                        </span>
                        <span
                          className={cn(
                            "font-display text-4xl sm:text-6xl lg:text-7xl tracking-tighter leading-[1.05] transition-all duration-500",
                            isActive(link.path)
                              ? "text-primary"
                              : "text-foreground group-hover:text-primary group-hover:translate-x-3"
                          )}
                        >
                          {link.name}
                        </span>
                        <span className="hidden sm:inline ml-auto text-xs text-muted-foreground/70 italic font-script">
                          {link.desc}
                        </span>
                        <ArrowUpRight
                          className="w-5 h-5 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: CTA / contact */}
              <aside
                className={cn(
                  "lg:col-span-4 flex flex-col gap-6 lg:pl-8 lg:border-l lg:border-border/40 transition-all duration-700",
                  isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                )}
                style={{ transitionDelay: isMenuOpen ? "550ms" : "0ms" }}
              >
                <div>
                  <div className="text-xs font-display tracking-[0.3em] uppercase text-muted-foreground mb-3">
                    <span className="text-primary">/</span> Get started
                  </div>
                  <p className="font-display text-2xl leading-snug mb-5">
                    Ship faster with <span className="text-primary">160+ AI tools</span> in one place.
                  </p>
                  {user ? (
                    <NSCta to="/dashboard" size="lg" className="w-full justify-between">
                      Open Dashboard
                    </NSCta>
                  ) : (
                    <NSCta to="/auth" size="lg" className="w-full justify-between">
                      Start Free
                    </NSCta>
                  )}
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="text-xs font-display tracking-[0.3em] uppercase text-muted-foreground/80 mb-2">
                    <span className="text-primary">/</span> Contact
                  </div>
                  <a href="mailto:inquo4@gmail.com" className="block hover:text-primary transition-colors">
                    inquo4@gmail.com
                  </a>
                  <p className="text-xs">Purnea, Bihar — India</p>
                </div>
              </aside>
            </div>
          </div>

          {/* Footer hint */}
          <div
            className={cn(
              "px-6 sm:px-10 lg:px-16 pb-6 flex items-center justify-between text-xs text-muted-foreground/70 transition-opacity duration-500",
              isMenuOpen ? "opacity-100" : "opacity-0"
            )}
            style={{ transitionDelay: isMenuOpen ? "700ms" : "0ms" }}
          >
            <span className="font-mono">ESC to close</span>
            <span className="font-script italic text-base">Never settle.</span>
          </div>
        </div>
      </div>
    </>
  );
};
