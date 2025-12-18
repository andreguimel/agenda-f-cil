import { Calendar, Clock, Users, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Agendaberta
            </span>
          </div>
          <Link to="/painel">
            <Button variant="outline" size="sm" className="rounded-full px-6 border-primary/20 hover:bg-primary/5 hover:border-primary/40">
              Painel do Consultório
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-16 pb-24 lg:pt-24">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Agendamento online simplificado</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-8 tracking-tight">
            Gerencie seus
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              agendamentos
            </span>
            <br />
            com facilidade
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Simplifique a rotina do seu consultório. Seus pacientes agendam online, 
            você gerencia tudo em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/agendar/clinica-demo">
              <Button size="lg" className="rounded-full px-8 h-14 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Experimentar Agendamento
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/painel">
              <Button variant="ghost" size="lg" className="rounded-full px-8 h-14 text-base hover:bg-secondary">
                Acessar Painel
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-28 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <FeatureCard
            icon={<Calendar className="w-6 h-6" />}
            title="Agendamento Online"
            description="Pacientes agendam 24h pelo link público, sem ligações"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Múltiplos Profissionais"
            description="Gerencie toda a equipe em uma única plataforma"
          />
          <FeatureCard
            icon={<Clock className="w-6 h-6" />}
            title="Sincronização"
            description="Integra com Google Calendar automaticamente"
          />
          <FeatureCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Confirmação Instantânea"
            description="Paciente recebe confirmação imediata do agendamento"
          />
        </div>

        {/* Demo Preview */}
        <div className="mt-28 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
            <div className="bg-secondary/30 px-6 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/50" />
                <div className="w-3 h-3 rounded-full bg-warning/50" />
                <div className="w-3 h-3 rounded-full bg-success/50" />
                <span className="ml-4 text-xs text-muted-foreground font-medium">agendaberta.com/agendar</span>
              </div>
            </div>
            <div className="p-8 lg:p-12">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider text-muted-foreground">Profissionais</h3>
                  <div className="space-y-3">
                    {['Dra. Ana Silva', 'Dr. Carlos Santos', 'Dra. Marina Costa'].map((name, i) => (
                      <div 
                        key={name} 
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          i === 0 
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                            : 'border-border/50 hover:border-primary/30 hover:bg-secondary/50'
                        }`}
                      >
                        <p className="font-semibold text-foreground">{name}</p>
                        <p className="text-sm text-muted-foreground">
                          {i === 0 ? 'Clínica Geral' : i === 1 ? 'Cardiologia' : 'Dermatologia'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider text-muted-foreground">Horários Disponíveis</h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'].map((time, i) => (
                      <button
                        key={time}
                        className={`py-3 px-3 rounded-xl text-sm font-semibold transition-all ${
                          i === 4
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                            : [2, 7, 11].includes(i)
                            ? 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed line-through'
                            : 'bg-secondary hover:bg-primary/10 text-secondary-foreground hover:text-primary'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground">Agendaberta</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Agendaberta. Simplifique seus agendamentos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 hover:bg-card/80 hover:shadow-xl transition-all duration-300 group">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300">
      {icon}
    </div>
    <h3 className="font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
