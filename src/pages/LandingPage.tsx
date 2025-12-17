import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Agendaberta</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/agendar/clinica-demo">
              <Button variant="ghost" size="sm">
                Agendar Consulta
              </Button>
            </Link>
            <Link to="/painel">
              <Button variant="outline" size="sm">
                Painel do Consultório
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-12 pb-24 lg:pt-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Agendamento online simplificado
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Gerencie seus agendamentos com{' '}
            <span className="text-primary">facilidade</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Simplifique a rotina do seu consultório. Seus pacientes agendam online, 
            você gerencia tudo em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/agendar/clinica-demo">
              <Button variant="hero" size="xl">
                Experimentar Agendamento
              </Button>
            </Link>
            <Link to="/painel">
              <Button variant="hero-outline" size="xl">
                Acessar Painel
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24 animate-slide-up" style={{ animationDelay: '0.2s' }}>
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
        <div className="mt-24 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="bg-secondary/50 px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
            </div>
            <div className="p-8 lg:p-12">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <h3 className="font-semibold text-foreground mb-4">Profissionais</h3>
                  <div className="space-y-3">
                    {['Dra. Ana Silva', 'Dr. Carlos Santos', 'Dra. Marina Costa'].map((name, i) => (
                      <div 
                        key={name} 
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          i === 0 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <p className="font-medium text-foreground">{name}</p>
                        <p className="text-sm text-muted-foreground">
                          {i === 0 ? 'Clínica Geral' : i === 1 ? 'Cardiologia' : 'Dermatologia'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <h3 className="font-semibold text-foreground mb-4">Horários Disponíveis</h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'].map((time, i) => (
                      <button
                        key={time}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          i === 4
                            ? 'bg-primary text-primary-foreground shadow-glow'
                            : [2, 7, 11].includes(i)
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-secondary hover:bg-primary/10 text-secondary-foreground'
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
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary-foreground" />
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
  <div className="bg-card rounded-xl p-6 shadow-md border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
      {icon}
    </div>
    <h3 className="font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default LandingPage;
