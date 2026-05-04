import { Card } from "@/components/ui/card";
import { Sparkles, Target, Users, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About Us - Our Mission & Vision"
        description="Learn about Inquo.Site - the global AI Tools Hub with 160+ powerful AI tools. Discover our mission to democratize AI technology for creators and professionals worldwide."
        keywords="about Inquo.site, AI tools platform, AI technology company, AI startup India"
        canonicalUrl="https://inquo.site/about"
        schema={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          mainEntity: {
            "@type": "Organization",
            name: "Inquo.Site",
            description: "Global AI Tools Hub with 160+ powerful AI tools",
            foundingLocation: "India",
            email: "inquo4@gmail.com",
          },
        }}
      />
      <Navbar />
      <main className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <header className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">
              About <span className="text-gradient">InQuo.site</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Empowering creators with AI-powered tools
            </p>
          </header>

          <article className="prose prose-lg dark:prose-invert mx-auto mb-16">
            <p className="text-lg">
              InQuo.site is a global AI Tools Hub designed to revolutionize the way you work. 
              We bring together 160 powerful AI tools (12 free + 148 premium) in one seamless platform, 
              making advanced AI capabilities accessible to everyone.
            </p>

            <p className="text-lg">
              Whether you're a writer, developer, designer, marketer, or student, InQuo.site 
              provides the tools you need to enhance your productivity and creativity. Our 
              platform is powered by cutting-edge AI models including GPT-4 and the latest 
              machine learning technologies.
            </p>
          </article>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16" aria-label="Company values">
            <Card className="glass-card p-6">
              <Target className="w-12 h-12 text-accent mb-4" aria-hidden="true" />
              <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
              <p className="text-muted-foreground">
                To democratize AI technology and make powerful tools accessible to creators, 
                professionals, and learners worldwide.
              </p>
            </Card>

            <Card className="glass-card p-6">
              <Sparkles className="w-12 h-12 text-accent mb-4" aria-hidden="true" />
              <h2 className="text-2xl font-semibold mb-3">Our Vision</h2>
              <p className="text-muted-foreground">
                To become the world's leading AI toolkit platform, continuously innovating 
                and expanding our offerings to meet evolving user needs.
              </p>
            </Card>

            <Card className="glass-card p-6">
              <Users className="w-12 h-12 text-accent mb-4" aria-hidden="true" />
              <h2 className="text-2xl font-semibold mb-3">Our Community</h2>
              <p className="text-muted-foreground">
                Thousands of creators, developers, and professionals trust InQuo.site for 
                their daily AI-powered workflows.
              </p>
            </Card>

            <Card className="glass-card p-6">
              <Zap className="w-12 h-12 text-accent mb-4" aria-hidden="true" />
              <h2 className="text-2xl font-semibold mb-3">Our Technology</h2>
              <p className="text-muted-foreground">
                Built on state-of-the-art AI models and optimized for speed, reliability, 
                and user experience.
              </p>
            </Card>
          </section>

          <section className="glass-card p-8 rounded-2xl mb-16" aria-label="Founder">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-5xl font-bold text-background shrink-0">
                SK
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">
                  Meet the <span className="text-gradient">Founder</span>
                </h2>
                <h3 className="text-2xl font-semibold mb-3">Suman Kumar</h3>
                <p className="text-muted-foreground mb-4">
                  Founder & CEO of InQuo.site — a passionate technologist from Purnea, Bihar, India,
                  on a mission to make powerful AI tools accessible to creators, students, and
                  professionals everywhere. Suman built InQuo.site to bring 160+ AI tools under one
                  unified, affordable platform.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><strong className="text-foreground">Location:</strong> Purnea, Bihar, India - 854315</li>
                  <li><strong className="text-foreground">Email:</strong> <a href="mailto:inquo4@gmail.com" className="text-accent hover:underline">inquo4@gmail.com</a></li>
                </ul>
              </div>
            </div>
          </section>

          <section className="text-center glass-card p-8 rounded-2xl">
            <h2 className="text-3xl font-bold mb-4">Join Our Journey</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Be part of the AI revolution. Start creating, innovating, and achieving more 
              with InQuo.site today.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;