import { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Mail, Phone, CheckCircle, ArrowLeft, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchClinicBySlug, 
  fetchProfessionalsByClinic, 
  generateTimeSlots,
  createAppointment,
  Professional,
  TimeSlot,
  Clinic
} from '@/services/schedulingService';

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
}

type BookingStep = 'professional' | 'datetime' | 'form' | 'confirmation';

const PublicBooking = () => {
  const { clinicSlug } = useParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  
  const [step, setStep] = useState<BookingStep>('professional');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [dateOffset, setDateOffset] = useState(0);
  const visibleDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), dateOffset + i));

  // Fetch clinic and professionals on mount
  useEffect(() => {
    const loadClinicData = async () => {
      if (!clinicSlug) return;
      
      setLoading(true);
      const clinicData = await fetchClinicBySlug(clinicSlug);
      
      if (clinicData) {
        setClinic(clinicData);
        const professionalsData = await fetchProfessionalsByClinic(clinicData.id);
        setProfessionals(professionalsData);
      }
      
      setLoading(false);
    };

    loadClinicData();
  }, [clinicSlug]);

  // Fetch time slots when professional or date changes
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!selectedProfessional || !clinic) return;
      
      setLoadingSlots(true);
      // Pass clinicId to check Google Calendar busy times
      const slots = await generateTimeSlots(selectedDate, selectedProfessional.id, clinic.id);
      setTimeSlots(slots);
      setLoadingSlots(false);
    };

    loadTimeSlots();
  }, [selectedProfessional, selectedDate, clinic]);

  const handleSelectProfessional = (professional: Professional) => {
    setSelectedProfessional(professional);
    setStep('datetime');
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({
        title: 'Preencha todos os campos',
        description: 'Nome, email e telefone são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    if (!clinic || !selectedProfessional || !selectedSlot) return;

    setIsSubmitting(true);
    
    const { error } = await createAppointment({
      clinic_id: clinic.id,
      professional_id: selectedProfessional.id,
      date: format(selectedDate, 'yyyy-MM-dd'), // Use local date format instead of toISOString
      time: selectedSlot.time,
      patient_name: formData.name.trim(),
      patient_email: formData.email.trim(),
      patient_phone: formData.phone.trim(),
    });
    
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Erro ao agendar',
        description: 'Não foi possível confirmar o agendamento. Tente novamente.',
        variant: 'destructive',
      });
      return;
    }
    
    setStep('confirmation');
    toast({
      title: 'Agendamento confirmado!',
      description: 'Você receberá um email com os detalhes.',
    });
  };

  const handleBack = () => {
    if (step === 'datetime') setStep('professional');
    else if (step === 'form') setStep('datetime');
  };

  const resetBooking = () => {
    setStep('professional');
    setSelectedProfessional(null);
    setSelectedSlot(null);
    setFormData({ name: '', email: '', phone: '' });
    setDateOffset(0);
    setSelectedDate(new Date());
  };

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
          <p className="text-muted-foreground mb-4">Verifique o link e tente novamente</p>
          <Link to="/">
            <Button variant="outline">Voltar ao início</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">{clinic.name}</h1>
                <p className="text-xs text-muted-foreground">Agendamento Online</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <StepIndicator 
              number={1} 
              label="Profissional" 
              active={step === 'professional'} 
              completed={step !== 'professional'} 
            />
            <div className="w-8 md:w-16 h-px bg-border" />
            <StepIndicator 
              number={2} 
              label="Data e Hora" 
              active={step === 'datetime'} 
              completed={step === 'form' || step === 'confirmation'} 
            />
            <div className="w-8 md:w-16 h-px bg-border" />
            <StepIndicator 
              number={3} 
              label="Seus Dados" 
              active={step === 'form'} 
              completed={step === 'confirmation'} 
            />
            <div className="w-8 md:w-16 h-px bg-border" />
            <StepIndicator 
              number={4} 
              label="Confirmação" 
              active={step === 'confirmation'} 
              completed={false} 
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Step 1: Select Professional */}
          {step === 'professional' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-foreground mb-2">Escolha o Profissional</h2>
              <p className="text-muted-foreground mb-6">Selecione o profissional para sua consulta</p>
              
              {professionals.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum profissional disponível</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {professionals.map((professional) => (
                    <button
                      key={professional.id}
                      onClick={() => handleSelectProfessional(professional)}
                      className="w-full p-4 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{professional.name}</h3>
                          <p className="text-sm text-muted-foreground">{professional.specialty}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Consulta de {professional.duration} min
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 'datetime' && (
            <div className="animate-fade-in">
              <button onClick={handleBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedProfessional?.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedProfessional?.specialty}</p>
                </div>
              </div>

              {/* Date Selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Selecione a Data</h3>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setDateOffset(Math.max(0, dateOffset - 7))}
                      disabled={dateOffset === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setDateOffset(dateOffset + 7)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Month indicator */}
                <p className="text-sm font-medium text-foreground mb-3 text-center capitalize">
                  {(() => {
                    const firstMonth = format(visibleDates[0], 'MMMM yyyy', { locale: ptBR });
                    const lastMonth = format(visibleDates[visibleDates.length - 1], 'MMMM yyyy', { locale: ptBR });
                    return firstMonth === lastMonth ? firstMonth : `${firstMonth} - ${lastMonth}`;
                  })()}
                </p>
                
                <div className="grid grid-cols-7 gap-2">
                  {visibleDates.map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        isSameDay(date, selectedDate)
                          ? 'bg-primary text-primary-foreground shadow-glow'
                          : 'bg-secondary hover:bg-primary/10 text-secondary-foreground'
                      }`}
                    >
                      <span className="block text-xs uppercase">
                        {format(date, 'EEE', { locale: ptBR })}
                      </span>
                      <span className="block text-lg font-semibold">
                        {format(date, 'd')}
                      </span>
                    </button>
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
              </div>

              {/* Time Slots */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Horários Disponíveis</h3>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSelectSlot(slot)}
                        disabled={!slot.available}
                        className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                          !slot.available
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : selectedSlot?.id === slot.id
                            ? 'bg-primary text-primary-foreground shadow-glow'
                            : 'bg-secondary hover:bg-primary/10 text-secondary-foreground'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Contact Form */}
          {step === 'form' && (
            <div className="animate-fade-in">
              <button onClick={handleBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>

              {/* Selected Summary */}
              <div className="bg-secondary/50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{selectedProfessional?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedProfessional?.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {selectedSlot?.time}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">Seus Dados</h2>
              <p className="text-muted-foreground mb-6">Preencha suas informações para confirmar</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Nome completo
                  </Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full mt-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Confirmando...
                    </>
                  ) : (
                    'Confirmar Agendamento'
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirmation' && (
            <div className="animate-scale-in text-center py-8">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-2">Agendamento Confirmado!</h2>
              <p className="text-muted-foreground mb-8">Enviamos os detalhes para seu e-mail</p>

              <div className="bg-card rounded-xl border border-border p-6 text-left mb-8">
                <h3 className="font-semibold text-foreground mb-4">Detalhes da Consulta</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Profissional</p>
                      <p className="font-medium text-foreground">{selectedProfessional?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-medium text-foreground">
                        {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Horário</p>
                      <p className="font-medium text-foreground">{selectedSlot?.time}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={resetBooking}>
                  Novo Agendamento
                </Button>
                <Link to="/">
                  <Button variant="default">
                    Voltar ao Início
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

interface StepIndicatorProps {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}

const StepIndicator = ({ number, label, active, completed }: StepIndicatorProps) => (
  <div className="flex items-center gap-2">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
      completed 
        ? 'bg-success text-success-foreground' 
        : active 
        ? 'bg-primary text-primary-foreground shadow-glow' 
        : 'bg-muted text-muted-foreground'
    }`}>
      {completed ? <CheckCircle className="w-4 h-4" /> : number}
    </div>
    <span className={`text-sm hidden md:block ${active ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
      {label}
    </span>
  </div>
);

export default PublicBooking;
