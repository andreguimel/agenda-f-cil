import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import PublicBooking from "./pages/PublicBooking";
import Dashboard from "./pages/Dashboard";
import ProfessionalsManagement from "./pages/ProfessionalsManagement";
import BlockedTimesManagement from "./pages/BlockedTimesManagement";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/agendar/:clinicSlug" element={<PublicBooking />} />
            
            {/* Dashboard routes with shared layout */}
            <Route path="/painel" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="profissionais" element={<ProfessionalsManagement />} />
              <Route path="horarios" element={<BlockedTimesManagement />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
