import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Users, 
  User, 
  Clock, 
  Loader2, 
  RefreshCw,
  UserCheck,
  UserX,
  CalendarDays,
  Phone,
  CheckCircle2,
  Undo2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchClinicQueue,
  markPatientArrived,
  markPatientAttended,
  undoPatientArrived,
  undoPatientAttended,
  Clinic,
  Appointment
} from '@/services/schedulingService';

const SHIFT_LABELS: Record<string, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  evening: 'Noite',
};

const DailyQueueManagement = () => {
  const { clinic } = useOutletContext<{ clinic: Clinic | null }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [queueData, setQueueData] = useState<Awaited<ReturnType<typeof fetchClinicQueue>>>([]);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const loadData = useCallback(async (showRefreshing = false) => {
    if (!clinic) return;
    
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    const queue = await fetchClinicQueue(clinic.id, dateStr);
    setQueueData(queue);
    
    setLoading(false);
    setRefreshing(false);
  }, [clinic, dateStr]);

  // Load data on mount and when clinic/date changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!clinic) return;

    const channel = supabase
      .channel('queue-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `clinic_id=eq.${clinic.id}`,
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          // Reload data when any appointment changes
          loadData(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinic, loadData]);

  const handleMarkArrived = async (appointment: Appointment) => {
    const { error, queuePosition } = await markPatientArrived(appointment.id);
    
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar chegada',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Paciente chegou!',
      description: `${appointment.patient_name} - Posição #${queuePosition}`,
    });
    
    loadData(true);
  };

  const handleMarkAttended = async (appointment: Appointment) => {
    const { error } = await markPatientAttended(appointment.id);
    
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar como atendido',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Paciente atendido!',
      description: `${appointment.patient_name} foi marcado como atendido`,
    });
    
    loadData(true);
  };

  const handleUndoArrived = async (appointment: Appointment) => {
    const { error } = await undoPatientArrived(appointment.id);
    
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível desfazer',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Desfeito',
      description: `${appointment.patient_name} voltou para aguardando`,
    });
    
    loadData(true);
  };

  const handleUndoAttended = async (appointment: Appointment) => {
    const { error } = await undoPatientAttended(appointment.id);
    
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível desfazer',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Desfeito',
      description: `${appointment.patient_name} voltou para a fila`,
    });
    
    loadData(true);
  };

  // Separate waiting (scheduled), arrived (confirmed with queue_position), and completed
  const getWaitingArrivedCompleted = (appointments: Appointment[]) => {
    const waiting = appointments.filter(a => a.status === 'scheduled');
    const arrived = appointments.filter(a => a.status === 'confirmed' && a.queue_position !== null)
      .sort((a, b) => (a.queue_position || 0) - (b.queue_position || 0));
    const completed = appointments.filter(a => a.status === 'completed')
      .sort((a, b) => (a.queue_position || 0) - (b.queue_position || 0));
    return { waiting, arrived, completed };
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fila do Dia</h1>
          <p className="text-muted-foreground">Gerencie quem chegou e a ordem de atendimento</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarDays className="w-4 h-4" />
                {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" size="icon" onClick={() => loadData(true)} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {queueData.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum profissional com ordem de chegada para este dia</p>
        </div>
      ) : (
        <div className="space-y-6">
          {queueData.map(({ professional, shifts }) => (
            <div key={professional.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="bg-primary/5 px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{professional.name}</h3>
                    <p className="text-sm text-muted-foreground">{professional.specialty}</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-border">
                {shifts.map(({ shiftName, appointments }) => {
                  const { waiting, arrived, completed } = getWaitingArrivedCompleted(appointments);
                  
                  return (
                    <div key={shiftName} className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {SHIFT_LABELS[shiftName] || shiftName}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Waiting to arrive */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <UserX className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-foreground">
                              Aguardando ({waiting.length})
                            </span>
                          </div>
                          {waiting.length === 0 ? (
                            <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                              Nenhum aguardando
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {waiting.map((apt) => (
                                <div key={apt.id} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-sm text-foreground">{apt.patient_name}</span>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="h-7 text-xs"
                                      onClick={() => handleMarkArrived(apt)}
                                    >
                                      <UserCheck className="w-3 h-3 mr-1" />
                                      Chegou
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="w-3 h-3" />
                                    <span>{apt.patient_phone}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Arrived - in queue */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <UserCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium text-foreground">
                              Na fila ({arrived.length})
                            </span>
                          </div>
                          {arrived.length === 0 ? (
                            <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                              Nenhum na fila
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {arrived.map((apt) => (
                                <div key={apt.id} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                                        {apt.queue_position}
                                      </div>
                                      <span className="font-medium text-sm text-foreground">{apt.patient_name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                        onClick={() => handleUndoArrived(apt)}
                                        title="Desfazer chegada"
                                      >
                                        <Undo2 className="w-3 h-3" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="default"
                                        className="h-7 text-xs"
                                        onClick={() => handleMarkAttended(apt)}
                                      >
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Atendido
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground ml-9">
                                    <Phone className="w-3 h-3" />
                                    <span>{apt.patient_phone}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Completed */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-foreground">
                              Atendidos ({completed.length})
                            </span>
                          </div>
                          {completed.length === 0 ? (
                            <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                              Nenhum atendido
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {completed.map((apt) => (
                                <div key={apt.id} className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-blue-500/50 flex items-center justify-center text-xs font-bold text-white">
                                        {apt.queue_position}
                                      </div>
                                      <span className="font-medium text-sm text-foreground">{apt.patient_name}</span>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleUndoAttended(apt)}
                                      title="Desfazer atendido"
                                    >
                                      <Undo2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground ml-8">
                                    <Phone className="w-3 h-3" />
                                    <span>{apt.patient_phone}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyQueueManagement;
