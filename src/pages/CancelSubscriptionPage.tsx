import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2, ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { getUserProfile } from '@/services/schedulingService';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const cancellationReasons = [
  { id: 'too_expensive', label: 'Muito caro para meu orçamento' },
  { id: 'not_using', label: 'Não estou usando o suficiente' },
  { id: 'missing_features', label: 'Faltam funcionalidades que preciso' },
  { id: 'switching', label: 'Mudando para outra solução' },
  { id: 'closing_business', label: 'Fechando o negócio' },
  { id: 'other', label: 'Outro motivo' },
];

const CancelSubscriptionPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const { subscription, loading } = useSubscription(clinicId);

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

  const handleCancel = async () => {
    if (!clinicId) return;

    setLoadingCancel(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago-cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            clinicId,
            reason: selectedReason,
            feedback: feedback.trim(),
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      toast({
        title: 'Assinatura cancelada',
        description: 'Sua assinatura foi cancelada com sucesso. Você ainda pode usar até o fim do período pago.',
      });

      navigate('/assinatura');
    } catch (error) {
      console.error('Cancel error:', error);
      toast({
        title: 'Erro ao cancelar',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setLoadingCancel(false);
      setShowConfirmDialog(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Only allow cancellation for active subscriptions
  if (!subscription || subscription.status !== 'active') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Nenhuma assinatura ativa</CardTitle>
            <CardDescription>
              Você não possui uma assinatura ativa para cancelar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/assinatura')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container max-w-2xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/assinatura')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Cancelar Assinatura</h1>
          <p className="text-muted-foreground">
            Sentimos muito em ver você ir. Por favor, nos conte o motivo.
          </p>
        </div>

        {/* Cancellation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Motivo do cancelamento
            </CardTitle>
            <CardDescription>
              Sua opinião é muito importante para melhorarmos nosso serviço.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Reasons */}
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              <div className="space-y-3">
                {cancellationReasons.map((reason) => (
                  <div 
                    key={reason.id} 
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-secondary/50 transition-colors"
                  >
                    <RadioGroupItem value={reason.id} id={reason.id} />
                    <Label 
                      htmlFor={reason.id} 
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {/* Additional Feedback */}
            <div className="space-y-2">
              <Label htmlFor="feedback">Comentários adicionais (opcional)</Label>
              <Textarea
                id="feedback"
                placeholder="Conte-nos mais sobre sua experiência ou o que poderíamos melhorar..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {feedback.length}/500 caracteres
              </p>
            </div>

            {/* Warning */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <h4 className="font-medium text-amber-700 mb-1">Antes de cancelar</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Você perderá acesso ao painel após o período pago atual</li>
                <li>• Seus dados serão mantidos por 30 dias após o cancelamento</li>
                <li>• Você pode reativar sua assinatura a qualquer momento</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/assinatura')}
              >
                Manter Assinatura
              </Button>
              <Button 
                variant="destructive"
                className="flex-1"
                onClick={() => setShowConfirmDialog(true)}
                disabled={!selectedReason}
              >
                Cancelar Assinatura
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar sua assinatura? Você ainda poderá usar o serviço até o fim do período pago atual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingCancel}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={loadingCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loadingCancel ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CancelSubscriptionPage;