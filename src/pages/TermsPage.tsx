import { Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Termos de Serviço | Agendaberta"
        description="Leia os termos de serviço do Agendaberta e conheça as condições de uso da nossa plataforma."
        canonical="/termos"
      />
      
      {/* Header */}
      <header className="container mx-auto px-4 py-6 border-b border-border/50">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Agendaberta
            </span>
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm" className="rounded-full px-6 border-primary/20 hover:bg-primary/5 hover:border-primary/40">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Termos de Serviço</h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
          <p className="text-foreground font-medium">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar ou usar o Agendaberta ("Plataforma"), você concorda em cumprir e estar 
              vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes 
              termos, não poderá acessar ou utilizar nossos serviços.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Descrição do Serviço</h2>
            <p>
              O Agendaberta é uma plataforma de agendamento online que permite a profissionais de 
              saúde e clínicas gerenciarem suas agendas e receberem agendamentos de pacientes de 
              forma automatizada.
            </p>
            <p>Nossos serviços incluem:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sistema de agendamento online para pacientes.</li>
              <li>Gerenciamento de agenda e profissionais.</li>
              <li>Confirmação automática de consultas.</li>
              <li>Integração com Google Calendar.</li>
              <li>Gestão de fila de atendimento.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Cadastro e Conta</h2>
            <p>
              Para utilizar o Agendaberta, você deve criar uma conta fornecendo informações 
              verdadeiras e completas. Você é responsável por:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Manter a confidencialidade de suas credenciais de acesso.</li>
              <li>Todas as atividades realizadas em sua conta.</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado.</li>
              <li>Manter suas informações de cadastro atualizadas.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Período de Teste</h2>
            <p>
              Oferecemos um período de teste gratuito de 7 (sete) dias para novos usuários. 
              Durante este período, você terá acesso a todas as funcionalidades da plataforma. 
              Após o término do período de teste, será necessário contratar um plano pago para 
              continuar utilizando o serviço.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Pagamentos e Assinatura</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>As assinaturas são cobradas mensalmente através do MercadoPago.</li>
              <li>O valor da assinatura será informado antes da contratação.</li>
              <li>Não há reembolso proporcional em caso de cancelamento antes do fim do período.</li>
              <li>Reservamo-nos o direito de alterar os preços com aviso prévio de 30 dias.</li>
              <li>A falta de pagamento pode resultar na suspensão do acesso ao serviço.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Uso Aceitável</h2>
            <p>Ao utilizar o Agendaberta, você concorda em NÃO:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violar leis ou regulamentos aplicáveis.</li>
              <li>Usar o serviço para fins fraudulentos ou ilegais.</li>
              <li>Tentar acessar contas ou dados de outros usuários.</li>
              <li>Interferir no funcionamento adequado da plataforma.</li>
              <li>Transmitir vírus, malware ou código malicioso.</li>
              <li>Coletar dados de outros usuários sem autorização.</li>
              <li>Revender ou sublicenciar o acesso à plataforma.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo da plataforma, incluindo textos, gráficos, logotipos, ícones, 
              imagens, software e código fonte, é de propriedade exclusiva do Agendaberta ou 
              seus licenciadores e está protegido por leis de propriedade intelectual.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Limitação de Responsabilidade</h2>
            <p>
              O Agendaberta é fornecido "como está" e "conforme disponível". Não garantimos que 
              o serviço será ininterrupto, livre de erros ou completamente seguro. Em nenhuma 
              circunstância seremos responsáveis por:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Danos indiretos, incidentais ou consequentes.</li>
              <li>Perda de dados, receita ou oportunidades de negócio.</li>
              <li>Falhas em atendimentos médicos ou agendamentos perdidos.</li>
              <li>Ações de terceiros ou integrações externas.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. Cancelamento</h2>
            <p>
              Você pode cancelar sua assinatura a qualquer momento através do painel de controle. 
              O acesso continuará disponível até o fim do período já pago. Após o cancelamento:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Seus dados serão mantidos por 90 dias.</li>
              <li>Após 90 dias, os dados poderão ser excluídos permanentemente.</li>
              <li>Links públicos de agendamento serão desativados.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">10. Modificações dos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações 
              significativas serão comunicadas por e-mail ou aviso na plataforma com pelo menos 
              15 dias de antecedência. O uso continuado após alterações constitui aceitação dos 
              novos termos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">11. Lei Aplicável</h2>
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer 
              disputa será resolvida nos tribunais da comarca de domicílio do usuário, conforme 
              previsto no Código de Defesa do Consumidor.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">12. Contato</h2>
            <p>
              Para dúvidas sobre estes Termos de Serviço, entre em contato:
            </p>
            <p>
              <strong>E-mail:</strong>{' '}
              <a href="mailto:contato@agendaberta.com.br" className="text-primary hover:underline">
                contato@agendaberta.com.br
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-secondary/30 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground">Agendaberta</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacidade" className="hover:text-primary transition-colors">
                Privacidade
              </Link>
              <Link to="/termos" className="hover:text-primary transition-colors">
                Termos de Serviço
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Agendaberta. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;
