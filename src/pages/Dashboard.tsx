import { useState, useEffect } from 'react';
import { format, isToday, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  Users, 
  Clock, 
  CalendarDays,
  Check,
  Loader2,
  TrendingUp,
  UserCheck,
  XCircle,
  ArrowRight,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchAppointmentsByClinic,
  fetchProfessionalsByClinic,
  getUserProfile,
  linkProfileToClinic,
  Appointment,
  Professional,
  Clinic
} from '@/services/schedulingService';

const DEMO_CLINIC_ID = '550e8400-e29b-41d4-a716-446655440000';

const Dashboard = () => {
  const { user } = useAuth();
  const { clinic } = useOutletContext<{ clinic: Clinic | null }>();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      const profile = await getUserProfile(user.id);
      let clinicId = profile?.clinic_id;
      
      if (!clinicId) {
        await linkProfileToClinic(user.id, DEMO_CLINIC_ID);
        clinicId = DEMO_CLINIC_ID;
      }
      
      const [appointmentsData, professionalsData] = await Promise.all([
        fetchAppointmentsByClinic(clinicId),
        fetchProfessionalsByClinic(clinicId),
      ]);
      
      setAppointments(appointmentsData);
      setProfessionals(professionalsData);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const activeAppointments = appointments.filter(apt => apt.status !== 'cancelled');
  
  const todayAppointments = activeAppointments.filter(apt => {
    const aptDate = parseISO(apt.date);
    return isToday(aptDate);
  });

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const weekAppointments = activeAppointments.filter(apt => {
    const aptDate = parseISO(apt.date);
    return aptDate >= weekStart && aptDate <= weekEnd;
  });

  const monthAppointments = activeAppointments.filter(apt => {
    const aptDate = parseISO(apt.date);
    return aptDate >= monthStart && aptDate <= monthEnd;
  });

  const confirmedCount = activeAppointments.filter(apt => apt.status === 'confirmed').length;
  const confirmationRate = activeAppointments.length > 0 
    ? Math.round((confirmedCount / activeAppointments.length) * 100) 
    : 0;

  const cancelledCount = appointments.filter(apt => apt.status === 'cancelled').length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 lg:top-0 z-20">
        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {format(now, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          
          <Link to={`/agendar/${clinic?.slug || 'clinica-demo'}`}>
            <Button variant="default" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Ver Página Pública</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="p-4 lg:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Agendamentos Hoje" 
          value={todayAppointments.length} 
          icon={<Calendar className="w-5 h-5" />}
          color="primary"
        />
        <StatCard 
          label="Esta Semana" 
          value={weekAppointments.length} 
          icon={<CalendarDays className="w-5 h-5" />}
          color="secondary"
        />
        <StatCard 
          label="Este Mês" 
          value={monthAppointments.length} 
          icon={<TrendingUp className="w-5 h-5" />}
          color="secondary"
        />
        <StatCard 
          label="Taxa Confirmação" 
          value={`${confirmationRate}%`} 
          icon={<Check className="w-5 h-5" />}
          color="success"
        />
      </div>

      {/* Quick Stats Row */}
      <div className="px-4 lg:px-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStat 
          label="Profissionais Ativos" 
          value={professionals.length}
          icon={<Users className="w-4 h-4" />}
        />
        <QuickStat 
          label="Pacientes Confirmados" 
          value={confirmedCount}
          icon={<UserCheck className="w-4 h-4" />}
        />
        <QuickStat 
          label="Cancelamentos" 
          value={cancelledCount}
          icon={<XCircle className="w-4 h-4" />}
        />
        <QuickStat 
          label="Na Fila Hoje" 
          value={todayAppointments.filter(apt => apt.queue_position).length}
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* Quick Actions & Today's Summary */}
      <div className="p-4 lg:p-6 grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4">Acesso Rápido</h2>
          <div className="space-y-2">
            <Link to="/painel/agendamentos" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <span className="font-medium">Ver Agendamentos</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
            <Link to="/painel/configuracoes" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="font-medium">Dados da Clínica</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
            <Link to="/painel/profissionais" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-medium">Gerenciar Profissionais</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Hoje</h2>
            <Link to="/painel/agendamentos">
              <Button variant="ghost" size="sm">
                Ver todos
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          {todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {todayAppointments.slice(0, 4).map(apt => (
                <div key={apt.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{apt.patient_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {apt.shift_name ? (
                        apt.shift_name === 'morning' ? 'Manhã' : 
                        apt.shift_name === 'afternoon' ? 'Tarde' : 'Noite'
                      ) : apt.time.substring(0, 5)}
                    </p>
                  </div>
                  {apt.queue_position && (
                    <span className="text-sm font-medium text-primary">
                      {apt.queue_position}º
                    </span>
                  )}
                </div>
              ))}
              {todayAppointments.length > 4 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{todayAppointments.length - 4} mais agendamentos
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum agendamento para hoje</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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

interface QuickStatProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

const QuickStat = ({ label, value, icon }: QuickStatProps) => (
  <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
    <div className="text-muted-foreground">{icon}</div>
    <div>
      <p className="text-lg font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

export default Dashboard;