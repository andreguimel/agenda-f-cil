import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import PublicBooking from "./pages/PublicBooking";
import QueueTracking from "./pages/QueueTracking";
import Dashboard from "./pages/Dashboard";
import AppointmentsPage from "./pages/AppointmentsPage";
import ProfessionalsManagement from "./pages/ProfessionalsManagement";
import BlockedTimesManagement from "./pages/BlockedTimesManagement";
import ShiftsManagement from "./pages/ShiftsManagement";
import DailyQueueManagement from "./pages/DailyQueueManagement";
import ClinicSettings from "./pages/ClinicSettings";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import TutorialPage from "./pages/TutorialPage";
import PatientsPage from "./pages/PatientsPage";
import AppointmentHistoryPage from "./pages/AppointmentHistoryPage";
import DashboardLayout from "./components/DashboardLayout";
import SubscriptionPage from "./pages/SubscriptionPage";
import CancelSubscriptionPage from "./pages/CancelSubscriptionPage";
import AdminDashboard from "./pages/AdminDashboard";
import CancelAppointment from "./pages/CancelAppointment";
import { SubscriptionGuard } from "./components/SubscriptionGuard";

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
            <Route path="/fila/:clinicSlug" element={<QueueTracking />} />
            <Route path="/cancelar-agendamento" element={<CancelAppointment />} />
            
            {/* Subscription pages */}
            <Route path="/assinatura" element={<SubscriptionPage />} />
            <Route path="/assinatura/cancelar" element={<CancelSubscriptionPage />} />
            
            {/* Admin dashboard */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Dashboard routes with shared layout - protected by subscription */}
            <Route path="/painel" element={
              <SubscriptionGuard>
                <DashboardLayout />
              </SubscriptionGuard>
            }>
              <Route index element={<Dashboard />} />
              <Route path="agendamentos" element={<AppointmentsPage />} />
              <Route path="historico" element={<AppointmentHistoryPage />} />
              <Route path="pacientes" element={<PatientsPage />} />
              <Route path="profissionais" element={<ProfessionalsManagement />} />
              <Route path="turnos" element={<ShiftsManagement />} />
              <Route path="fila" element={<DailyQueueManagement />} />
              <Route path="horarios" element={<BlockedTimesManagement />} />
              <Route path="configuracoes" element={<ClinicSettings />} />
              <Route path="tutorial" element={<TutorialPage />} />
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
