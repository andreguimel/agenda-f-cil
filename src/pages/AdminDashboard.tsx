import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, 
  Shield, 
  Users, 
  CreditCard, 
  TrendingUp, 
  MessageSquare,
  ArrowLeft,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';

interface Subscription {
  id: string;
  clinic_id: string;
  status: string;
  trial_ends_at: string;
  current_period_end: string | null;
  price_amount: number;
  created_at: string;
  clinic?: {
    name: string;
    email: string | null;
  };
}

interface Feedback {
  id: string;
  clinic_id: string;
  reason: string;
  feedback: string | null;
  created_at: string;
  clinic?: {
    name: string;
  };
}

interface Metrics {
  totalClinics: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  cancelledSubscriptions: number;
  mrr: number;
  churnRate: number;
}

const reasonLabels: Record<string, string> = {
  too_expensive: 'Muito caro',
  not_using: 'Não está usando',
  missing_features: 'Faltam funcionalidades',
  switching: 'Mudando de solução',
  closing_business: 'Fechando negócio',
  other: 'Outro motivo',
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  active: { label: 'Ativo', variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
  trial: { label: 'Trial', variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
  cancelled: { label: 'Cancelado', variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
  expired: { label: 'Expirado', variant: 'outline', icon: <AlertTriangle className="w-3 h-3" /> },
  pending: { label: 'Pendente', variant: 'outline', icon: <Clock className="w-3 h-3" /> },
};

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      navigate('/painel');
    }
  }, [isAdmin, adminLoading, user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) return;

      try {
        // Fetch subscriptions with clinic info
        const { data: subsData, error: subsError } = await supabase
          .from('subscriptions')
          .select(`
            *,
            clinic:clinics(name, email)
          `)
          .order('created_at', { ascending: false });

        if (subsError) throw subsError;
        setSubscriptions(subsData || []);

        // Calculate metrics
        const total = subsData?.length || 0;
        const active = subsData?.filter(s => s.status === 'active').length || 0;
        const trial = subsData?.filter(s => s.status === 'trial').length || 0;
        const cancelled = subsData?.filter(s => s.status === 'cancelled').length || 0;
        const mrr = active * 149;
        const churnRate = total > 0 ? (cancelled / total) * 100 : 0;

        setMetrics({
          totalClinics: total,
          activeSubscriptions: active,
          trialSubscriptions: trial,
          cancelledSubscriptions: cancelled,
          mrr,
          churnRate,
        });

        // Fetch cancellation feedback
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('cancellation_feedback')
          .select(`
            *,
            clinic:clinics(name)
          `)
          .order('created_at', { ascending: false });

        if (feedbackError) throw feedbackError;
        setFeedbacks(feedbackData || []);

      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  if (authLoading || adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/painel')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard Admin</h1>
                <p className="text-muted-foreground text-sm">Gerencie assinaturas e métricas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Total de Clínicas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metrics.totalClinics}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  MRR
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  R$ {metrics.mrr.toLocaleString('pt-BR')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Assinaturas Ativas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">{metrics.activeSubscriptions}</p>
                  <span className="text-sm text-muted-foreground">
                    + {metrics.trialSubscriptions} em trial
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Taxa de Churn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${metrics.churnRate > 10 ? 'text-destructive' : 'text-primary'}`}>
                  {metrics.churnRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="subscriptions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Assinaturas
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Feedbacks ({feedbacks.length})
            </TabsTrigger>
          </TabsList>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Assinaturas</CardTitle>
                <CardDescription>
                  Lista de todas as clínicas e status de assinatura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Clínica</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Fim do Período</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Criado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            Nenhuma assinatura encontrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        subscriptions.map((sub) => {
                          const config = statusConfig[sub.status] || statusConfig.pending;
                          return (
                            <TableRow key={sub.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{sub.clinic?.name || 'N/A'}</p>
                                  <p className="text-sm text-muted-foreground">{sub.clinic?.email || '-'}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                                  {config.icon}
                                  {config.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {sub.status === 'trial' 
                                  ? new Date(sub.trial_ends_at).toLocaleDateString('pt-BR')
                                  : sub.current_period_end 
                                    ? new Date(sub.current_period_end).toLocaleDateString('pt-BR')
                                    : '-'
                                }
                              </TableCell>
                              <TableCell>R$ {sub.price_amount}</TableCell>
                              <TableCell>
                                {new Date(sub.created_at).toLocaleDateString('pt-BR')}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Feedbacks de Cancelamento</CardTitle>
                <CardDescription>
                  Motivos e comentários de clientes que cancelaram
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feedbacks.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum feedback de cancelamento
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((fb) => (
                      <div key={fb.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{fb.clinic?.name || 'N/A'}</p>
                            <Badge variant="outline" className="mt-1">
                              {reasonLabels[fb.reason] || fb.reason}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(fb.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {fb.feedback && (
                          <p className="text-sm text-muted-foreground mt-2 bg-secondary/50 p-3 rounded">
                            "{fb.feedback}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;