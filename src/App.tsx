import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Index from "./pages/Index";
import VehicleRegistration from "./pages/VehicleRegistration";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ClientDashboard from "./pages/ClientDashboard";
import TermsAndConditions from "./pages/TermsAndConditions";
import NotFound from "./pages/NotFound";

const App = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthBanner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/registro" element={<VehicleRegistration />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clientdashboard" element={<ClientDashboard />} />
              <Route path="/success" element={<Success />} />
              <Route path="/cancel" element={<Cancel />} />
              <Route path="/terminos-y-condiciones" element={<TermsAndConditions />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

const AuthBanner = () => {
  const { isImpersonating, stopImpersonation, user } = useAuth();
  const navigate = useNavigate();

  if (!isImpersonating) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 flex justify-between items-center sticky top-0 z-[100] shadow-md animate-in fade-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
        <p className="text-sm font-medium">
          Simulando sesión: <span className="font-bold">{user?.phone || user?.user_metadata?.telefono}</span>
        </p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          stopImpersonation();
          navigate('/dashboard');
        }}
        className="h-8"
      >
        Detener Simulación
      </Button>
    </div>
  );
};

export default App;
