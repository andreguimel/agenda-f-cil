import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Calendar, Building2, User, Clock, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentDetails {
  id: string;
  date: string;
  time: string;
  status: string;
  patient_name: string;
  professional: {
    name: string;
    specialty: string;
  };
  clinic: {
    name: string;
  };
}

const CancelAppointment = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!token) {
        setError('Link de cancelamento inválido');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          status,
          patient_name,
          professionals:professional_id (name, specialty),
          clinics:clinic_id (name)
        `)
        .eq('cancellation_token', token)
        .maybeSingle();

      if (error || !data) {
        setError('Agendamento não encontrado');
        setLoading(false);
        return;
      }

      // Type assertion for the joined data
      const professional = data.professionals as unknown as { name: string; specialty: string };
      const clinic = data.clinics as unknown as { name: string };

      setAppointment({
        id: data.id,
        date: data.date,
        time: data.time,
        status: data.status,
        patient_name: data.patient_name,
        professional: professional,
        clinic: clinic,
      });

      if (data.status === 'cancelled') {
        setCancelled(true);
      }

      setLoading(false);
    };

    fetchAppointment();
  }, [token]);

  const handleCancel = async () => {
    if (!appointment || !token) return;

    setCancelling(true);

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('cancellation_token', token);

    if (error) {
      toast({
        title: 'Erro ao cancelar',
        description: 'Não foi possível cancelar o agendamento. Tente novamente.',
        variant: 'destructive',
      });
      setCancelling(false);
      return;
    }

    setCancelled(true);
    setCancelling(false);
    toast({
      title: 'Agendamento cancelado',
      description: 'Seu agendamento foi cancelado com sucesso.',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{error}</h1>
          <p className="text-muted-foreground mb-6">
            O link pode ter expirado ou o agendamento não existe mais.
          </p>
          <Link to="/">
            <Button variant="outline">Voltar ao início</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Agendamento Cancelado</h1>
          <p className="text-muted-foreground mb-6">
            Seu agendamento foi cancelado com sucesso. Esperamos vê-lo em breve!
          </p>
          <Link to="/">
            <Button variant="outline">Voltar ao início</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Cancelar Agendamento</h1>
          <p className="text-muted-foreground">
            Tem certeza que deseja cancelar este agendamento?
          </p>
        </div>

        {appointment && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Clínica</p>
                  <p className="font-medium text-foreground">{appointment.clinic.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Profissional</p>
                  <p className="font-medium text-foreground">{appointment.professional.name}</p>
                  <p className="text-sm text-muted-foreground">{appointment.professional.specialty}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium text-foreground">
                    {format(parseISO(appointment.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium text-foreground">{appointment.time.slice(0, 5)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Paciente</p>
                  <p className="font-medium text-foreground">{appointment.patient_name}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            variant="destructive"
            size="lg"
            className="w-full"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Cancelando...
              </>
            ) : (
              'Confirmar Cancelamento'
            )}
          </Button>
          
          <Link to="/" className="w-full">
            <Button variant="outline" size="lg" className="w-full">
              Voltar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CancelAppointment;
