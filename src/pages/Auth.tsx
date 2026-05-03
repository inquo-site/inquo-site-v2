import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Mail, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SEOHead } from "@/components/SEOHead";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
});

const phoneSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone format (use +country code)').max(15),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
});

const signupEmailSchema = emailSchema.extend({
  confirmPassword: z.string(),
  fullName: z.string().min(1, 'Name is required').max(100, 'Name too long'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const sanitizeAuthError = (error: any): string => {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password',
    'User not found': 'Invalid email or password',
    'Email not confirmed': 'Please verify your email address',
    'Invalid email': 'Please enter a valid email address',
  };
  
  for (const [key, value] of Object.entries(errorMap)) {
    if (error.message?.includes(key)) {
      return value;
    }
  }
  
  return 'Authentication failed. Please try again.';
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent!",
        description: "Check your email for the password reset link.",
      });
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      if (authMode === "email") {
        if (isLogin) {
          const validation = emailSchema.safeParse({ email, password });
          if (!validation.success) {
            toast({
              title: "Validation Error",
              description: validation.error.issues[0].message,
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        } else {
          const validation = signupEmailSchema.safeParse({ email, password, confirmPassword, fullName });
          if (!validation.success) {
            toast({
              title: "Validation Error",
              description: validation.error.issues[0].message,
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        }
      } else {
        const validation = phoneSchema.safeParse({ phone, password });
        if (!validation.success) {
          toast({
            title: "Validation Error",
            description: validation.error.issues[0].message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      if (authMode === "email") {
        if (isLogin) {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
          });
          navigate("/dashboard");
        } else {
          // Validate passwords match
          if (password !== confirmPassword) {
            throw new Error("Passwords do not match");
          }

          if (password.length < 6) {
            throw new Error("Password must be at least 6 characters");
          }

          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/dashboard`,
              data: {
                full_name: fullName,
              },
            },
          });
          
          if (error) throw error;
          
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
        }
      } else {
        // Phone auth
        if (isLogin) {
          const { error } = await supabase.auth.signInWithPassword({
            phone,
            password,
          });
          
          if (error) throw error;
          
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
          });
          navigate("/dashboard");
        } else {
          const { error } = await supabase.auth.signUp({
            phone,
            password,
            options: {
              channel: 'sms',
            },
          });
          
          if (error) throw error;
          
          toast({
            title: "Account created!",
            description: "Please check your phone for verification code.",
          });
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: sanitizeAuthError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="glass-card w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-accent" />
              <h1 className="text-2xl font-bold">InQuo.site</h1>
            </div>
            <h2 className="text-xl font-semibold mb-2">Reset Password</h2>
            <p className="text-muted-foreground">
              Enter your email to receive a password reset link
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsForgotPassword(false)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back to sign in
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <SEOHead
        title={isLogin ? "Sign In" : "Create Account"}
        description={isLogin ? "Sign in to Inquo.Site to access 160+ AI tools and AI agents." : "Create a free Inquo.Site account and unlock 160+ AI tools, agents, and credits."}
        keywords="login, sign up, register, AI tools account, Inquo.site auth"
        canonicalUrl="https://inquo.site/auth"
      />
      <Card className="glass-card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-bold">InQuo.site</h1>
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-muted-foreground">
            {isLogin ? "Sign in to access your AI tools" : "Start your AI journey today"}
          </p>
        </div>

        {/* Google Sign In */}
        <Button
          onClick={handleGoogleAuth}
          variant="outline"
          className="w-full mb-4"
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            Or continue with
          </span>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={authMode === "email" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setAuthMode("email")}
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button
            type="button"
            variant={authMode === "phone" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setAuthMode("phone")}
          >
            <Phone className="w-4 h-4 mr-2" />
            Phone
          </Button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          )}

          {authMode === "email" ? (
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          )}

          {isLogin && authMode === "email" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={loading}
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
