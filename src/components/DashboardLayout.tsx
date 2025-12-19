import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Clock, 
  Link as LinkIcon, 
  Copy, 
  Check,
  User,
  Menu,
  X,
  Home,
  LogOut,
  Loader2,
  Settings,
  Pencil,
  CalendarDays,
  ListOrdered,
  Crown,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  fetchClinicById,
  getUserProfile,
  linkProfileToClinic,
  updateClinicSlug,
  fetchProfessionalsByClinic,
  Clinic
} from '@/services/schedulingService';
import { GoogleCalendarConnect } from '@/components/GoogleCalendarConnect';
import { useSubscription } from '@/hooks/useSubscription';
import { useAdmin } from '@/hooks/useAdmin';

const DEMO_CLINIC_ID = '550e8400-e29b-41d4-a716-446655440000';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, active }: SidebarItemProps) => (
  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
    active 
      ? 'bg-primary/10 text-primary font-medium' 
      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
  }`}>
    {icon}
    <span className="text-sm">{label}</span>
  </div>
);

const DashboardLayout = () => {
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [savingSlug, setSavingSlug] = useState(false);
  const [hasArrivalOrderProfessional, setHasArrivalOrderProfessional] = useState(false);
  
  const { subscription, getDaysRemaining } = useSubscription(clinic?.id || null);
  const { isAdmin } = useAdmin();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load clinic data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      const profile = await getUserProfile(user.id);
      let clinicId = profile?.clinic_id;
      
      if (!clinicId) {
        await linkProfileToClinic(user.id, DEMO_CLINIC_ID);
        clinicId = DEMO_CLINIC_ID;
      }
      
      const [clinicData, professionals] = await Promise.all([
        fetchClinicById(clinicId),
        fetchProfessionalsByClinic(clinicId),
      ]);
      
      if (clinicData) {
        setClinic(clinicData);
        setNewSlug(clinicData.slug);
      }
      
      // Check if any professional uses arrival order mode
      const hasArrival = professionals.some(p => p.scheduling_mode === 'arrival_order');
      setHasArrivalOrderProfessional(hasArrival);
      
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const handleCopyLink = () => {
    const slug = clinic?.slug || 'clinica-demo';
    navigator.clipboard.writeText(`${window.location.origin}/agendar/${slug}`);
    setLinkCopied(true);
    toast({
      title: 'Link copiado!',
      description: 'Compartilhe com seus pacientes',
    });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSaveSlug = async () => {
    if (!clinic || !newSlug.trim()) return;
    
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(newSlug)) {
      toast({
        title: 'Link inválido',
        description: 'Use apenas letras minúsculas, números e hífens',
        variant: 'destructive',
      });
      return;
    }
    
    setSavingSlug(true);
    const { error } = await updateClinicSlug(clinic.id, newSlug);
    setSavingSlug(false);
    
    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    
    setClinic({ ...clinic, slug: newSlug });
    toast({
      title: 'Link atualizado!',
      description: 'Seu novo link público está ativo',
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                  <Calendar className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">Agendaberta</span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-md hover:bg-secondary"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              <Link to="/painel" onClick={() => setSidebarOpen(false)}>
                <SidebarItem icon={<Home className="w-5 h-5" />} label="Dashboard" active={isActive('/painel')} />
              </Link>
              <Link to="/painel/agendamentos" onClick={() => setSidebarOpen(false)}>
                <SidebarItem icon={<CalendarDays className="w-5 h-5" />} label="Agendamentos" active={isActive('/painel/agendamentos')} />
              </Link>
              {hasArrivalOrderProfessional && (
                <Link to="/painel/fila" onClick={() => setSidebarOpen(false)}>
                  <SidebarItem icon={<Users className="w-5 h-5" />} label="Fila do Dia" active={isActive('/painel/fila')} />
                </Link>
              )}
              <Link to="/painel/profissionais" onClick={() => setSidebarOpen(false)}>
                <SidebarItem icon={<User className="w-5 h-5" />} label="Profissionais" active={isActive('/painel/profissionais')} />
              </Link>
              {hasArrivalOrderProfessional && (
                <Link to="/painel/turnos" onClick={() => setSidebarOpen(false)}>
                  <SidebarItem icon={<ListOrdered className="w-5 h-5" />} label="Turnos" active={isActive('/painel/turnos')} />
                </Link>
              )}
              <Link to="/painel/horarios" onClick={() => setSidebarOpen(false)}>
                <SidebarItem icon={<Clock className="w-5 h-5" />} label="Bloqueios" active={isActive('/painel/horarios')} />
              </Link>
              <Link to="/painel/configuracoes" onClick={() => setSidebarOpen(false)}>
                <SidebarItem icon={<Settings className="w-5 h-5" />} label="Dados da Clínica" active={isActive('/painel/configuracoes')} />
              </Link>
            </div>
            
            {/* Google Calendar Integration */}
            <div className="mt-6">
              <p className="text-xs text-muted-foreground mb-2 px-3">Integrações</p>
              <Sheet>
                <SheetTrigger asChild>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <Settings className="w-5 h-5" />
                    <span className="text-sm">Configurações</span>
                  </button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Configurações</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Edit Slug */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Link Público</label>
                      <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-1 bg-secondary rounded-lg px-3">
                          <span className="text-sm text-muted-foreground">/agendar/</span>
                          <Input
                            value={newSlug}
                            onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            className="border-0 bg-transparent px-0 h-9 text-sm focus-visible:ring-0"
                            placeholder="seu-link"
                          />
                        </div>
                        <Button 
                          onClick={handleSaveSlug}
                          disabled={savingSlug || newSlug === clinic?.slug}
                          size="sm"
                        >
                          {savingSlug ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Use apenas letras minúsculas, números e hífens
                      </p>
                    </div>
                    
                    {/* Google Calendar */}
                    <GoogleCalendarConnect clinicId={clinic?.id || DEMO_CLINIC_ID} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Subscription Status */}
            {subscription && (
              <Link to="/assinatura" className="mt-4">
                <div className={`rounded-lg p-3 ${
                  subscription.status === 'active' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-amber-500/10 text-amber-600'
                }`}>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Crown className="w-4 h-4" />
                    {subscription.status === 'active' ? 'Plano Ativo' : `Trial: ${getDaysRemaining()} dias`}
                  </div>
                  {subscription.status === 'trial' && (
                    <p className="text-xs mt-1 opacity-80">Clique para assinar</p>
                  )}
                </div>
              </Link>
            )}
            
            {/* Admin Link */}
            {isAdmin && (
              <Link to="/admin" className="mt-4 block" onClick={() => setSidebarOpen(false)}>
                <div className="rounded-lg p-3 bg-secondary hover:bg-secondary/80 transition-colors">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    Dashboard Admin
                  </div>
                </div>
              </Link>
            )}
          </nav>

          {/* Share Link */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Link público</p>
              <Sheet>
                <SheetTrigger asChild>
                  <button className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Pencil className="w-3 h-3" />
                    Editar
                  </button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Editar Link Público</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-3">
                    <label className="text-sm font-medium">Seu link de agendamento</label>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-1 bg-secondary rounded-lg px-3">
                        <span className="text-sm text-muted-foreground">/agendar/</span>
                        <Input
                          value={newSlug}
                          onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          className="border-0 bg-transparent px-0 h-9 text-sm focus-visible:ring-0"
                          placeholder="seu-link"
                        />
                      </div>
                      <Button 
                        onClick={handleSaveSlug}
                        disabled={savingSlug || newSlug === clinic?.slug}
                        size="sm"
                      >
                        {savingSlug ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use apenas letras minúsculas, números e hífens
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  /agendar/{clinic?.slug || 'clinica-demo'}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleCopyLink}
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar Link
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* User & Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <p className="text-xs text-muted-foreground truncate px-1">{user.email}</p>
            <Button 
              variant="outline" 
              className="w-full justify-center gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden sticky top-0 z-30 bg-card border-b border-border px-4 py-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-secondary"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </div>
        
        {/* Page Content */}
        <Outlet context={{ clinic }} />
      </main>
    </div>
  );
};

export default DashboardLayout;
