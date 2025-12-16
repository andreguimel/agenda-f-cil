import { Professional, Appointment, TimeSlot } from '@/types/scheduling';

export const professionals: Professional[] = [
  {
    id: '1',
    name: 'Dra. Ana Silva',
    specialty: 'Clínica Geral',
    duration: 30,
  },
  {
    id: '2',
    name: 'Dr. Carlos Santos',
    specialty: 'Cardiologia',
    duration: 45,
  },
  {
    id: '3',
    name: 'Dra. Marina Costa',
    specialty: 'Dermatologia',
    duration: 30,
  },
];

export const generateTimeSlots = (date: Date, professionalId: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 8;
  const endHour = 18;
  const interval = 30;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const isPast = date.toDateString() === new Date().toDateString() && 
        (hour < new Date().getHours() || (hour === new Date().getHours() && minute <= new Date().getMinutes()));
      
      // Simulate some unavailable slots randomly
      const randomUnavailable = Math.random() < 0.2;
      
      slots.push({
        id: `${date.toISOString()}-${time}-${professionalId}`,
        time,
        available: !isPast && !randomUnavailable,
      });
    }
  }

  return slots;
};

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    professionalId: '1',
    professionalName: 'Dra. Ana Silva',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    patientName: 'João Pereira',
    patientEmail: 'joao@email.com',
    patientPhone: '(11) 99999-1234',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    professionalId: '2',
    professionalName: 'Dr. Carlos Santos',
    date: new Date().toISOString().split('T')[0],
    time: '10:30',
    patientName: 'Maria Oliveira',
    patientEmail: 'maria@email.com',
    patientPhone: '(11) 99999-5678',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    professionalId: '1',
    professionalName: 'Dra. Ana Silva',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '14:00',
    patientName: 'Pedro Silva',
    patientEmail: 'pedro@email.com',
    patientPhone: '(11) 99999-9012',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
];
