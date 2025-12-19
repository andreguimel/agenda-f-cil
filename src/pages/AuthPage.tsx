import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Calendar, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import NotARobotCheck from '@/components/NotARobotCheck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Check URL for reset mode
  useEffect(() => {
    if (searchParams.get('mode') === 'reset') {
      setMode('reset');
    }
  }, [searchParams]);

  // Reset verification when switching modes
  useEffect(() => {
    setIsHumanVerified(false);
    setResetEmailSent(false);
  }, [mode]);
  
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isHumanVerified) {
      toast({
        title: 'Verificação necessária',
        description: 'Por favor, confirme que você não é um robô',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        
        if (error) {
          toast({
            title: 'Erro ao entrar',
            description: error.message === 'Invalid login credentials' 
              ? 'Email ou senha incorretos' 
              : error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Bem-vindo!',
            description: 'Login realizado com sucesso',
          });
          navigate('/painel');
        }
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          toast({
            title: 'Nome obrigatório',
            description: 'Por favor, informe seu nome completo',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName);
        
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Email já cadastrado',
              description: 'Este email já possui uma conta. Faça login.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Erro ao criar conta',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Conta criada!',
            description: 'Você já pode acessar o painel',
          });
          navigate('/painel');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        
        if (error) {
          toast({
            title: 'Erro ao enviar email',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          setResetEmailSent(true);
          toast({
            title: 'Email enviado!',
            description: 'Verifique sua caixa de entrada para redefinir a senha',
          });
        }
      } else if (mode === 'reset') {
        if (password !== confirmPassword) {
          toast({
            title: 'Senhas não conferem',
            description: 'As senhas digitadas são diferentes',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          toast({
            title: 'Senha muito curta',
            description: 'A senha deve ter pelo menos 6 caracteres',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        const { error } = await supabase.auth.updateUser({ password });
        
        if (error) {
          toast({
            title: 'Erro ao redefinir senha',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Senha redefinida!',
            description: 'Sua nova senha foi salva com sucesso',
          });
          navigate('/painel');
        }
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Entrar na sua conta';
      case 'signup': return 'Criar nova conta';
      case 'forgot': return 'Esqueci minha senha';
      case 'reset': return 'Redefinir senha';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Acesse o painel de agendamentos';
      case 'signup': return 'Comece a gerenciar seus agendamentos';
      case 'forgot': return 'Digite seu email para receber o link de recuperação';
      case 'reset': return 'Digite sua nova senha';
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      switch (mode) {
        case 'login': return 'Entrando...';
        case 'signup': return 'Criando conta...';
        case 'forgot': return 'Enviando...';
        case 'reset': return 'Redefinindo...';
      }
    }
    switch (mode) {
      case 'login': return 'Entrar';
      case 'signup': return 'Criar conta';
      case 'forgot': return 'Enviar email de recuperação';
      case 'reset': return 'Redefinir senha';
    }
  };

  return (
    <>
      <SEO 
        title={mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar Conta' : 'Recuperar Senha'}
        description="Acesse sua conta no Agendaberta para gerenciar agendamentos da sua clínica."
        canonical="/auth"
        noIndex
      />
      <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-glow">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Agendaberta</h1>
              <p className="text-sm text-muted-foreground">Painel do Consultório</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {getTitle()}
            </h2>
            <p className="text-muted-foreground">
              {getSubtitle()}
            </p>
          </div>

          {resetEmailSent && mode === 'forgot' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Email enviado!</h3>
              <p className="text-muted-foreground mb-6">
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              </p>
              <Button 
                variant="outline" 
                onClick={() => { setMode('login'); setResetEmailSent(false); }}
              >
                Voltar ao login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <Label htmlFor="fullName" className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Nome completo
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}

              {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
                <div>
                  <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    {mode === 'reset' ? 'Nova senha' : 'Senha'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={mode === 'reset' ? 'Digite a nova senha' : 'Sua senha'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'reset' && (
                <div>
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Confirmar nova senha
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm text-primary hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}

              <NotARobotCheck
                checked={isHumanVerified}
                onChange={setIsHumanVerified}
                className="mt-6"
              />

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full mt-4"
                disabled={isLoading || !isHumanVerified}
              >
                {getButtonText()}
              </Button>
            </form>
          )}

          {(mode === 'login' || mode === 'signup') && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-primary font-medium hover:underline"
                >
                  {mode === 'login' ? 'Criar conta' : 'Entrar'}
                </button>
              </p>
            </div>
          )}

          {(mode === 'forgot' && !resetEmailSent) && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-sm text-primary font-medium hover:underline"
              >
                Voltar ao login
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <Calendar className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Gerencie seus agendamentos
          </h3>
          <p className="text-muted-foreground">
            Visualize consultas, gerencie profissionais e compartilhe seu link de 
            agendamento com pacientes. Tudo em um só lugar.
          </p>
        </div>
      </div>
      </div>
    </>
  );
};

export default AuthPage;
