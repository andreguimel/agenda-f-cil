import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Phone, Mail, MapPin, Loader2, Save, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clinic } from '@/services/schedulingService';

interface ClinicWithHours extends Clinic {
  opening_time?: string | null;
  closing_time?: string | null;
}

const ClinicSettings = () => {
  const { clinic } = useOutletContext<{ clinic: ClinicWithHours | null }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    opening_time: '08:00',
    closing_time: '18:00',
  });

  useEffect(() => {
    if (clinic) {
      setFormData({
        name: clinic.name || '',
        phone: clinic.phone || '',
        email: clinic.email || '',
        address: clinic.address || '',
        opening_time: clinic.opening_time?.slice(0, 5) || '08:00',
        closing_time: clinic.closing_time?.slice(0, 5) || '18:00',
      });
    }
  }, [clinic]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome da clínica',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.name.length > 100) {
      toast({
        title: 'Nome muito longo',
        description: 'O nome deve ter no máximo 100 caracteres',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, informe um email válido',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.phone && formData.phone.length > 20) {
      toast({
        title: 'Telefone muito longo',
        description: 'O telefone deve ter no máximo 20 caracteres',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.address && formData.address.length > 200) {
      toast({
        title: 'Endereço muito longo',
        description: 'O endereço deve ter no máximo 200 caracteres',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clinic?.id) return;
    if (!validateForm()) return;

    setLoading(true);

    const { error } = await supabase
      .from('clinics')
      .update({
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        opening_time: formData.opening_time || '08:00',
        closing_time: formData.closing_time || '18:00',
      })
      .eq('id', clinic.id);

    setLoading(false);

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar os dados da clínica',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Dados atualizados!',
      description: 'As informações da clínica foram salvas com sucesso',
    });
  };

  if (!clinic) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/painel')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <h1 className="text-2xl font-bold text-foreground">Dados da Clínica</h1>
        <p className="text-muted-foreground mt-1">
          Edite as informações que aparecem na página de agendamento
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Informações da Clínica
          </CardTitle>
          <CardDescription>
            Estes dados serão exibidos para os pacientes na página pública de agendamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Nome da Clínica *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nome da sua clínica"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Telefone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                Este número também será usado para o link do WhatsApp
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contato@clinica.com.br"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Endereço
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Av. Paulista, 1000 - São Paulo, SP"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Horário de Funcionamento
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label htmlFor="opening_time" className="text-xs text-muted-foreground">
                    Abertura
                  </Label>
                  <Input
                    id="opening_time"
                    type="time"
                    value={formData.opening_time}
                    onChange={(e) => handleChange('opening_time', e.target.value)}
                  />
                </div>
                <span className="text-muted-foreground mt-5">às</span>
                <div className="flex-1">
                  <Label htmlFor="closing_time" className="text-xs text-muted-foreground">
                    Fechamento
                  </Label>
                  <Input
                    id="closing_time"
                    type="time"
                    value={formData.closing_time}
                    onChange={(e) => handleChange('closing_time', e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Horário exibido na página de agendamento
              </p>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicSettings;
