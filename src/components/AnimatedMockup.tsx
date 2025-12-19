import { useState, useEffect } from 'react';
import { Calendar, User, Clock, CheckCircle, ArrowRight, Smartphone, Bell } from 'lucide-react';

const AnimatedMockup = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const steps = [
    { 
      id: 0, 
      title: 'Paciente acessa o link',
      description: 'Compartilhe seu link público'
    },
    { 
      id: 1, 
      title: 'Escolhe o profissional',
      description: 'Lista de especialistas disponíveis'
    },
    { 
      id: 2, 
      title: 'Seleciona data e horário',
      description: 'Agenda em tempo real'
    },
    { 
      id: 3, 
      title: 'Confirma o agendamento',
      description: 'Dados do paciente'
    },
    { 
      id: 4, 
      title: 'Você recebe a notificação',
      description: 'Tudo sincronizado!'
    },
  ];

  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAnimating, steps.length]);

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 10000);
  };

  return (
    <div className="relative">
      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => handleStepClick(index)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 ${
              currentStep === index
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            }`}
          >
            <span className="text-xs font-bold">{index + 1}</span>
            <span className="hidden md:inline text-sm font-medium">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Phone Mockup Container */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        {/* Patient Phone */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[3rem] blur-2xl opacity-50" />
          <div className="relative bg-card rounded-[2.5rem] p-3 shadow-2xl border border-border/50">
            <div className="bg-background rounded-[2rem] overflow-hidden w-[280px] h-[560px] relative">
              {/* Phone Header */}
              <div className="bg-secondary/50 px-6 py-4 flex items-center justify-between border-b border-border/30">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">agendaberta.com</span>
                </div>
                <div className="w-16 h-5 bg-foreground/10 rounded-full" />
              </div>

              {/* Content Area */}
              <div className="p-4 h-[500px] overflow-hidden">
                {/* Step 0: Access Link */}
                <div className={`absolute inset-0 p-4 pt-16 transition-all duration-700 ${
                  currentStep === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'
                }`}>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                      <Calendar className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Clínica Saúde Total</h3>
                    <p className="text-sm text-muted-foreground">Agende sua consulta</p>
                  </div>
                  <div className="bg-primary text-primary-foreground rounded-xl py-4 px-6 text-center font-semibold shadow-lg shadow-primary/25 animate-pulse">
                    Agendar Agora
                  </div>
                </div>

                {/* Step 1: Choose Professional */}
                <div className={`absolute inset-0 p-4 pt-16 transition-all duration-700 ${
                  currentStep === 1 ? 'opacity-100 translate-x-0' : currentStep > 1 ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
                }`}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Escolha o profissional</p>
                  <div className="space-y-3">
                    {[
                      { name: 'Dra. Ana Silva', specialty: 'Clínica Geral', selected: true },
                      { name: 'Dr. Carlos Santos', specialty: 'Cardiologia', selected: false },
                      { name: 'Dra. Marina Costa', specialty: 'Dermatologia', selected: false },
                    ].map((prof, i) => (
                      <div
                        key={prof.name}
                        className={`p-4 rounded-xl border-2 transition-all duration-500 ${
                          prof.selected
                            ? 'border-primary bg-primary/10 shadow-md scale-[1.02]'
                            : 'border-border/50'
                        }`}
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            prof.selected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                          }`}>
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{prof.name}</p>
                            <p className="text-xs text-muted-foreground">{prof.specialty}</p>
                          </div>
                          {prof.selected && (
                            <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 2: Select Date/Time */}
                <div className={`absolute inset-0 p-4 pt-16 transition-all duration-700 ${
                  currentStep === 2 ? 'opacity-100 translate-x-0' : currentStep > 2 ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
                }`}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Escolha o horário</p>
                  <div className="bg-secondary/30 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Dezembro 2024</span>
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-xs">{'<'}</div>
                        <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-xs">{'>'}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                        <div key={i} className="text-muted-foreground py-1">{d}</div>
                      ))}
                      {[...Array(31)].map((_, i) => (
                        <div
                          key={i}
                          className={`py-1 rounded transition-all ${
                            i === 18
                              ? 'bg-primary text-primary-foreground font-bold scale-110'
                              : i < 15 || [20, 21, 27, 28].includes(i)
                              ? 'text-muted-foreground/40'
                              : 'text-foreground hover:bg-secondary'
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Horários</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['09:00', '09:30', '10:00', '10:30', '14:00', '14:30'].map((time, i) => (
                      <div
                        key={time}
                        className={`py-2 rounded-lg text-center text-sm font-medium transition-all ${
                          i === 2
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                            : 'bg-secondary text-foreground'
                        }`}
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 3: Confirm */}
                <div className={`absolute inset-0 p-4 pt-16 transition-all duration-700 ${
                  currentStep === 3 ? 'opacity-100 translate-x-0' : currentStep > 3 ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
                }`}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Confirme seus dados</p>
                  <div className="space-y-3">
                    <div className="bg-secondary/30 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">Nome</p>
                      <p className="text-sm font-medium text-foreground">Maria Oliveira</p>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">Telefone</p>
                      <p className="text-sm font-medium text-foreground">(11) 99999-8888</p>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="text-sm font-medium text-foreground">maria@email.com</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Resumo</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Dra. Ana Silva • 19/12 às 10:00</p>
                  </div>
                  <div className="mt-4 bg-primary text-primary-foreground rounded-xl py-3 px-6 text-center font-semibold shadow-lg shadow-primary/25">
                    Confirmar Agendamento
                  </div>
                </div>

                {/* Step 4: Success */}
                <div className={`absolute inset-0 p-4 pt-16 transition-all duration-700 ${
                  currentStep === 4 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                }`}>
                  <div className="text-center pt-8">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Agendado!</h3>
                    <p className="text-sm text-muted-foreground mb-4">Sua consulta foi confirmada</p>
                    <div className="bg-secondary/50 rounded-xl p-4 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Dra. Ana Silva</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">19 de Dezembro, 2024</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">10:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center mt-4 text-sm font-medium text-muted-foreground">📱 Visão do Paciente</p>
        </div>

        {/* Arrow */}
        <div className={`hidden lg:flex items-center justify-center transition-all duration-500 ${
          currentStep === 4 ? 'opacity-100 scale-100' : 'opacity-30 scale-90'
        }`}>
          <div className="flex flex-col items-center gap-2">
            <ArrowRight className="w-8 h-8 text-primary animate-pulse" />
            <span className="text-xs text-muted-foreground font-medium">Sincroniza</span>
          </div>
        </div>

        {/* Clinic Dashboard */}
        <div className={`relative transition-all duration-700 ${
          currentStep === 4 ? 'opacity-100 translate-x-0' : 'opacity-50 translate-x-4'
        }`}>
          <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-50" />
          <div className="relative bg-card rounded-2xl p-4 shadow-2xl border border-border/50 w-[320px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-foreground text-sm">Painel da Clínica</span>
              </div>
              <div className={`relative transition-all duration-500 ${currentStep === 4 ? 'animate-bounce' : ''}`}>
                <Bell className="w-5 h-5 text-muted-foreground" />
                {currentStep === 4 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
                )}
              </div>
            </div>

            {/* Notification */}
            <div className={`mb-4 p-3 rounded-xl border transition-all duration-500 ${
              currentStep === 4 
                ? 'bg-green-500/10 border-green-500/30 scale-100' 
                : 'bg-secondary/30 border-border/30 scale-95 opacity-50'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-foreground">Novo agendamento!</span>
              </div>
              <p className="text-xs text-muted-foreground">Maria Oliveira • 19/12 às 10:00</p>
            </div>

            {/* Mini Calendar */}
            <div className="bg-secondary/30 rounded-xl p-3 mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Hoje - 19 de Dezembro</p>
              <div className="space-y-2">
                {[
                  { time: '08:00', name: 'João Silva', status: 'confirmed' },
                  { time: '09:00', name: 'Ana Costa', status: 'confirmed' },
                  { time: '10:00', name: 'Maria Oliveira', status: currentStep === 4 ? 'new' : 'empty' },
                  { time: '11:00', name: 'Disponível', status: 'empty' },
                ].map((slot, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-500 ${
                      slot.status === 'new' 
                        ? 'bg-green-500/20 border border-green-500/30 scale-[1.02]' 
                        : slot.status === 'confirmed'
                        ? 'bg-primary/10'
                        : 'bg-secondary/50'
                    }`}
                  >
                    <span className="text-xs font-mono text-muted-foreground w-10">{slot.time}</span>
                    <span className={`text-xs font-medium ${
                      slot.status === 'empty' ? 'text-muted-foreground' : 'text-foreground'
                    }`}>
                      {slot.name}
                    </span>
                    {slot.status === 'new' && (
                      <span className="ml-auto text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">Novo</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>3 consultas hoje</span>
              <span className="text-primary font-medium">Ver agenda completa →</span>
            </div>
          </div>
          <p className="text-center mt-4 text-sm font-medium text-muted-foreground">💻 Visão da Clínica</p>
        </div>
      </div>

      {/* Current Step Description */}
      <div className="text-center mt-8">
        <p className="text-lg font-semibold text-foreground">{steps[currentStep].title}</p>
        <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
      </div>
    </div>
  );
};

export default AnimatedMockup;
