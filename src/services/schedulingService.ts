import { supabase } from '@/integrations/supabase/client';

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface Professional {
  id: string;
  clinic_id: string;
  name: string;
  specialty: string;
  avatar_url: string | null;
  duration: number;
  is_active: boolean;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  professional_id: string;
  professional?: Professional;
  date: string;
  time: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface BlockedTime {
  id: string;
  professional_id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

// Fetch clinic by slug
export const fetchClinicBySlug = async (slug: string): Promise<Clinic | null> => {
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching clinic:', error);
    return null;
  }

  return data;
};

// Fetch professionals by clinic
export const fetchProfessionalsByClinic = async (clinicId: string): Promise<Professional[]> => {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching professionals:', error);
    return [];
  }

  return data || [];
};

// Fetch appointments by clinic
export const fetchAppointmentsByClinic = async (clinicId: string): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      professional:professionals(*)
    `)
    .eq('clinic_id', clinicId)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }

  return data || [];
};

// Fetch blocked times by professional
export const fetchBlockedTimes = async (professionalId: string, date: string): Promise<BlockedTime[]> => {
  const { data, error } = await supabase
    .from('blocked_times')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('date', date);

  if (error) {
    console.error('Error fetching blocked times:', error);
    return [];
  }

  return data || [];
};

// Fetch existing appointments for a professional on a specific date
export const fetchAppointmentsByProfessionalAndDate = async (
  professionalId: string, 
  date: string
): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('date', date)
    .neq('status', 'cancelled');

  if (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }

  return data || [];
};

// Generate available time slots
export const generateTimeSlots = async (
  date: Date, 
  professionalId: string
): Promise<TimeSlot[]> => {
  const dateStr = date.toISOString().split('T')[0];
  
  // Fetch existing appointments and blocked times
  const [appointments, blockedTimes] = await Promise.all([
    fetchAppointmentsByProfessionalAndDate(professionalId, dateStr),
    fetchBlockedTimes(professionalId, dateStr),
  ]);

  const bookedTimes = new Set(appointments.map(apt => apt.time));
  
  const slots: TimeSlot[] = [];
  const startHour = 8;
  const endHour = 18;
  const interval = 30;
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const timeWithSeconds = `${time}:00`;
      
      // Check if time is in the past (for today)
      const isPast = isToday && (hour < now.getHours() || (hour === now.getHours() && minute <= now.getMinutes()));
      
      // Check if time is already booked
      const isBooked = bookedTimes.has(time) || bookedTimes.has(timeWithSeconds);
      
      // Check if time is blocked
      const isBlocked = blockedTimes.some(bt => {
        const start = bt.start_time.substring(0, 5);
        const end = bt.end_time.substring(0, 5);
        return time >= start && time < end;
      });

      slots.push({
        id: `${dateStr}-${time}-${professionalId}`,
        time,
        available: !isPast && !isBooked && !isBlocked,
      });
    }
  }

  return slots;
};

// Create appointment
export const createAppointment = async (
  appointment: Omit<Appointment, 'id' | 'created_at' | 'status' | 'notes' | 'professional'>
): Promise<{ data: Appointment | null; error: Error | null }> => {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...appointment,
      status: 'confirmed',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating appointment:', error);
    return { data: null, error };
  }

  // Sync with Google Calendar
  if (data) {
    syncAppointmentToGoogleCalendar(data);
  }

  return { data, error: null };
};

// Sync appointment to Google Calendar
export const syncAppointmentToGoogleCalendar = async (appointment: Appointment) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-sync`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-event',
          clinicId: appointment.clinic_id,
          appointment,
        }),
      }
    );

    if (!response.ok) {
      console.log('Google Calendar sync skipped (not connected)');
    }
  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
  }
};

// Get busy times from Google Calendar
export const getGoogleCalendarBusyTimes = async (
  clinicId: string,
  date: string
): Promise<{ start: string; end: string }[]> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-sync`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-busy-times',
          clinicId,
          date,
        }),
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.busyTimes || [];
  } catch (error) {
    console.error('Error fetching Google Calendar busy times:', error);
    return [];
  }
};

// Update appointment status
export const updateAppointmentStatus = async (
  id: string, 
  status: string
): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating appointment:', error);
    return { error };
  }

  return { error: null };
};

// Get user profile with clinic
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      clinic:clinics(*)
    `)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

// Link profile to clinic
export const linkProfileToClinic = async (userId: string, clinicId: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({ clinic_id: clinicId })
    .eq('user_id', userId);

  if (error) {
    console.error('Error linking profile to clinic:', error);
    return { error };
  }

  return { error: null };
};
