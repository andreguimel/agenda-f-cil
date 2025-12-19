import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, User, Clock, Building2, Loader2, ListOrdered, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useParams } from 'react-router-dom';
import { 
  fetchClinicBySlug, 
  fetchClinicQueue,
  Clinic
} from '@/services/schedulingService';

const SHIFT_LABELS: Record<string, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  evening: 'Noite',
};

const QueueTracking = () => {
  const { clinicSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [queueData, setQueueData] = useState<Awaited<ReturnType<typeof fetchClinicQueue>>>([]);
  const today = format(new Date(), 'yyyy-MM-dd');

  const loadData = async (showRefreshing = false) => {
    if (!clinicSlug) return;
    
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    const clinicData = await fetchClinicBySlug(clinicSlug);
    if (clinicData) {
      setClinic(clinicData);
      const queue = await fetchClinicQueue(clinicData.id, today);
      setQueueData(queue);
    }
    
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, [clinicSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Clínica não encontrada</h2>
          <Link to="/"><Button variant="outline">Voltar ao início</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <ListOrdered className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">{clinic.name}</h1>
                <p className="text-xs text-muted-foreground">Fila de Atendimento</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => loadData(true)} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h2>
          <p className="text-muted-foreground">Acompanhe a ordem de atendimento</p>
        </div>

        {queueData.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum profissional com ordem de chegada hoje</p>
          </div>
        ) : (
          <div className="space-y-8">
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
                  {shifts.map(({ shiftName, appointments }) => (
                    <div key={shiftName} className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {SHIFT_LABELS[shiftName] || shiftName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({appointments.length} cliente{appointments.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      
                      {appointments.length === 0 ? (
                        <p className="text-sm text-muted-foreground pl-6">Nenhum cliente na fila</p>
                      ) : (
                        <div className="space-y-2 pl-6">
                          {appointments.map((apt, idx) => (
                            <div key={apt.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                {idx + 1}
                              </div>
                              <span className="text-foreground">{apt.patient_name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default QueueTracking;