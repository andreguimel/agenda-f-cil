import { useState } from 'react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  Users, 
  Clock, 
  Search, 
  Filter, 
  Link as LinkIcon, 
  Copy, 
  Check,
  XCircle,
  MoreVertical,
  User,
  Phone,
  Mail,
  CalendarDays,
  ChevronRight,
  Menu,
  X,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { mockAppointments, professionals } from '@/data/mockData';
import { Appointment } from '@/types/scheduling';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [linkCopied, setLinkCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.patientEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProfessional = selectedProfessional === 'all' || apt.professionalId === selectedProfessional;
    return matchesSearch && matchesProfessional && apt.status !== 'cancelled';
  });

  const todayAppointments = filteredAppointments.filter(apt => {
    const aptDate = parseISO(apt.date);
    return isToday(aptDate);
  });

  const upcomingAppointments = filteredAppointments.filter(apt => {
    const aptDate = parseISO(apt.date);
    return !isToday(aptDate);
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/agendar/clinica-demo`);
    setLinkCopied(true);
    toast({
      title: 'Link copiado!',
      description: 'Compartilhe com seus pacientes',
    });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, status: 'cancelled' as const } : apt)
    );
    toast({
      title: 'Consulta cancelada',
      description: 'O paciente será notificado',
    });
  };

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                  <Calendar className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">AgendaFácil</span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-md hover:bg-secondary"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              <SidebarItem icon={<CalendarDays className="w-5 h-5" />} label="Agendamentos" active />
              <SidebarItem icon={<Users className="w-5 h-5" />} label="Profissionais" />
              <SidebarItem icon={<Clock className="w-5 h-5" />} label="Horários" />
            </div>
          </nav>

          {/* Share Link */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Link público</p>
            <div className="bg-secondary rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  /agendar/clinica-demo
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleCopyLink}
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar Link
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Link to="/">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-secondary"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Agendamentos</h1>
                <p className="text-sm text-muted-foreground">Gerencie suas consultas</p>
              </div>
            </div>
            
            <Link to="/agendar/clinica-demo">
              <Button variant="default" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Ver Página Pública</span>
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="px-4 lg:px-6 pb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos os profissionais</option>
              {professionals.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="p-4 lg:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Hoje" 
            value={todayAppointments.length} 
            icon={<Calendar className="w-5 h-5" />}
            color="primary"
          />
          <StatCard 
            label="Esta Semana" 
            value={filteredAppointments.length} 
            icon={<CalendarDays className="w-5 h-5" />}
            color="secondary"
          />
          <StatCard 
            label="Profissionais" 
            value={professionals.length} 
            icon={<Users className="w-5 h-5" />}
            color="secondary"
          />
          <StatCard 
            label="Taxa Confirmação" 
            value="94%" 
            icon={<Check className="w-5 h-5" />}
            color="success"
          />
        </div>

        {/* Appointments List */}
        <div className="p-4 lg:p-6 pt-0 space-y-6">
          {/* Today */}
          {todayAppointments.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
                Hoje
              </h2>
              <div className="space-y-3">
                {todayAppointments.map(apt => (
                  <AppointmentCard 
                    key={apt.id} 
                    appointment={apt} 
                    onCancel={handleCancelAppointment}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {upcomingAppointments.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">Próximos</h2>
              <div className="space-y-3">
                {upcomingAppointments.map(apt => (
                  <AppointmentCard 
                    key={apt.id} 
                    appointment={apt} 
                    onCancel={handleCancelAppointment}
                    showDate
                  />
                ))}
              </div>
            </section>
          )}

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum agendamento</h3>
              <p className="text-muted-foreground">Compartilhe seu link para receber agendamentos</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, active }: SidebarItemProps) => (
  <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
    active 
      ? 'bg-primary/10 text-primary font-medium' 
      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
  }`}>
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success';
}

const StatCard = ({ label, value, icon, color }: StatCardProps) => {
  const bgColor = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-success/10 text-success',
  }[color];

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: (id: string) => void;
  showDate?: boolean;
}

const AppointmentCard = ({ appointment, onCancel, showDate }: AppointmentCardProps) => {
  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "d 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{appointment.patientName}</h3>
            <p className="text-sm text-muted-foreground">{appointment.professionalName}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              {showDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(appointment.date)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {appointment.time}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {appointment.patientPhone}
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {appointment.patientEmail}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 text-destructive"
              onClick={() => onCancel(appointment.id)}
            >
              <XCircle className="w-4 h-4" />
              Cancelar Consulta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Dashboard;
