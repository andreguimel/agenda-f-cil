import { useState, useEffect } from 'react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  Search, 
  XCircle,
  MoreVertical,
  User,
  Phone,
  Mail,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useOutletContext } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  fetchAppointmentsByClinic,
  fetchProfessionalsByClinic,
  getUserProfile,
  linkProfileToClinic,
  updateAppointmentStatus,
  markPatientArrived,
  Appointment,
  Professional,
  Clinic
} from '@/services/schedulingService';

const DEMO_CLINIC_ID = '550e8400-e29b-41d4-a716-446655440000';

const AppointmentsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { clinic } = useOutletContext<{ clinic: Clinic | null }>();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');

  // Load data
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

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.patient_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProfessional = selectedProfessional === 'all' || apt.professional_id === selectedProfessional;
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

  const handleCancelAppointment = async (id: string) => {
    const { error } = await updateAppointmentStatus(id, 'cancelled');
    
    if (error) {
      toast({
        title: 'Erro ao cancelar',
        description: 'Não foi possível cancelar a consulta',
        variant: 'destructive',
      });
      return;
    }
    
    setAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, status: 'cancelled' } : apt)
    );
    toast({
      title: 'Consulta cancelada',
      description: 'O paciente será notificado',
    });
  };

  const handleMarkArrived = async (id: string) => {
    const { data, error, queuePosition } = await markPatientArrived(id);
    
    if (error || !data) {
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar a chegada do paciente',
        variant: 'destructive',
      });
      return;
    }
    
    setAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, status: 'confirmed', queue_position: queuePosition } : apt)
    );
    toast({
      title: 'Paciente na fila',
      description: `Posição na fila: ${queuePosition}º`,
    });
  };

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
            <h1 className="text-xl font-bold text-foreground">Agendamentos</h1>
            <p className="text-sm text-muted-foreground">Gerencie suas consultas</p>
          </div>
          
          <Link to={`/agendar/${clinic?.slug || 'clinica-demo'}`}>
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

      {/* Appointments List */}
      <div className="p-4 lg:p-6 space-y-6">
        {/* Today */}
        {todayAppointments.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
              Hoje ({todayAppointments.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {todayAppointments.map(apt => (
                <AppointmentCard 
                  key={apt.id} 
                  appointment={apt} 
                  onCancel={handleCancelAppointment}
                  onMarkArrived={handleMarkArrived}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcomingAppointments.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3">Próximos ({upcomingAppointments.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {upcomingAppointments.map(apt => (
                <AppointmentCard 
                  key={apt.id} 
                  appointment={apt} 
                  onCancel={handleCancelAppointment}
                  onMarkArrived={handleMarkArrived}
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
    </div>
  );
};

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: (id: string) => void;
  onMarkArrived: (id: string) => void;
  showDate?: boolean;
}

const AppointmentCard = ({ appointment, onCancel, onMarkArrived, showDate }: AppointmentCardProps) => {
  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "d 'de' MMMM", { locale: ptBR });
  };

  const professionalName = appointment.professional?.name || 'Profissional';
  const isArrivalOrder = !!appointment.shift_name;
  const isWaitingArrival = isArrivalOrder && appointment.status === 'scheduled';

  const SHIFT_LABELS: Record<string, string> = {
    morning: 'Manhã',
    afternoon: 'Tarde',
    evening: 'Noite',
  };

  return (
    <div className="bg-card rounded-lg border border-border p-3 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm text-foreground truncate">{appointment.patient_name}</h3>
              <p className="text-xs text-muted-foreground truncate">{professionalName}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
            {showDate && (
              <span className="flex items-center gap-1 bg-secondary px-1.5 py-0.5 rounded">
                <Calendar className="w-3 h-3" />
                {formatDate(appointment.date)}
              </span>
            )}
            {isArrivalOrder ? (
              <>
                <span className="flex items-center gap-1 bg-secondary px-1.5 py-0.5 rounded">
                  <Clock className="w-3 h-3" />
                  {SHIFT_LABELS[appointment.shift_name!] || appointment.shift_name}
                </span>
                {appointment.queue_position && (
                  <span className="flex items-center gap-1 text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
                    {appointment.queue_position}º
                  </span>
                )}
              </>
            ) : (
              <span className="flex items-center gap-1 bg-secondary px-1.5 py-0.5 rounded">
                <Clock className="w-3 h-3" />
                {appointment.time.substring(0, 5)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {isWaitingArrival && (
            <Button 
              variant="default" 
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => onMarkArrived(appointment.id)}
            >
              <Check className="w-3 h-3 mr-1" />
              Chegou
            </Button>
          )}
          
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2 text-xs">
                  <Phone className="w-3 h-3" />
                  {appointment.patient_phone}
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 text-xs">
                  <Mail className="w-3 h-3" />
                  {appointment.patient_email}
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-destructive text-xs"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <XCircle className="w-3 h-3" />
                    Cancelar
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar consulta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá cancelar a consulta de <strong>{appointment.patient_name}</strong> e 
                  remover o evento do Google Calendar. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Voltar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onCancel(appointment.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Sim, cancelar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;