import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import Landing from "./pages/NewLanding";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/ImprovedDashboard";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import About from "./pages/ImprovedAbout";
import Contact from "./pages/ImprovedContact";
import Privacy from "./pages/Privacy";
import DynamicTool from "./pages/tools/DynamicTool";
import ImageGenerator from "./pages/tools/ImageGenerator";
import NotFound from "./pages/NotFound";
import Blog from "./pages/ImprovedBlog";
import BlogPost from "./pages/BlogPost";
import Projects from "./pages/Projects";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            {/* Tools - No auth required, handled inside components */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tool/image" element={<ImageGenerator />} />
            <Route path="/tools/:toolType" element={<DynamicTool />} />
            <Route path="/tool/:toolType" element={<DynamicTool />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;