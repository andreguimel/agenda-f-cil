import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  Lock, 
  Building2, 
  Link2, 
  CheckCircle,
  Lightbulb,
  ArrowRight,
  Settings,
  UserPlus,
  CalendarCheck,
  CalendarX,
  Filter,
  Plus,
  Edit,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TutorialPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Como Usar o Sistema</h1>
          <p className="text-muted-foreground">Guia completo para aproveitar todas as funcionalidades</p>
        </div>
      </div>

      {/* Quick Overview */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">Visão Geral</h3>
              <p className="text-muted-foreground mt-1">
                Este sistema permite gerenciar agendamentos da sua clínica de forma simples e eficiente. 
                Seus pacientes podem agendar consultas online através de um link personalizado, 
                e você gerencia tudo pelo painel administrativo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="space-y-3">
        {/* Dashboard */}
        <AccordionItem value="dashboard" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Dashboard (Painel Inicial)</h3>
                <p className="text-sm text-muted-foreground">Visão geral dos agendamentos</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                O Dashboard é sua página inicial, onde você tem uma visão completa do que está acontecendo na sua clínica.
              </p>
              
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Cards de Estatísticas
                </h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-6">
                  <li><strong>Agendamentos Hoje:</strong> Total de consultas marcadas para hoje</li>
                  <li><strong>Agendamentos Semana:</strong> Total de consultas dos próximos 7 dias</li>
                  <li><strong>Agendamentos Mês:</strong> Total de consultas dos últimos 30 dias</li>
                  <li><strong>Taxa de Confirmação:</strong> Porcentagem de consultas confirmadas</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Acesso Rápido
                </h4>
                <p className="text-muted-foreground ml-6">
                  Links diretos para as principais funcionalidades: Agendamentos, Profissionais, Dados da Clínica e Horários Bloqueados.
                </p>
              </div>

              <Link to="/painel">
                <Button variant="outline" size="sm" className="mt-2">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ir para o Dashboard
                </Button>
              </Link>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Profissionais */}
        <AccordionItem value="professionals" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Gerenciando Profissionais</h3>
                <p className="text-sm text-muted-foreground">Cadastro e configuração de profissionais</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Cadastre os profissionais da sua clínica e configure como cada um receberá agendamentos.
              </p>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-500" />
                  Adicionando um Profissional
                </h4>
                <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-6">
                  <li>Clique no botão <Badge variant="secondary">+ Adicionar Profissional</Badge></li>
                  <li>Preencha o nome e especialidade</li>
                  <li>Configure os horários de trabalho (início e fim)</li>
                  <li>Se necessário, ative o intervalo de almoço</li>
                  <li>Escolha o modo de agendamento</li>
                  <li>Clique em Salvar</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-500" />
                  Modos de Agendamento
                </h4>
                <div className="ml-6 space-y-3">
                  <Card className="bg-secondary/50">
                    <CardContent className="pt-4">
                      <h5 className="font-medium">Por Horário Específico</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        O paciente escolhe um horário exato (ex: 14:30). Ideal para consultas com duração fixa.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/50">
                    <CardContent className="pt-4">
                      <h5 className="font-medium">Por Ordem de Chegada</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        O paciente escolhe um turno (manhã, tarde, noite) e é atendido por ordem de chegada. 
                        Ideal para clínicas com alta demanda.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Dias de Antecedência
                </h4>
                <p className="text-muted-foreground ml-6">
                  Defina quantos dias no futuro os pacientes podem agendar. Por exemplo, se definir 30 dias, 
                  pacientes só poderão agendar consultas para os próximos 30 dias.
                </p>
              </div>

              <Link to="/painel/profissionais">
                <Button variant="outline" size="sm" className="mt-2">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ir para Profissionais
                </Button>
              </Link>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Agendamentos */}
        <AccordionItem value="appointments" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CalendarCheck className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Gerenciando Agendamentos</h3>
                <p className="text-sm text-muted-foreground">Visualize e gerencie consultas</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Visualize todos os agendamentos, filtre por data ou status, e gerencie as consultas.
              </p>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4 text-green-500" />
                  Filtros Disponíveis
                </h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-6">
                  <li><strong>Por Data:</strong> Filtre agendamentos de hoje, semana, ou selecione uma data específica</li>
                  <li><strong>Por Status:</strong> Veja apenas pendentes, confirmados ou cancelados</li>
                  <li><strong>Por Profissional:</strong> Filtre por profissional específico</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Status dos Agendamentos
                </h4>
                <div className="ml-6 flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">
                    Pendente
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30">
                    Confirmado
                  </Badge>
                  <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/30">
                    Cancelado
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Edit className="w-4 h-4 text-green-500" />
                  Ações Disponíveis
                </h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-6">
                  <li><strong>Confirmar:</strong> Marca o agendamento como confirmado</li>
                  <li><strong>Cancelar:</strong> Cancela o agendamento</li>
                  <li><strong>Ver Detalhes:</strong> Visualize informações completas do paciente</li>
                </ul>
              </div>

              <Link to="/painel/agendamentos">
                <Button variant="outline" size="sm" className="mt-2">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ir para Agendamentos
                </Button>
              </Link>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Turnos */}
        <AccordionItem value="shifts" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Configurando Turnos</h3>
                <p className="text-sm text-muted-foreground">Para profissionais por ordem de chegada</p>
              </div>
              <Badge variant="secondary" className="ml-2">Opcional</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <Card className="bg-orange-500/5 border-orange-500/20">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Nota:</strong> Esta funcionalidade só aparece se você tiver profissionais 
                    configurados com o modo "Por Ordem de Chegada".
                  </p>
                </CardContent>
              </Card>

              <p className="text-muted-foreground">
                Turnos definem os períodos em que os pacientes podem se inscrever (manhã, tarde, noite) 
                e quantas vagas estão disponíveis em cada período.
              </p>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4 text-orange-500" />
                  Criando um Turno
                </h4>
                <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-6">
                  <li>Selecione o profissional</li>
                  <li>Escolha o dia da semana</li>
                  <li>Defina o nome do turno (ex: "Manhã", "Tarde")</li>
                  <li>Configure horário de início e fim</li>
                  <li>Defina o número máximo de vagas</li>
                  <li>Clique em Salvar</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-orange-500" />
                  Exemplo Prático
                </h4>
                <div className="ml-6 bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Turno Manhã:</strong> Segunda a Sexta, 08:00 às 12:00, 15 vagas<br/>
                    <strong>Turno Tarde:</strong> Segunda a Sexta, 14:00 às 18:00, 15 vagas
                  </p>
                </div>
              </div>

              <Link to="/painel/turnos">
                <Button variant="outline" size="sm" className="mt-2">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ir para Turnos
                </Button>
              </Link>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Horários Bloqueados */}
        <AccordionItem value="blocked" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Lock className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Bloqueando Horários</h3>
                <p className="text-sm text-muted-foreground">Férias, feriados e indisponibilidades</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Bloqueie horários específicos para impedir agendamentos em períodos que o profissional 
                não estará disponível.
              </p>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <CalendarX className="w-4 h-4 text-red-500" />
                  Quando Usar
                </h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-6">
                  <li><strong>Férias:</strong> Bloqueie o período completo de férias</li>
                  <li><strong>Feriados:</strong> Bloqueie dias específicos de feriado</li>
                  <li><strong>Reuniões:</strong> Bloqueie horários de reuniões ou compromissos</li>
                  <li><strong>Emergências:</strong> Bloqueie quando houver imprevistos</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4 text-red-500" />
                  Criando um Bloqueio
                </h4>
                <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-6">
                  <li>Selecione o profissional</li>
                  <li>Escolha a data</li>
                  <li>Defina horário de início e fim</li>
                  <li>Adicione um motivo (opcional)</li>
                  <li>Clique em Salvar</li>
                </ol>
              </div>

              <Link to="/painel/horarios">
                <Button variant="outline" size="sm" className="mt-2">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ir para Horários Bloqueados
                </Button>
              </Link>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Dados da Clínica */}
        <AccordionItem value="clinic" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Building2 className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Dados da Clínica</h3>
                <p className="text-sm text-muted-foreground">Informações e configurações gerais</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Configure as informações da sua clínica que serão exibidas para os pacientes.
              </p>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Edit className="w-4 h-4 text-purple-500" />
                  Informações Editáveis
                </h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-6">
                  <li><strong>Nome da Clínica:</strong> Nome que aparece para os pacientes</li>
                  <li><strong>Telefone:</strong> Número para contato</li>
                  <li><strong>E-mail:</strong> E-mail de contato</li>
                  <li><strong>Endereço:</strong> Localização da clínica</li>
                  <li><strong>Horário de Funcionamento:</strong> Horário de abertura e fechamento</li>
                </ul>
              </div>

              <Link to="/painel/configuracoes">
                <Button variant="outline" size="sm" className="mt-2">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ir para Dados da Clínica
                </Button>
              </Link>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Link Público */}
        <AccordionItem value="public-link" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/10">
                <Link2 className="w-5 h-5 text-teal-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Link de Agendamento Público</h3>
                <p className="text-sm text-muted-foreground">Compartilhe com seus pacientes</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Cada clínica tem um link único que pode ser compartilhado com os pacientes para 
                agendamento online.
              </p>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-teal-500" />
                  Formato do Link
                </h4>
                <div className="ml-6 bg-secondary/50 rounded-lg p-4">
                  <code className="text-sm">
                    seusite.com/agendar/<span className="text-primary">slug-da-clinica</span>
                  </code>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Copy className="w-4 h-4 text-teal-500" />
                  Como Compartilhar
                </h4>
                <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-6">
                  <li>No menu lateral, localize a seção "Link de Agendamento"</li>
                  <li>Clique no ícone de copiar ao lado do link</li>
                  <li>Compartilhe via WhatsApp, redes sociais, ou coloque no seu site</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Edit className="w-4 h-4 text-teal-500" />
                  Personalizando o Link
                </h4>
                <p className="text-muted-foreground ml-6">
                  Você pode personalizar o "slug" (identificador) da sua clínica clicando no ícone de 
                  edição ao lado do link. Use um nome fácil de lembrar e digitar.
                </p>
              </div>

              <Card className="bg-teal-500/5 border-teal-500/20">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Dica:</strong> Adicione o link de agendamento na bio do Instagram, 
                    no cartão de visitas, ou crie um QR Code para facilitar o acesso dos pacientes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Google Calendar */}
        <AccordionItem value="google" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Calendar className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Google Calendar</h3>
                <p className="text-sm text-muted-foreground">Sincronização automática</p>
              </div>
              <Badge variant="secondary" className="ml-2">Opcional</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Conecte sua conta Google para sincronizar automaticamente os agendamentos 
                com seu Google Calendar.
              </p>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500" />
                  Benefícios
                </h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-6">
                  <li>Todos os agendamentos aparecem no seu Google Calendar</li>
                  <li>Receba notificações de novos agendamentos</li>
                  <li>Visualize sua agenda em qualquer dispositivo</li>
                  <li>Sincronização automática em tempo real</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-indigo-500" />
                  Como Conectar
                </h4>
                <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-6">
                  <li>No menu lateral, localize "Google Calendar"</li>
                  <li>Clique em "Conectar"</li>
                  <li>Faça login na sua conta Google</li>
                  <li>Autorize o acesso ao calendário</li>
                  <li>Pronto! A sincronização está ativa</li>
                </ol>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Help Card */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Precisa de Ajuda?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Se você tiver dúvidas ou precisar de suporte, entre em contato conosco. 
            Estamos aqui para ajudar você a aproveitar ao máximo o sistema de agendamentos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorialPage;
