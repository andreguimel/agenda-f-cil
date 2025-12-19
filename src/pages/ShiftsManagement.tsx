import { useState, useEffect } from 'react';
import { 
  Clock, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  User,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  fetchAllProfessionalsByClinic,
  fetchShiftsByProfessional,
  createShift,
  updateShift,
  deleteShift,
  getUserProfile,
  linkProfileToClinic,
  Professional,
  ProfessionalShift
} from '@/services/schedulingService';

const DEMO_CLINIC_ID = '550e8400-e29b-41d4-a716-446655440000';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Segunda', short: 'Seg' },
  { value: 2, label: 'Terça', short: 'Ter' },
  { value: 3, label: 'Quarta', short: 'Qua' },
  { value: 4, label: 'Quinta', short: 'Qui' },
  { value: 5, label: 'Sexta', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
];

const SHIFT_TYPES = [
  { value: 'morning', label: 'Manhã' },
  { value: 'afternoon', label: 'Tarde' },
  { value: 'evening', label: 'Noite' },
];

interface ShiftFormData {
  days_of_week: number[];
  shift_name: string;
  start_time: string;
  end_time: string;
  max_slots: number;
}

const ShiftsManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [shifts, setShifts] = useState<ProfessionalShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ProfessionalShift | null>(null);
  const [formData, setFormData] = useState<ShiftFormData>({
    days_of_week: [1],
    shift_name: 'morning',
    start_time: '08:00',
    end_time: '12:00',
    max_slots: 10,
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
      // Filter only professionals with arrival_order mode
      const arrivalOrderProfessionals = professionalsData.filter(p => p.scheduling_mode === 'arrival_order');
      setProfessionals(arrivalOrderProfessionals);
      
      if (arrivalOrderProfessionals.length > 0) {
        setSelectedProfessional(arrivalOrderProfessionals[0]);
      }
      
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    const loadShifts = async () => {
      if (!selectedProfessional) {
        setShifts([]);
        return;
      }
      
      setLoadingShifts(true);
      const shiftsData = await fetchShiftsByProfessional(selectedProfessional.id);
      setShifts(shiftsData);
      setLoadingShifts(false);
    };

    loadShifts();
  }, [selectedProfessional]);

  const resetForm = () => {
    setFormData({
      days_of_week: [1],
      shift_name: 'morning',
      start_time: '08:00',
      end_time: '12:00',
      max_slots: 10,
    });
    setEditingShift(null);
  };

  const handleOpenDialog = (shift?: ProfessionalShift) => {
    if (shift) {
      setEditingShift(shift);
      setFormData({
        days_of_week: [shift.day_of_week],
        shift_name: shift.shift_name,
        start_time: shift.start_time.slice(0, 5),
        end_time: shift.end_time.slice(0, 5),
        max_slots: shift.max_slots,
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
    if (!selectedProfessional) return;
    if (formData.days_of_week.length === 0) {
      toast({
        title: 'Selecione pelo menos um dia',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    if (editingShift) {
      const { error } = await updateShift(editingShift.id, {
        day_of_week: formData.days_of_week[0],
        shift_name: formData.shift_name,
        start_time: formData.start_time,
        end_time: formData.end_time,
        max_slots: formData.max_slots,
      });

      if (error) {
        toast({
          title: 'Erro ao atualizar',
          description: 'Não foi possível atualizar o turno',
          variant: 'destructive',
        });
      } else {
        setShifts(prev => 
          prev.map(s => s.id === editingShift.id 
            ? { ...s, day_of_week: formData.days_of_week[0], shift_name: formData.shift_name, start_time: formData.start_time, end_time: formData.end_time, max_slots: formData.max_slots }
            : s
          )
        );
        toast({
          title: 'Turno atualizado',
          description: 'As informações foram salvas com sucesso',
        });
        handleCloseDialog();
      }
    } else {
      const results = await Promise.all(
        formData.days_of_week.map(day => 
          createShift({
            professional_id: selectedProfessional.id,
            day_of_week: day,
            shift_name: formData.shift_name,
            start_time: formData.start_time,
            end_time: formData.end_time,
            max_slots: formData.max_slots,
          })
        )
      );

      const errors = results.filter(r => r.error);
      const successes = results.filter(r => r.data);

      if (successes.length > 0) {
        setShifts(prev => [...prev, ...successes.map(r => r.data!)]);
      }

      if (errors.length > 0 && successes.length === 0) {
        toast({
          title: 'Erro ao criar',
          description: errors[0].error?.message?.includes('duplicate') 
            ? 'Já existe um turno com esse tipo neste dia' 
            : 'Não foi possível adicionar os turnos',
          variant: 'destructive',
        });
      } else if (errors.length > 0) {
        toast({
          title: 'Turnos parcialmente criados',
          description: `${successes.length} turno(s) criado(s), ${errors.length} erro(s)`,
        });
        handleCloseDialog();
      } else {
        toast({
          title: 'Turnos adicionados',
          description: `${successes.length} turno(s) criado(s) com sucesso`,
        });
        handleCloseDialog();
      }
    }

    setSubmitting(false);
  };

  const handleDelete = async (shift: ProfessionalShift) => {
    const { error } = await deleteShift(shift.id);

    if (error) {
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o turno',
        variant: 'destructive',
      });
    } else {
      setShifts(prev => prev.filter(s => s.id !== shift.id));
      toast({
        title: 'Turno removido',
        description: 'O turno foi removido com sucesso',
      });
    }
  };

  const getShiftsByDay = (dayOfWeek: number) => {
    return shifts.filter(s => s.day_of_week === dayOfWeek);
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
      <header className="bg-card border-b border-border sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Turnos</h1>
            <p className="text-sm text-muted-foreground">Configure os turnos de atendimento</p>
          </div>
          
          {selectedProfessional && (
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Turno
            </Button>
          )}
        </div>
      </header>

      <main className="p-4 lg:p-6">
        {professionals.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum profissional com ordem de chegada</h3>
            <p className="text-muted-foreground mb-4">
              Configure um profissional para atender por ordem de chegada na página de profissionais
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Professional Selector */}
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">Profissional:</Label>
              <Select 
                value={selectedProfessional?.id || ''} 
                onValueChange={(id) => {
                  const prof = professionals.find(p => p.id === id);
                  setSelectedProfessional(prof || null);
                }}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Selecione um profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map(prof => (
                    <SelectItem key={prof.id} value={prof.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {prof.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Shifts by Day */}
            {selectedProfessional && (() => {
              const availableDays = DAYS_OF_WEEK.filter(day => {
                if (day.value === 0 && !selectedProfessional.works_sunday) return false;
                if (day.value === 6 && !selectedProfessional.works_saturday) return false;
                return true;
              });
              
              return (
              <Tabs defaultValue="1" className="w-full">
                <TabsList className={`grid w-full`} style={{ gridTemplateColumns: `repeat(${availableDays.length}, 1fr)` }}>
                  {availableDays.map(day => (
                    <TabsTrigger key={day.value} value={String(day.value)} className="text-xs sm:text-sm">
                      <span className="hidden sm:inline">{day.label}</span>
                      <span className="sm:hidden">{day.short}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {availableDays.map(day => (
                  <TabsContent key={day.value} value={String(day.value)} className="mt-4">
                    {loadingShifts ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getShiftsByDay(day.value).length === 0 ? (
                          <div className="text-center py-8 border border-dashed border-border rounded-xl">
                            <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground mb-3">Nenhum turno configurado para {day.label}</p>
                            <Button variant="outline" size="sm" onClick={() => {
                              setFormData(prev => ({ ...prev, days_of_week: [day.value] }));
                              handleOpenDialog();
                            }}>
                              <Plus className="w-4 h-4 mr-1" />
                              Adicionar
                            </Button>
                          </div>
                        ) : (
                          getShiftsByDay(day.value).map(shift => (
                            <div 
                              key={shift.id}
                              className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Clock className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground">
                                    {SHIFT_TYPES.find(t => t.value === shift.shift_name)?.label || shift.shift_name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                                  </p>
                                </div>
                                <div className="bg-secondary px-3 py-1 rounded-full">
                                  <span className="text-sm font-medium text-foreground">{shift.max_slots} vagas</span>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(shift)}>
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
                                      <AlertDialogTitle>Remover turno?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Os agendamentos existentes serão mantidos.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDelete(shift)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Remover
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
              );
            })()}
          </div>
        )}
      </main>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingShift ? 'Editar Turno' : 'Novo Turno'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Dias da Semana</Label>
              {editingShift ? (
                <Select
                  value={String(formData.days_of_week[0])}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, days_of_week: [parseInt(v)] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day.value} value={String(day.value)}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex flex-wrap gap-3 p-3 border rounded-md bg-background">
                  {DAYS_OF_WEEK
                    .filter(day => {
                      if (day.value === 0 && !selectedProfessional?.works_sunday) return false;
                      if (day.value === 6 && !selectedProfessional?.works_saturday) return false;
                      return true;
                    })
                    .map(day => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={formData.days_of_week.includes(day.value)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            days_of_week: checked 
                              ? [...prev.days_of_week, day.value].sort((a, b) => a - b)
                              : prev.days_of_week.filter(d => d !== day.value)
                          }));
                        }}
                      />
                      <label 
                        htmlFor={`day-${day.value}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {day.short}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift_name">Turno</Label>
              <Select
                value={formData.shift_name}
                onValueChange={(v) => setFormData(prev => ({ ...prev, shift_name: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIFT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Início</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">Fim</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_slots">Quantidade de vagas</Label>
              <Input
                id="max_slots"
                type="number"
                min={1}
                max={100}
                value={formData.max_slots}
                onChange={(e) => setFormData(prev => ({ ...prev, max_slots: parseInt(e.target.value) || 10 }))}
              />
              <p className="text-xs text-muted-foreground">
                Número máximo de pacientes que podem agendar neste turno
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingShift ? 'Salvar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShiftsManagement;