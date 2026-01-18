import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Users, Bot, Sparkles, ArrowRight, Globe, Zap, Shield } from "lucide-react";

interface Project {
  name: string;
  tagline: string;
  description: string;
  url: string;
  image: string;
  features: string[];
  category: string;
  status: "Live" | "Beta" | "Coming Soon";
  icon: React.ElementType;
  gradient: string;
}

const projects: Project[] = [
  {
    name: "SkillLink",
    tagline: "Find Local Skilled Professionals Near You",
    description: "SkillLink connects you with trusted local professionals for all your service needs. Whether you need a plumber, electrician, designer, or any skilled worker, our platform makes it easy to find, compare, and hire the best talent in your area.",
    url: "https://skill4u.lovable.app",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=450&fit=crop",
    features: ["Local Professional Network", "Verified Reviews", "Instant Booking", "Secure Payments"],
    category: "Marketplace",
    status: "Live",
    icon: Users,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    name: "AgentFlow",
    tagline: "Deploy AI Agents That Work While You Sleep",
    description: "AgentFlow empowers businesses to automate their workflows with intelligent AI agents. Create, customize, and deploy autonomous agents that handle tasks 24/7, from customer support to data processing, freeing you to focus on what matters most.",
    url: "https://agentfloww.lovable.app",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
    features: ["24/7 Automation", "Custom AI Agents", "No-Code Builder", "Analytics Dashboard"],
    category: "AI Automation",
    status: "Live",
    icon: Bot,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    name: "InQuo.Site",
    tagline: "160+ AI Tools for Every Need",
    description: "The platform you're on right now! InQuo.Site provides access to over 160 powerful AI tools for writing, image generation, coding, marketing, and more. All in one place, designed to supercharge your productivity.",
    url: "https://inquo-site.lovable.app",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop",
    features: ["160+ AI Tools", "Text & Image AI", "Code Generation", "Marketing Tools"],
    category: "AI Platform",
    status: "Live",
    icon: Sparkles,
    gradient: "from-primary to-accent"
  }
];

const stats = [
  { label: "Active Projects", value: "3+", icon: Globe },
  { label: "Combined Users", value: "10K+", icon: Users },
  { label: "AI Tools Built", value: "160+", icon: Zap },
  { label: "Uptime", value: "99.9%", icon: Shield },
];

const Projects = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Our Projects | InQuo.Site - AI-Powered Solutions"
        description="Explore our portfolio of innovative AI-powered platforms including SkillLink, AgentFlow, and InQuo.Site. Building the future of automation and connectivity."
        keywords="AI projects, SkillLink, AgentFlow, InQuo, AI tools, automation, marketplace"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-6 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Our Portfolio
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Building the{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Future
              </span>{" "}
              Together
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover our collection of innovative platforms designed to empower businesses 
              and individuals with cutting-edge technology solutions.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-6 text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Projects</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each project is crafted with care, powered by modern technology, and designed to solve real-world problems.
            </p>
          </div>

          <div className="space-y-16">
            {projects.map((project, index) => (
              <Card 
                key={project.name} 
                className="overflow-hidden bg-card border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                <div className={`grid lg:grid-cols-2 gap-0 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Image Section */}
                  <div className={`relative h-64 lg:h-auto min-h-[300px] ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-20`} />
                    <img 
                      src={project.image} 
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge 
                        className={`${project.status === 'Live' ? 'bg-green-500/90' : project.status === 'Beta' ? 'bg-yellow-500/90' : 'bg-blue-500/90'} text-white`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                        {project.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className={`p-8 lg:p-12 flex flex-col justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.gradient} flex items-center justify-center`}>
                        <project.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">{project.tagline}</p>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {project.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="px-3 py-1">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-4">
                      <Button asChild className="group">
                        <a href={project.url} target="_blank" rel="noopener noreferrer">
                          Visit {project.name}
                          <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {project.url.replace('https://', '')}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Have a Project Idea?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            We're always exploring new opportunities to build innovative solutions. 
            Get in touch to discuss your ideas or collaborate with us.
          </p>
          <Button size="lg" asChild>
            <a href="/contact">
              Get in Touch
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
