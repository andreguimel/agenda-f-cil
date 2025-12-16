export interface Professional {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  duration: number; // appointment duration in minutes
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  professionalId: string;
  professionalName: string;
  date: string;
  time: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
}

export interface BlockedTime {
  id: string;
  professionalId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}
