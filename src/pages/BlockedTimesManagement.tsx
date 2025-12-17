import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Clock, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  Calendar,
  User,
  X,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchProfessionalsByClinic,
  fetchAllBlockedTimes,
  createBlockedTime,
  updateBlockedTime,
  deleteBlockedTime,
  getUserProfile,
  linkProfileToClinic,
  getGoogleCalendarBusyTimesForClinic,
  Professional,
  BlockedTime
} from '@/services/schedulingService';

const DEMO_CLINIC_ID = '550e8400-e29b-41d4-a716-446655440000';

interface BlockedTimeFormData {
  professional_ids: string[];
  dates: Date[];
  start_time: string;
  end_time: string;
  reason: string;
}

interface EditFormData {
  professional_id: string;
  date: Date | undefined;
  start_time: string;
  end_time: string;
  reason: string;
}

const BlockedTimesManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlockedTime, setEditingBlockedTime] = useState<BlockedTime | null>(null);
  
  // Google Calendar busy times state
  const [googleBusyTimes, setGoogleBusyTimes] = useState<{ professionalId: string; professionalName: string; busyTimes: { start: string; end: string }[] }[]>([]);
  const [googleCalendarDate, setGoogleCalendarDate] = useState<Date>(new Date());
  const [loadingGoogleBusy, setLoadingGoogleBusy] = useState(false);
  
  // Form data for creating new blocked times (supports multiple)
  const [formData, setFormData] = useState<BlockedTimeFormData>({
    professional_ids: [],
    dates: [],
    start_time: '08:00',
    end_time: '18:00',
    reason: '',
  });
  
  // Form data for editing a single blocked time
  const [editFormData, setEditFormData] = useState<EditFormData>({
    professional_id: '',
    date: undefined,
    start_time: '08:00',
    end_time: '18:00',
    reason: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [filterProfessional, setFilterProfessional] = useState<string>('all');

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
      
      const [professionalsData, blockedTimesData] = await Promise.all([
        fetchProfessionalsByClinic(currentClinicId),
        fetchAllBlockedTimes(currentClinicId),
      ]);
      
      setProfessionals(professionalsData);
      setBlockedTimes(blockedTimesData);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const loadGoogleCalendarBusyTimes = async () => {
    if (!clinicId || professionals.length === 0) return;
    
    setLoadingGoogleBusy(true);
    const dateStr = format(googleCalendarDate, 'yyyy-MM-dd');
    const busyTimes = await getGoogleCalendarBusyTimesForClinic(clinicId, dateStr, professionals);
    setGoogleBusyTimes(busyTimes);
    setLoadingGoogleBusy(false);
  };

  useEffect(() => {
    if (clinicId && professionals.length > 0) {
      loadGoogleCalendarBusyTimes();
    }
  }, [clinicId, professionals, googleCalendarDate]);

  const resetForm = () => {
    setFormData({
      professional_ids: [],
      dates: [],
      start_time: '08:00',
      end_time: '18:00',
      reason: '',
    });
    setEditFormData({
      professional_id: '',
      date: undefined,
      start_time: '08:00',
      end_time: '18:00',
      reason: '',
    });
    setEditingBlockedTime(null);
  };

  const handleOpenDialog = (blockedTime?: BlockedTime) => {
    if (blockedTime) {
      setEditingBlockedTime(blockedTime);
      setEditFormData({
        professional_id: blockedTime.professional_id,
        date: parseISO(blockedTime.date),
        start_time: blockedTime.start_time.substring(0, 5),
        end_time: blockedTime.end_time.substring(0, 5),
        reason: blockedTime.reason || '',
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

  const toggleProfessional = (professionalId: string) => {
    setFormData(prev => ({
      ...prev,
      professional_ids: prev.professional_ids.includes(professionalId)
        ? prev.professional_ids.filter(id => id !== professionalId)
        : [...prev.professional_ids, professionalId]
    }));
  };

  const selectAllProfessionals = () => {
    setFormData(prev => ({
      ...prev,
      professional_ids: professionals.map(p => p.id)
    }));
  };

  const clearAllProfessionals = () => {
    setFormData(prev => ({
      ...prev,
      professional_ids: []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicId) return;

    if (editingBlockedTime) {
      // Editing single blocked time
      if (!editFormData.professional_id || !editFormData.date || !editFormData.start_time || !editFormData.end_time) {
        toast({
          title: 'Erro',
          description: 'Preencha todos os campos obrigatórios',
          variant: 'destructive',
        });
        return;
      }

      if (editFormData.start_time >= editFormData.end_time) {
        toast({
          title: 'Erro',
          description: 'O horário de início deve ser anterior ao horário de fim',
          variant: 'destructive',
        });
        return;
      }

      setSubmitting(true);
      const dateStr = format(editFormData.date, 'yyyy-MM-dd');

      const { error } = await updateBlockedTime(editingBlockedTime.id, {
        professional_id: editFormData.professional_id,
        date: dateStr,
        start_time: editFormData.start_time,
        end_time: editFormData.end_time,
        reason: editFormData.reason.trim() || null,
      });

      if (error) {
        toast({
          title: 'Erro ao atualizar',
          description: 'Não foi possível atualizar o bloqueio',
          variant: 'destructive',
        });
      } else {
        const professional = professionals.find(p => p.id === editFormData.professional_id);
        setBlockedTimes(prev => 
          prev.map(bt => bt.id === editingBlockedTime.id 
            ? { 
                ...bt, 
                professional_id: editFormData.professional_id,
                date: dateStr,
                start_time: editFormData.start_time,
                end_time: editFormData.end_time,
                reason: editFormData.reason.trim() || null,
                professional,
              }
            : bt
          )
        );
        toast({
          title: 'Bloqueio atualizado',
          description: 'As informações foram salvas com sucesso',
        });
        handleCloseDialog();
      }
    } else {
      // Creating new blocked times (multiple professionals and dates)
      if (formData.professional_ids.length === 0 || formData.dates.length === 0 || !formData.start_time || !formData.end_time) {
        toast({
          title: 'Erro',
          description: 'Selecione pelo menos um profissional e uma data',
          variant: 'destructive',
        });
        return;
      }

      if (formData.start_time >= formData.end_time) {
        toast({
          title: 'Erro',
          description: 'O horário de início deve ser anterior ao horário de fim',
          variant: 'destructive',
        });
        return;
      }

      setSubmitting(true);

      const createdBlockedTimes: BlockedTime[] = [];
      let hasError = false;

      // Create blocked times for each combination of professional and date
      for (const professionalId of formData.professional_ids) {
        for (const date of formData.dates) {
          const dateStr = format(date, 'yyyy-MM-dd');
          const { data, error } = await createBlockedTime({
            professional_id: professionalId,
            date: dateStr,
            start_time: formData.start_time,
            end_time: formData.end_time,
            reason: formData.reason.trim() || null,
          });

          if (error || !data) {
            hasError = true;
          } else {
            createdBlockedTimes.push(data);
          }
        }
      }

      if (hasError) {
        toast({
          title: 'Erro parcial',
          description: 'Alguns bloqueios não puderam ser criados',
          variant: 'destructive',
        });
      }

      if (createdBlockedTimes.length > 0) {
        setBlockedTimes(prev => [...prev, ...createdBlockedTimes]);
        const totalCreated = createdBlockedTimes.length;
        toast({
          title: 'Bloqueios adicionados',
          description: `${totalCreated} bloqueio${totalCreated > 1 ? 's foram criados' : ' foi criado'} com sucesso`,
        });
        handleCloseDialog();
      }
    }

    setSubmitting(false);
  };

  const handleDelete = async (blockedTime: BlockedTime) => {
    const { error } = await deleteBlockedTime(blockedTime.id);

    if (error) {
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o bloqueio',
        variant: 'destructive',
      });
    } else {
      setBlockedTimes(prev => prev.filter(bt => bt.id !== blockedTime.id));
      toast({
        title: 'Bloqueio removido',
        description: 'O horário foi liberado',
      });
    }
  };

  const filteredBlockedTimes = blockedTimes
    .filter(bt => filterProfessional === 'all' || bt.professional_id === filterProfessional)
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.start_time.localeCompare(b.start_time);
    });

  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

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
            <h1 className="text-xl font-bold text-foreground">Horários Bloqueados</h1>
            <p className="text-sm text-muted-foreground">Gerencie indisponibilidades</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} disabled={professionals.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingBlockedTime ? 'Editar Bloqueio' : 'Novo Bloqueio'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {editingBlockedTime ? (
                  // Edit mode - single professional and date
                  <>
                    <div className="space-y-2">
                      <Label>Profissional *</Label>
                      <Select
                        value={editFormData.professional_id}
                        onValueChange={(value) => setEditFormData(prev => ({ ...prev, professional_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o profissional" />
                        </SelectTrigger>
                        <SelectContent>
                          {professionals.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Data *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !editFormData.date && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {editFormData.date ? format(editFormData.date, "PPP", { locale: ptBR }) : "Selecione a data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={editFormData.date}
                            onSelect={(date) => setEditFormData(prev => ({ ...prev, date }))}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Início *</Label>
                        <Select
                          value={editFormData.start_time}
                          onValueChange={(value) => setEditFormData(prev => ({ ...prev, start_time: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Fim *</Label>
                        <Select
                          value={editFormData.end_time}
                          onValueChange={(value) => setEditFormData(prev => ({ ...prev, end_time: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Motivo (opcional)</Label>
                      <Input
                        id="reason"
                        placeholder="Ex: Férias, Reunião, etc."
                        value={editFormData.reason}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, reason: e.target.value }))}
                      />
                    </div>
                  </>
                ) : (
                  // Create mode - multiple professionals and dates
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Profissionais *</Label>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={selectAllProfessionals}
                          >
                            Todos
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={clearAllProfessionals}
                          >
                            Limpar
                          </Button>
                        </div>
                      </div>
                      <div className="border border-border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                        {professionals.map(p => (
                          <div key={p.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`prof-${p.id}`}
                              checked={formData.professional_ids.includes(p.id)}
                              onCheckedChange={() => toggleProfessional(p.id)}
                            />
                            <label
                              htmlFor={`prof-${p.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {p.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      {formData.professional_ids.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {formData.professional_ids.length} profissional{formData.professional_ids.length > 1 ? 'is' : ''} selecionado{formData.professional_ids.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Datas *</Label>
                      <div className="border border-border rounded-lg p-3">
                        <CalendarComponent
                          mode="multiple"
                          selected={formData.dates}
                          onSelect={(dates) => setFormData(prev => ({ ...prev, dates: dates || [] }))}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          className={cn("p-0 pointer-events-auto")}
                        />
                      </div>
                      {formData.dates.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            {formData.dates.length} data{formData.dates.length > 1 ? 's' : ''} selecionada{formData.dates.length > 1 ? 's' : ''}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {formData.dates.sort((a, b) => a.getTime() - b.getTime()).map((date, i) => (
                              <span 
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs"
                              >
                                {format(date, "dd/MM", { locale: ptBR })}
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    dates: prev.dates.filter((_, idx) => idx !== i)
                                  }))}
                                  className="hover:text-destructive"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Início *</Label>
                        <Select
                          value={formData.start_time}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, start_time: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Fim *</Label>
                        <Select
                          value={formData.end_time}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, end_time: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Motivo (opcional)</Label>
                      <Input
                        id="reason"
                        placeholder="Ex: Férias, Reunião, etc."
                        value={formData.reason}
                        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      />
                    </div>

                    {formData.professional_ids.length > 0 && formData.dates.length > 0 && (
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">
                          Serão criados <strong>{formData.professional_ids.length * formData.dates.length}</strong> bloqueios 
                          ({formData.professional_ids.length} profissional{formData.professional_ids.length > 1 ? 'is' : ''} × {formData.dates.length} data{formData.dates.length > 1 ? 's' : ''})
                        </p>
                      </div>
                    )}
                  </>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingBlockedTime ? 'Salvar' : 'Adicionar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {professionals.length > 0 && (
          <div className="px-4 lg:px-6 pb-4">
            <Select value={filterProfessional} onValueChange={setFilterProfessional}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Filtrar por profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os profissionais</SelectItem>
                {professionals.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </header>

      <main className="p-4 lg:p-6 space-y-8">
        {/* Google Calendar Busy Times Section */}
        {professionals.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Eventos do Google Calendar
                </h2>
                <p className="text-sm text-muted-foreground">
                  Horários bloqueados automaticamente pelo Google Calendar
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(googleCalendarDate, "dd/MM/yyyy", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={googleCalendarDate}
                      onSelect={(date) => date && setGoogleCalendarDate(date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={loadGoogleCalendarBusyTimes}
                  disabled={loadingGoogleBusy}
                >
                  <RefreshCw className={cn("w-4 h-4", loadingGoogleBusy && "animate-spin")} />
                </Button>
              </div>
            </div>

            {loadingGoogleBusy ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : googleBusyTimes.length === 0 ? (
              <div className="bg-muted/30 rounded-lg p-6 text-center">
                <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhum evento no Google Calendar para {format(googleCalendarDate, "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {googleBusyTimes.map((item) => (
                  <div key={item.professionalId} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{item.professionalName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.busyTimes.length} evento{item.busyTimes.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {item.busyTimes.map((bt, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center gap-2 text-sm bg-muted/50 rounded px-3 py-2"
                        >
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{bt.start} - {bt.end}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Manual Blocked Times Section */}
        <div className="space-y-4">
          {professionals.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-destructive" />
                Bloqueios Manuais
              </h2>
              <p className="text-sm text-muted-foreground">
                Horários bloqueados manualmente no sistema
              </p>
            </div>
          )}

          {professionals.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum profissional cadastrado</h3>
              <p className="text-muted-foreground mb-4">Adicione profissionais primeiro para gerenciar bloqueios</p>
              <Button onClick={() => navigate('/painel/profissionais')}>
                <Plus className="w-4 h-4 mr-2" />
                Ir para Profissionais
              </Button>
            </div>
          ) : filteredBlockedTimes.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum bloqueio manual</h3>
              <p className="text-muted-foreground mb-4">Adicione bloqueios para marcar horários indisponíveis</p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Bloqueio
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBlockedTimes.map((blockedTime) => {
                const professional = professionals.find(p => p.id === blockedTime.professional_id);
                return (
                  <div 
                    key={blockedTime.id} 
                    className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {format(parseISO(blockedTime.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </h3>
                          <p className="text-sm text-muted-foreground">{professional?.name || 'Profissional'}</p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {blockedTime.start_time.substring(0, 5)} - {blockedTime.end_time.substring(0, 5)}
                            </span>
                          </div>
                          {blockedTime.reason && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Motivo: {blockedTime.reason}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(blockedTime)}
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
                              <AlertDialogTitle>Remover bloqueio?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação irá liberar o horário para agendamentos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(blockedTime)}
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
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BlockedTimesManagement;
