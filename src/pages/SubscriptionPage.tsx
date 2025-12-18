import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { getUserProfile } from '@/services/schedulingService';
import { useToast } from '@/hooks/use-toast';

const features = [
  'Agendamentos ilimitados',
  'Múltiplos profissionais',
  'Integração com Google Calendar',
  'Gestão de filas por turno',
  'Link público personalizado',
  'Suporte prioritário',
];

const SubscriptionPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  
  const { subscription, loading, isActive, isTrialExpired, getDaysRemaining, createCheckoutSession } = useSubscription(clinicId);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchClinic = async () => {
      if (!user) return;
      const profile = await getUserProfile(user.id);
      if (profile?.clinic_id) {
        setClinicId(profile.clinic_id);
      }
    };
    
    if (user) {
      fetchClinic();
    }
  }, [user]);

  const handleSubscribe = async () => {
    if (!user?.email) {
      toast({
        title: 'Erro',
        description: 'Email não encontrado',
        variant: 'destructive',
      });
      return;
    }

    setLoadingCheckout(true);
    try {
      const { init_point } = await createCheckoutSession(user.email);
      window.location.href = init_point;
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Erro ao criar assinatura',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setLoadingCheckout(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isActive() ? 'Sua Assinatura' : 'Ative sua Assinatura'}
          </h1>
          <p className="text-muted-foreground">
            {isActive() 
              ? subscription?.status === 'trial' 
                ? `Você está no período de teste. Restam ${daysRemaining} dias.`
                : 'Sua assinatura está ativa'
              : 'Seu período de teste expirou. Assine para continuar usando.'
            }
          </p>
        </div>

        {/* Status Alert */}
        {isTrialExpired() && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-destructive">Período de teste expirado</h3>
              <p className="text-sm text-muted-foreground">
                Seu acesso ao painel foi bloqueado. Assine agora para continuar gerenciando seus agendamentos.
              </p>
            </div>
          </div>
        )}

        {/* Pricing Card */}
        <Card className="max-w-md mx-auto border-primary/20 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-4 mx-auto">
              <Crown className="w-4 h-4" />
              Plano Profissional
            </div>
            <CardTitle className="text-4xl font-bold">
              R$ 149
              <span className="text-lg font-normal text-muted-foreground">/mês</span>
            </CardTitle>
            <CardDescription>
              Tudo que você precisa para gerenciar sua clínica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features */}
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            {subscription?.status === 'active' ? (
              <div className="space-y-4">
                <div className="bg-secondary rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-primary">Assinatura Ativa</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Próxima cobrança: {subscription.current_period_end 
                      ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => navigate('/painel')}
                >
                  Voltar ao Painel
                </Button>
                <Button 
                  variant="link" 
                  className="w-full text-muted-foreground"
                  onClick={() => navigate('/assinatura/cancelar')}
                >
                  Cancelar assinatura
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleSubscribe}
                disabled={loadingCheckout}
              >
                {loadingCheckout ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {subscription?.status === 'trial' ? 'Assinar Agora' : 'Ativar Assinatura'}
              </Button>
            )}

            {/* Trial info */}
            {subscription?.status === 'trial' && !isTrialExpired() && (
              <p className="text-xs text-center text-muted-foreground">
                Você ainda tem {daysRemaining} dias de teste grátis
              </p>
            )}

            {/* Back button for trial users */}
            {subscription?.status === 'trial' && (
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/painel')}
              >
                Voltar ao Painel
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Payment info */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Pagamento seguro via Mercado Pago</p>
          <p className="mt-1">Cancele a qualquer momento</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;