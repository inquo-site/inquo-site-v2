import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import Landing from "./pages/Landing";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import BlogGenerator from "./pages/tools/BlogGenerator";
import CodeGenerator from "./pages/tools/CodeGenerator";
import GrammarFixer from "./pages/tools/GrammarFixer";
import AdCopyWriter from "./pages/tools/AdCopyWriter";
import TextSummarizer from "./pages/tools/TextSummarizer";
import ImageGenerator from "./pages/tools/ImageGenerator";
import NotFound from "./pages/NotFound";

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
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/tool/blog" element={<ProtectedRoute><BlogGenerator /></ProtectedRoute>} />
            <Route path="/tool/code" element={<ProtectedRoute><CodeGenerator /></ProtectedRoute>} />
            <Route path="/tool/grammar" element={<ProtectedRoute><GrammarFixer /></ProtectedRoute>} />
            <Route path="/tool/adcopy" element={<ProtectedRoute><AdCopyWriter /></ProtectedRoute>} />
            <Route path="/tool/summarizer" element={<ProtectedRoute><TextSummarizer /></ProtectedRoute>} />
            <Route path="/tool/image" element={<ProtectedRoute><ImageGenerator /></ProtectedRoute>} />
            
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
