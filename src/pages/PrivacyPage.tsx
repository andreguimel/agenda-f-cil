import { Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Política de Privacidade | Agendaberta"
        description="Conheça nossa política de privacidade e como protegemos seus dados no Agendaberta."
        canonical="/privacidade"
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
        <h1 className="text-4xl font-bold text-foreground mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
          <p className="text-foreground font-medium">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Introdução</h2>
            <p>
              O Agendaberta ("nós", "nosso" ou "Plataforma") está comprometido em proteger sua privacidade. 
              Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas 
              informações quando você utiliza nosso serviço de agendamento online.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Informações que Coletamos</h2>
            <p>Podemos coletar os seguintes tipos de informações:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dados de cadastro:</strong> nome, e-mail, telefone, nome da clínica ou consultório.</li>
              <li><strong>Dados de pacientes:</strong> nome, telefone, e-mail e informações de agendamento.</li>
              <li><strong>Dados de uso:</strong> informações sobre como você utiliza nossa plataforma.</li>
              <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, dispositivo utilizado.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Como Usamos suas Informações</h2>
            <p>Utilizamos suas informações para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer e manter nossos serviços de agendamento.</li>
              <li>Processar e gerenciar agendamentos entre clínicas e pacientes.</li>
              <li>Enviar confirmações e lembretes de consultas.</li>
              <li>Melhorar e personalizar sua experiência na plataforma.</li>
              <li>Comunicar atualizações importantes sobre o serviço.</li>
              <li>Processar pagamentos e gerenciar assinaturas.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Compartilhamento de Dados</h2>
            <p>
              Não vendemos suas informações pessoais. Podemos compartilhar dados apenas:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Com provedores de serviço que nos auxiliam (processamento de pagamento, envio de e-mails).</li>
              <li>Quando exigido por lei ou ordem judicial.</li>
              <li>Para proteger nossos direitos legais ou segurança dos usuários.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Segurança dos Dados</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, 
              incluindo criptografia de dados, acesso restrito e monitoramento contínuo. No entanto, 
              nenhum método de transmissão pela internet é 100% seguro.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Seus Direitos (LGPD)</h2>
            <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acessar seus dados pessoais.</li>
              <li>Corrigir dados incompletos ou desatualizados.</li>
              <li>Solicitar a exclusão de seus dados.</li>
              <li>Revogar consentimento a qualquer momento.</li>
              <li>Solicitar portabilidade dos dados.</li>
            </ul>
            <p>
              Para exercer esses direitos, entre em contato conosco pelo e-mail: 
              <a href="mailto:contato@agendaberta.com.br" className="text-primary hover:underline ml-1">
                contato@agendaberta.com.br
              </a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Cookies</h2>
            <p>
              Utilizamos cookies essenciais para o funcionamento da plataforma e cookies de análise 
              para entender como nossos usuários interagem com o serviço. Você pode gerenciar as 
              preferências de cookies através das configurações do seu navegador.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Retenção de Dados</h2>
            <p>
              Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades descritas 
              nesta política, a menos que um período de retenção maior seja exigido por lei. Dados de 
              contas encerradas são excluídos em até 90 dias.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre 
              alterações significativas através do e-mail cadastrado ou aviso na plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">10. Contato</h2>
            <p>
              Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato:
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

export default PrivacyPage;
