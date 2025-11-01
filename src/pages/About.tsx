import { Card } from "@/components/ui/card";
import { Sparkles, Target, Users, Zap } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            About <span className="text-gradient">InQuo.site</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Empowering creators with AI-powered tools
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert mx-auto mb-16">
          <p className="text-lg">
            InQuo.site is a global AI Tools Hub designed to revolutionize the way you work. 
            We bring together 100+ powerful AI tools in one seamless platform, making advanced
            AI capabilities accessible to everyone.
          </p>

          <p className="text-lg">
            Whether you're a writer, developer, designer, marketer, or student, InQuo.site 
            provides the tools you need to enhance your productivity and creativity. Our 
            platform is powered by cutting-edge AI models including GPT-4 and the latest 
            machine learning technologies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="glass-card p-6">
            <Target className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-2xl font-semibold mb-3">Our Mission</h3>
            <p className="text-muted-foreground">
              To democratize AI technology and make powerful tools accessible to creators, 
              professionals, and learners worldwide.
            </p>
          </Card>

          <Card className="glass-card p-6">
            <Sparkles className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-2xl font-semibold mb-3">Our Vision</h3>
            <p className="text-muted-foreground">
              To become the world's leading AI toolkit platform, continuously innovating 
              and expanding our offerings to meet evolving user needs.
            </p>
          </Card>

          <Card className="glass-card p-6">
            <Users className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-2xl font-semibold mb-3">Our Community</h3>
            <p className="text-muted-foreground">
              Thousands of creators, developers, and professionals trust InQuo.site for 
              their daily AI-powered workflows.
            </p>
          </Card>

          <Card className="glass-card p-6">
            <Zap className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-2xl font-semibold mb-3">Our Technology</h3>
            <p className="text-muted-foreground">
              Built on state-of-the-art AI models and optimized for speed, reliability, 
              and user experience.
            </p>
          </Card>
        </div>

        <div className="text-center glass-card p-8 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Join Our Journey</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Be part of the AI revolution. Start creating, innovating, and achieving more 
            with InQuo.site today.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
