import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Target, Eye, Users, Rocket, Heart, Zap } from "lucide-react";

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
      <Navbar />
      
      <div className="pt-24 pb-20 px-4">
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
      </div>

      <Footer />
    </div>
  );
}
