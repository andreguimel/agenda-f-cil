import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  User,
  Clock,
  Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  fetchAllProfessionalsByClinic,
  createProfessional,
  updateProfessional,
  deleteProfessional,
  getUserProfile,
  linkProfileToClinic,
  Professional
} from '@/services/schedulingService';

const DEMO_CLINIC_ID = '550e8400-e29b-41d4-a716-446655440000';

interface ProfessionalFormData {
  name: string;
  specialty: string;
  duration: number;
  avatar_url: string;
  work_start_time: string;
  work_end_time: string;
  has_lunch_break: boolean;
  lunch_start_time: string;
  lunch_end_time: string;
  max_advance_days: number;
}

const ProfessionalsManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [formData, setFormData] = useState<ProfessionalFormData>({
    name: '',
    specialty: '',
    duration: 30,
    avatar_url: '',
    work_start_time: '08:00',
    work_end_time: '18:00',
    has_lunch_break: false,
    lunch_start_time: '12:00',
    lunch_end_time: '13:00',
    max_advance_days: 365,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      const profile = await getUserProfile(user.id);
      let currentClinicId = profile?.clinic_id;
      
      if (!currentClinicId) {
        await linkProfileToClinic(user.id, DEMO_CLINIC_ID);
        currentClinicId = DEMO_CLINIC_ID;
      }
      
      setClinicId(currentClinicId);
      
      const professionalsData = await fetchAllProfessionalsByClinic(currentClinicId);
      setProfessionals(professionalsData);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: '',
      specialty: '',
      duration: 30,
      avatar_url: '',
      work_start_time: '08:00',
      work_end_time: '18:00',
      has_lunch_break: false,
      lunch_start_time: '12:00',
      lunch_end_time: '13:00',
      max_advance_days: 365,
    });
    setEditingProfessional(null);
  };

  const handleOpenDialog = (professional?: Professional) => {
    if (professional) {
      setEditingProfessional(professional);
      setFormData({
        name: professional.name,
        specialty: professional.specialty,
        duration: professional.duration,
        avatar_url: professional.avatar_url || '',
        work_start_time: professional.work_start_time || '08:00',
        work_end_time: professional.work_end_time || '18:00',
        has_lunch_break: professional.has_lunch_break || false,
        lunch_start_time: professional.lunch_start_time || '12:00',
        lunch_end_time: professional.lunch_end_time || '13:00',
        max_advance_days: professional.max_advance_days || 365,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicId) return;

    if (!formData.name.trim() || !formData.specialty.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    if (editingProfessional) {
      const { error } = await updateProfessional(editingProfessional.id, {
        name: formData.name.trim(),
        specialty: formData.specialty.trim(),
        duration: formData.duration,
        avatar_url: formData.avatar_url.trim() || null,
        work_start_time: formData.work_start_time,
        work_end_time: formData.work_end_time,
        has_lunch_break: formData.has_lunch_break,
        lunch_start_time: formData.lunch_start_time,
        lunch_end_time: formData.lunch_end_time,
        max_advance_days: formData.max_advance_days,
      });

      if (error) {
        toast({
          title: 'Erro ao atualizar',
          description: 'Não foi possível atualizar o profissional',
          variant: 'destructive',
        });
      } else {
        setProfessionals(prev => 
          prev.map(p => p.id === editingProfessional.id 
            ? { ...p, ...formData, avatar_url: formData.avatar_url || null }
            : p
          )
        );
        toast({
          title: 'Profissional atualizado',
          description: 'As informações foram salvas com sucesso',
        });
        handleCloseDialog();
      }
    } else {
      const { data, error } = await createProfessional({
        clinic_id: clinicId,
        name: formData.name.trim(),
        specialty: formData.specialty.trim(),
        duration: formData.duration,
        avatar_url: formData.avatar_url.trim() || null,
        work_start_time: formData.work_start_time,
        work_end_time: formData.work_end_time,
        has_lunch_break: formData.has_lunch_break,
        lunch_start_time: formData.lunch_start_time,
        lunch_end_time: formData.lunch_end_time,
        max_advance_days: formData.max_advance_days,
      });

      if (error || !data) {
        toast({
          title: 'Erro ao criar',
          description: 'Não foi possível adicionar o profissional',
          variant: 'destructive',
        });
      } else {
        setProfessionals(prev => [...prev, data]);
        toast({
          title: 'Profissional adicionado',
          description: `${data.name} foi adicionado com sucesso`,
        });
        handleCloseDialog();
      }
    }

    setSubmitting(false);
  };

  const handleDelete = async (professional: Professional) => {
    const { error } = await deleteProfessional(professional.id);

    if (error) {
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o profissional',
        variant: 'destructive',
      });
    } else {
      setProfessionals(prev => prev.filter(p => p.id !== professional.id));
      toast({
        title: 'Profissional removido',
        description: `${professional.name} foi removido`,
      });
    }
  };

  const handleToggleActive = async (professional: Professional) => {
    const { error } = await updateProfessional(professional.id, {
      is_active: !professional.is_active,
    });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status',
        variant: 'destructive',
      });
    } else {
      setProfessionals(prev => 
        prev.map(p => p.id === professional.id 
          ? { ...p, is_active: !p.is_active }
          : p
        )
      );
      toast({
        title: professional.is_active ? 'Profissional desativado' : 'Profissional ativado',
        description: professional.is_active 
          ? 'Não aparecerá mais na página de agendamento'
          : 'Agora está disponível para agendamentos',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <header className="bg-card border-b border-border sticky top-0 lg:top-0 z-20">
        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Profissionais</h1>
            <p className="text-sm text-muted-foreground">Gerencie sua equipe</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade *</Label>
                  <Input
                    id="specialty"
                    placeholder="Ex: Cardiologista, Dentista"
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração da consulta (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={15}
                    max={180}
                    step={5}
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar_url">URL da foto (opcional)</Label>
                  <Input
                    id="avatar_url"
                    placeholder="https://..."
                    value={formData.avatar_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                  />
                </div>
                
                <div className="border-t border-border pt-4 mt-4">
                  <h4 className="font-medium text-foreground mb-3">Horário de Atendimento</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="work_start_time">Início</Label>
                      <Input
                        id="work_start_time"
                        type="time"
                        value={formData.work_start_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, work_start_time: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="work_end_time">Fim</Label>
                      <Input
                        id="work_end_time"
                        type="time"
                        value={formData.work_end_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, work_end_time: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="has_lunch_break"
                      checked={formData.has_lunch_break}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_lunch_break: checked === true }))}
                    />
                    <Label htmlFor="has_lunch_break" className="cursor-pointer">Tem intervalo de almoço</Label>
                  </div>
                  {formData.has_lunch_break && (
                    <div className="grid grid-cols-2 gap-3 pl-6">
                      <div className="space-y-2">
                        <Label htmlFor="lunch_start_time">Início do almoço</Label>
                        <Input
                          id="lunch_start_time"
                          type="time"
                          value={formData.lunch_start_time}
                          onChange={(e) => setFormData(prev => ({ ...prev, lunch_start_time: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lunch_end_time">Fim do almoço</Label>
                        <Input
                          id="lunch_end_time"
                          type="time"
                          value={formData.lunch_end_time}
                          onChange={(e) => setFormData(prev => ({ ...prev, lunch_end_time: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_advance_days">Limite de agendamento futuro (dias)</Label>
                  <Input
                    id="max_advance_days"
                    type="number"
                    min={7}
                    max={730}
                    value={formData.max_advance_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_advance_days: parseInt(e.target.value) || 365 }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ex: 365 = 1 ano, 30 = 1 mês. Pacientes não poderão agendar além deste limite.
                  </p>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingProfessional ? 'Salvar' : 'Adicionar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="p-4 lg:p-6">
        {professionals.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum profissional</h3>
            <p className="text-muted-foreground mb-4">Adicione profissionais para começar a receber agendamentos</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Profissional
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {professionals.map((professional) => (
              <div 
                key={professional.id} 
                className={`bg-card rounded-xl border border-border p-4 transition-all ${
                  !professional.is_active ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {professional.avatar_url ? (
                        <img 
                          src={professional.avatar_url} 
                          alt={professional.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{professional.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" />
                        {professional.specialty}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{professional.duration} min por consulta</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <Button
                    variant={professional.is_active ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleActive(professional)}
                  >
                    {professional.is_active ? 'Desativar' : 'Ativar'}
                  </Button>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(professional)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover profissional?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Todos os agendamentos futuros deste profissional serão mantidos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(professional)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfessionalsManagement;
