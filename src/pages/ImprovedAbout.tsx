import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { SEOHead } from "@/components/SEOHead";
import { Target, Eye, Users, Rocket, Heart, Zap, Linkedin, Twitter, Mail, Sparkles } from "lucide-react";

export default function ImprovedAbout() {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To bring all AI tools together in one powerful platform, making advanced AI technology accessible to everyone.",
    },
    {
      icon: Eye,
      title: "Our Vision",
      description: "To become the world's leading AI tools platform, empowering millions to work smarter and faster.",
    },
    {
      icon: Users,
      title: "Community First",
      description: "We build for our users, constantly listening to feedback and improving based on real needs.",
    },
  ];

  const story = [
    {
      icon: Rocket,
      title: "Why We Built Inquo.Site",
      description: "We noticed people were jumping between dozens of different AI tools, wasting time and money. We wanted to create a single platform where you could access everything you need.",
    },
    {
      icon: Heart,
      title: "Our Commitment",
      description: "We're committed to providing the best AI tools at fair prices, with transparent pricing and no hidden fees. Your success is our success.",
    },
    {
      icon: Zap,
      title: "The Future",
      description: "We're constantly adding new tools, improving performance, and building features that make AI more powerful and accessible for everyone.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About InQuo — Our mission, story & team"
        description="Meet the team behind InQuo.Site: 160+ AI tools in one platform. Learn our mission, vision and the story of why we built it."
        canonicalUrl="https://inquo-site.lovable.app/about"
      />
      <Navbar />

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              About{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Inquo.Site
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're on a mission to democratize AI technology and make powerful tools accessible to everyone.
            </p>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <Card 
                  key={index} 
                  className="p-6 hover:scale-105 transition-transform animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                    <value.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Story */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Story</h2>
            <div className="space-y-6">
              {story.map((item, index) => (
                <Card 
                  key={index} 
                  className="p-8 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Founder Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Meet the Founder</h2>
            <Card className="relative overflow-hidden p-8 md:p-12 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2 border-primary/10">
              {/* Decorative blobs */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-xl opacity-50 animate-pulse" />
                    <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-5xl font-bold shadow-2xl">
                      SK
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-background border-2 border-accent flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-3">
                    <Sparkles className="w-3 h-3" /> FOUNDER & CEO
                  </div>
                  <h3 className="text-3xl font-bold mb-2">Suman Kumar</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Hi, I'm Suman Kumar — the founder of Inquo.Site. I built this platform with a simple belief: powerful AI shouldn't be locked behind expensive subscriptions or scattered across dozens of tools. My goal is to bring 160+ AI tools and intelligent agents into one clean, affordable workspace so creators, students, and businesses can focus on what truly matters — getting work done.
                  </p>
                  <blockquote className="border-l-4 border-accent pl-4 italic text-foreground/80 mb-6">
                    "AI should empower everyone, not just those who can afford it. That's why Inquo exists."
                  </blockquote>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href="mailto:webcraftmaster915@gmail.com"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      <Mail className="w-4 h-4" /> Email
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:bg-muted transition-colors text-sm font-medium"
                    >
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:bg-muted transition-colors text-sm font-medium"
                    >
                      <Twitter className="w-4 h-4" /> Twitter
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Stats */}
          <Card className="p-8 bg-gradient-to-br from-primary to-accent text-white text-center">
            <h2 className="text-3xl font-bold mb-6">Join Our Growing Community</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">160+</div>
                <div className="text-sm opacity-90">AI Tools</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-sm opacity-90">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">99.9%</div>
                <div className="text-sm opacity-90">Uptime</div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
