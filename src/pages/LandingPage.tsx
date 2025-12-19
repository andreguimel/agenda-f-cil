import { Calendar, Clock, Users, CheckCircle, ArrowRight, Zap, Shield, Gift, Star, Quote, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AnimatedMockup from '@/components/AnimatedMockup';

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
              Entrar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-16 pb-24 lg:pt-24">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">7 dias grátis para testar</span>
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
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Simplifique a rotina do seu consultório. Seus pacientes agendam online, 
            você gerencia tudo em um só lugar.
          </p>

          {/* Benefits Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">Sem taxa de adesão</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">Configuração em 5 minutos</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">Cancele quando quiser</span>
            </div>
          </div>

          <Link to="/painel">
            <Button size="lg" className="rounded-full px-10 h-14 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
              Começar Agora — É Grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Teste grátis por 7 dias. Sem cartão de crédito.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-24 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <FeatureCard
            icon={<Calendar className="w-6 h-6" />}
            title="Agendamento 24h"
            description="Pacientes agendam a qualquer hora pelo link público, sem ligações"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Múltiplos Profissionais"
            description="Gerencie toda a equipe em uma única plataforma centralizada"
          />
          <FeatureCard
            icon={<Clock className="w-6 h-6" />}
            title="Google Calendar"
            description="Sincroniza automaticamente com seu calendário pessoal"
          />
          <FeatureCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Confirmação Instantânea"
            description="Paciente recebe confirmação imediata do agendamento"
          />
        </div>

        {/* Why Choose Section */}
        <div className="mt-24 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que escolher o Agendaberta?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Tudo que você precisa para organizar sua agenda e atender melhor seus pacientes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <BenefitCard
              number="01"
              title="Reduza faltas"
              description="Lembretes automáticos e confirmação antecipada diminuem drasticamente as faltas dos pacientes."
            />
            <BenefitCard
              number="02"
              title="Economize tempo"
              description="Elimine ligações e WhatsApp para agendamentos. Seus pacientes marcam sozinhos, 24 horas por dia."
            />
            <BenefitCard
              number="03"
              title="Organize sua rotina"
              description="Visualize sua agenda completa, gerencie bloqueios e nunca mais tenha conflitos de horário."
            />
          </div>
        </div>

        {/* Animated Mockup - How it Works */}
        <div className="mt-24 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Veja como funciona
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Em poucos passos, seu paciente agenda e você recebe tudo automaticamente.
            </p>
          </div>
          <AnimatedMockup />
        </div>

        {/* Testimonials Section */}
        <div className="mt-24 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Profissionais de saúde que transformaram a gestão de suas agendas.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              name="Dra. Mariana Costa"
              role="Dermatologista"
              image="MC"
              rating={5}
              testimonial="O Agendaberta reduziu em 70% as faltas no meu consultório. Meus pacientes adoram a facilidade de agendar online."
            />
            <TestimonialCard
              name="Dr. Ricardo Mendes"
              role="Clínico Geral"
              image="RM"
              rating={5}
              testimonial="Antes eu perdia horas organizando agenda. Agora tudo é automático e sincroniza com meu Google Calendar."
            />
            <TestimonialCard
              name="Dra. Fernanda Lima"
              role="Nutricionista"
              image="FL"
              rating={5}
              testimonial="Em 3 meses consegui dobrar meus atendimentos. A plataforma é simples e meus pacientes agendam 24h por dia."
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Tire suas dúvidas sobre o Agendaberta.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 px-6 data-[state=open]:border-primary/30">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  Como funciona o período de teste grátis?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Você tem 7 dias para testar todas as funcionalidades do Agendaberta sem compromisso. Não pedimos cartão de crédito. Após o período de teste, você pode escolher um plano que se encaixe nas suas necessidades.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 px-6 data-[state=open]:border-primary/30">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  Posso cadastrar mais de um profissional?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Sim! O Agendaberta permite cadastrar múltiplos profissionais na mesma clínica. Cada um terá sua própria agenda, horários e especialidade configurados individualmente.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 px-6 data-[state=open]:border-primary/30">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  Como meus pacientes agendam consultas?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Você recebe um link público exclusivo da sua clínica. Basta compartilhar esse link com seus pacientes (via WhatsApp, redes sociais, site) e eles podem agendar 24 horas por dia, escolhendo o profissional, data e horário disponível.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 px-6 data-[state=open]:border-primary/30">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  Posso sincronizar com meu Google Calendar?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Sim! O Agendaberta integra diretamente com o Google Calendar. Todos os agendamentos aparecem automaticamente no seu calendário pessoal, evitando conflitos de horário.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 px-6 data-[state=open]:border-primary/30">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  Posso cancelar a assinatura a qualquer momento?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  Absolutamente! Não há fidelidade ou multa. Você pode cancelar sua assinatura quando quiser diretamente pelo painel, sem burocracia.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-3xl p-10 md:p-16 border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pronto para simplificar sua agenda?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Junte-se a centenas de profissionais que já economizam tempo com o Agendaberta.
            </p>
            <Link to="/painel">
              <Button size="lg" className="rounded-full px-10 h-14 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Começar Teste Grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
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

interface BenefitCardProps {
  number: string;
  title: string;
  description: string;
}

const BenefitCard = ({ number, title, description }: BenefitCardProps) => (
  <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-300">
    <span className="text-4xl font-bold text-primary/20">{number}</span>
    <h3 className="font-semibold text-foreground text-xl mt-4 mb-2">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

interface TestimonialCardProps {
  name: string;
  role: string;
  image: string;
  rating: number;
  testimonial: string;
}

const TestimonialCard = ({ name, role, image, rating, testimonial }: TestimonialCardProps) => (
  <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 relative">
    <Quote className="w-10 h-10 text-primary/10 absolute top-6 right-6" />
    <div className="flex items-center gap-1 mb-4">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
      ))}
    </div>
    <p className="text-foreground leading-relaxed mb-6">"{testimonial}"</p>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm">
        {image}
      </div>
      <div>
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  </div>
);

export default LandingPage;
