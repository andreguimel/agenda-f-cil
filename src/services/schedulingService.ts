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
  work_start_time: string;
  work_end_time: string;
  has_lunch_break: boolean;
  lunch_start_time: string;
  lunch_end_time: string;
  max_advance_days: number | null;
  scheduling_mode: string; // 'time_slots' | 'arrival_order'
  show_queue_position: boolean;
}

export interface ProfessionalShift {
  id: string;
  professional_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  shift_name: string; // 'morning', 'afternoon', 'evening'
  start_time: string;
  end_time: string;
  max_slots: number;
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
  shift_name?: string | null;
  queue_position?: number | null;
}

export interface BlockedTime {
  id: string;
  professional_id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  google_event_id?: string | null;
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

// Fetch clinic by ID
export const fetchClinicById = async (clinicId: string): Promise<Clinic | null> => {
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', clinicId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching clinic:', error);
    return null;
  }

  return data;
};

// Update clinic slug
export const updateClinicSlug = async (
  clinicId: string,
  newSlug: string
): Promise<{ error: Error | null }> => {
  // Check if slug is already taken
  const { data: existing } = await supabase
    .from('clinics')
    .select('id')
    .eq('slug', newSlug)
    .neq('id', clinicId)
    .maybeSingle();

  if (existing) {
    return { error: new Error('Este link já está em uso') };
  }

  const { error } = await supabase
    .from('clinics')
    .update({ slug: newSlug })
    .eq('id', clinicId);

  if (error) {
    console.error('Error updating clinic slug:', error);
    return { error };
  }

  return { error: null };
};

// Fetch active professionals by clinic (for booking)
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

// Fetch all professionals by clinic (for management)
export const fetchAllProfessionalsByClinic = async (clinicId: string): Promise<Professional[]> => {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('name');

  if (error) {
    console.error('Error fetching professionals:', error);
    return [];
  }

  return data || [];
};

// Create a new professional
export const createProfessional = async (
  professional: Omit<Professional, 'id' | 'is_active'>
): Promise<{ data: Professional | null; error: Error | null }> => {
  const { data, error } = await supabase
    .from('professionals')
    .insert({
      ...professional,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating professional:', error);
    return { data: null, error };
  }

  // Create Google Calendar for this professional
  if (data) {
    createGoogleCalendarForProfessional(data);
  }

  return { data, error: null };
};

// Create Google Calendar for a professional
export const createGoogleCalendarForProfessional = async (professional: Professional) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-sync`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-calendar',
          clinicId: professional.clinic_id,
          professional: {
            id: professional.id,
            name: professional.name,
            specialty: professional.specialty,
          },
        }),
      }
    );

    if (!response.ok) {
      console.log('Google Calendar creation skipped (not connected or error)');
    } else {
      console.log('Google Calendar created for professional:', professional.name);
    }
  } catch (error) {
    console.error('Error creating Google Calendar for professional:', error);
  }
};

// Update a professional
export const updateProfessional = async (
  id: string,
  updates: Partial<Omit<Professional, 'id' | 'clinic_id'>>
): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('professionals')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating professional:', error);
    return { error };
  }

  return { error: null };
};

// Delete a professional (soft delete by setting is_active to false)
export const deleteProfessional = async (id: string): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('professionals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting professional:', error);
    return { error };
  }

  return { error: null };
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

// Fetch blocked times by professional and date
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

// Fetch all blocked times by clinic
export const fetchAllBlockedTimes = async (clinicId: string): Promise<BlockedTime[]> => {
  // First get all professional IDs for this clinic
  const { data: professionals, error: profError } = await supabase
    .from('professionals')
    .select('id')
    .eq('clinic_id', clinicId);

  if (profError || !professionals?.length) {
    console.error('Error fetching professionals for blocked times:', profError);
    return [];
  }

  const professionalIds = professionals.map(p => p.id);

  const { data, error } = await supabase
    .from('blocked_times')
    .select(`
      *,
      professional:professionals(*)
    `)
    .in('professional_id', professionalIds)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching all blocked times:', error);
    return [];
  }

  return data || [];
};

// Create blocked time
export const createBlockedTime = async (
  blockedTime: Omit<BlockedTime, 'id'>
): Promise<{ data: BlockedTime | null; error: Error | null }> => {
  const { data, error } = await supabase
    .from('blocked_times')
    .insert(blockedTime)
    .select()
    .single();

  if (error) {
    console.error('Error creating blocked time:', error);
    return { data: null, error };
  }

  // Sync with Google Calendar
  if (data) {
    syncBlockedTimeToGoogleCalendar(data);
  }

  return { data, error: null };
};

// Sync blocked time to Google Calendar
export const syncBlockedTimeToGoogleCalendar = async (blockedTime: BlockedTime) => {
  try {
    // Get professional to find clinic_id
    const { data: professional } = await supabase
      .from('professionals')
      .select('clinic_id')
      .eq('id', blockedTime.professional_id)
      .single();

    if (!professional) return;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-sync`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-blocked-event',
          clinicId: professional.clinic_id,
          blockedTime,
        }),
      }
    );

    if (!response.ok) {
      console.log('Google Calendar sync skipped for blocked time (not connected)');
    } else {
      console.log('Blocked time synced to Google Calendar');
    }
  } catch (error) {
    console.error('Error syncing blocked time to Google Calendar:', error);
  }
};

// Delete blocked time Google Calendar event
export const deleteBlockedTimeGoogleEvent = async (blockedTime: BlockedTime) => {
  if (!blockedTime.google_event_id) return;
  
  try {
    // Get professional to find clinic_id
    const { data: professional } = await supabase
      .from('professionals')
      .select('clinic_id')
      .eq('id', blockedTime.professional_id)
      .single();

    if (!professional) return;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-sync`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-blocked-event',
          clinicId: professional.clinic_id,
          blockedTime,
        }),
      }
    );

    if (!response.ok) {
      console.log('Google Calendar event deletion skipped (not connected)');
    } else {
      console.log('Blocked time event deleted from Google Calendar');
    }
  } catch (error) {
    console.error('Error deleting blocked time from Google Calendar:', error);
  }
};

// Update blocked time
export const updateBlockedTime = async (
  id: string,
  updates: Partial<Omit<BlockedTime, 'id'>>
): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('blocked_times')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating blocked time:', error);
    return { error };
  }

  return { error: null };
};

// Delete blocked time
export const deleteBlockedTime = async (id: string): Promise<{ error: Error | null }> => {
  // First fetch the blocked time to get google_event_id
  const { data: blockedTime } = await supabase
    .from('blocked_times')
    .select('*')
    .eq('id', id)
    .single();

  if (blockedTime) {
    await deleteBlockedTimeGoogleEvent(blockedTime as BlockedTime);
  }

  const { error } = await supabase
    .from('blocked_times')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blocked time:', error);
    return { error };
  }

  return { error: null };
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
  professionalId: string,
  clinicId?: string
): Promise<TimeSlot[]> => {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
  console.log(`[generateTimeSlots] Generating slots for date: ${dateStr}, professional: ${professionalId}`);
  
  // Fetch professional data to get duration
  const { data: professional } = await supabase
    .from('professionals')
    .select('duration')
    .eq('id', professionalId)
    .single();

  const duration = professional?.duration || 30;
  console.log(`[generateTimeSlots] Professional duration: ${duration} minutes`);
  
  // Fetch existing appointments, blocked times, and Google Calendar busy times
  const [appointments, blockedTimes, googleBusyTimes] = await Promise.all([
    fetchAppointmentsByProfessionalAndDate(professionalId, dateStr),
    fetchBlockedTimes(professionalId, dateStr),
    clinicId ? getGoogleCalendarBusyTimes(clinicId, dateStr, professionalId) : Promise.resolve([]),
  ]);

  console.log(`[generateTimeSlots] Appointments found:`, appointments.map(a => ({ time: a.time, patient: a.patient_name })));
  console.log(`[generateTimeSlots] Blocked times:`, blockedTimes.map(b => ({ start: b.start_time, end: b.end_time })));
  console.log(`[generateTimeSlots] Google busy times:`, googleBusyTimes);

  // Create a map of booked time ranges (considering appointment duration)
  const bookedRanges: { start: number; end: number }[] = appointments.map(apt => {
    const [h, m] = apt.time.split(':').map(Number);
    const startMinutes = h * 60 + m;
    return { start: startMinutes, end: startMinutes + duration };
  });
  
  console.log(`[generateTimeSlots] Booked ranges (minutes):`, bookedRanges);
  
  const slots: TimeSlot[] = [];
  const startHour = 8;
  const endHour = 18;
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  // Generate slots based on professional's duration
  for (let minutes = startHour * 60; minutes + duration <= endHour * 60; minutes += duration) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const slotEnd = minutes + duration;
    
    // Check if time is in the past (for today)
    const isPast = isToday && (hour < now.getHours() || (hour === now.getHours() && minute <= now.getMinutes()));
    
    // Check if this slot overlaps with any booked appointment
    const isBooked = bookedRanges.some(range => 
      (minutes < range.end && slotEnd > range.start)
    );
    
    // Check if time is blocked in system
    const isBlocked = blockedTimes.some(bt => {
      const [sh, sm] = bt.start_time.split(':').map(Number);
      const [eh, em] = bt.end_time.split(':').map(Number);
      const blockStart = sh * 60 + sm;
      const blockEnd = eh * 60 + em;
      return (minutes < blockEnd && slotEnd > blockStart);
    });

    // Check if time is busy in Google Calendar
    const isBusyInGoogle = googleBusyTimes.some(bt => {
      const [sh, sm] = bt.start.split(':').map(Number);
      const [eh, em] = bt.end.split(':').map(Number);
      const busyStart = sh * 60 + sm;
      const busyEnd = eh * 60 + em;
      return (minutes < busyEnd && slotEnd > busyStart);
    });

    const available = !isPast && !isBooked && !isBlocked && !isBusyInGoogle;
    
    if (!available) {
      console.log(`[generateTimeSlots] Slot ${time} unavailable - isPast: ${isPast}, isBooked: ${isBooked}, isBlocked: ${isBlocked}, isBusyInGoogle: ${isBusyInGoogle}`);
    }

    slots.push({
      id: `${dateStr}-${time}-${professionalId}`,
      time,
      available,
    });
  }

  console.log(`[generateTimeSlots] Generated ${slots.length} slots, ${slots.filter(s => s.available).length} available`);

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
  date: string,
  professionalId?: string
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
          professionalId,
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

// Get Google Calendar busy times for all professionals in a clinic
export const getGoogleCalendarBusyTimesForClinic = async (
  clinicId: string,
  date: string,
  professionals: Professional[]
): Promise<{ professionalId: string; professionalName: string; busyTimes: { start: string; end: string; summary?: string }[] }[]> => {
  try {
    const results = await Promise.all(
      professionals.map(async (prof) => {
        const busyTimes = await getGoogleCalendarBusyTimes(clinicId, date, prof.id);
        return {
          professionalId: prof.id,
          professionalName: prof.name,
          busyTimes,
        };
      })
    );
    return results.filter(r => r.busyTimes.length > 0);
  } catch (error) {
    console.error('Error fetching Google Calendar busy times for clinic:', error);
    return [];
  }
};

// Delete event from Google Calendar
export const deleteGoogleCalendarEvent = async (appointment: {
  clinic_id: string;
  professional_id: string;
  google_event_id: string | null;
}) => {
  if (!appointment.google_event_id) return;
  
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-sync`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-event',
          clinicId: appointment.clinic_id,
          appointment: {
            professional_id: appointment.professional_id,
            google_event_id: appointment.google_event_id,
          },
        }),
      }
    );

    if (!response.ok) {
      console.log('Google Calendar event deletion skipped (not connected)');
    } else {
      console.log('Google Calendar event deleted successfully');
    }
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
  }
};

// Update appointment status
export const updateAppointmentStatus = async (
  id: string, 
  status: string
): Promise<{ error: Error | null }> => {
  // If cancelling, first fetch the appointment to get google_event_id
  if (status === 'cancelled') {
    const { data: appointment } = await supabase
      .from('appointments')
      .select('clinic_id, professional_id, google_event_id')
      .eq('id', id)
      .single();
    
    if (appointment) {
      await deleteGoogleCalendarEvent(appointment);
    }
  }

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

// ========== PROFESSIONAL SHIFTS ==========

// Fetch shifts by professional
export const fetchShiftsByProfessional = async (professionalId: string): Promise<ProfessionalShift[]> => {
  const { data, error } = await supabase
    .from('professional_shifts')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('is_active', true)
    .order('day_of_week')
    .order('shift_name');

  if (error) {
    console.error('Error fetching shifts:', error);
    return [];
  }

  return data || [];
};

// Fetch shifts for a specific date
export const fetchShiftsForDate = async (professionalId: string, date: Date): Promise<ProfessionalShift[]> => {
  const dayOfWeek = date.getDay();
  
  const { data, error } = await supabase
    .from('professional_shifts')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching shifts for date:', error);
    return [];
  }

  return data || [];
};

// Create shift
export const createShift = async (
  shift: Omit<ProfessionalShift, 'id' | 'is_active'>
): Promise<{ data: ProfessionalShift | null; error: Error | null }> => {
  const { data, error } = await supabase
    .from('professional_shifts')
    .insert({ ...shift, is_active: true })
    .select()
    .single();

  if (error) {
    console.error('Error creating shift:', error);
    return { data: null, error };
  }

  return { data, error: null };
};

// Update shift
export const updateShift = async (
  id: string,
  updates: Partial<Omit<ProfessionalShift, 'id' | 'professional_id'>>
): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('professional_shifts')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating shift:', error);
    return { error };
  }

  return { error: null };
};

// Delete shift
export const deleteShift = async (id: string): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('professional_shifts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting shift:', error);
    return { error };
  }

  return { error: null };
};

// Get available slots count for a shift on a specific date
export const getAvailableSlotsForShift = async (
  professionalId: string,
  date: string,
  shiftName: string
): Promise<{ available: number; total: number }> => {
  // Get shift config
  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();
  
  const { data: shift } = await supabase
    .from('professional_shifts')
    .select('max_slots')
    .eq('professional_id', professionalId)
    .eq('day_of_week', dayOfWeek)
    .eq('shift_name', shiftName)
    .eq('is_active', true)
    .maybeSingle();

  if (!shift) {
    return { available: 0, total: 0 };
  }

  // Count booked appointments for this shift
  const { count } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('professional_id', professionalId)
    .eq('date', date)
    .eq('shift_name', shiftName)
    .neq('status', 'cancelled');

  const booked = count || 0;
  return { 
    available: Math.max(0, shift.max_slots - booked), 
    total: shift.max_slots 
  };
};

// Create appointment for arrival order mode (no queue position yet - assigned when patient arrives)
export const createAppointmentWithQueue = async (
  appointment: Omit<Appointment, 'id' | 'created_at' | 'status' | 'notes' | 'professional' | 'time'> & { shift_name: string }
): Promise<{ data: Appointment | null; error: Error | null }> => {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...appointment,
      time: '00:00', // Placeholder for arrival order mode
      status: 'scheduled', // Scheduled but not arrived yet
      queue_position: null, // Position assigned when patient arrives
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating appointment:', error);
    return { data: null, error };
  }

  return { data, error: null };
};

// Mark patient as arrived and assign queue position
export const markPatientArrived = async (
  appointmentId: string
): Promise<{ data: Appointment | null; error: Error | null; queuePosition?: number }> => {
  // First get the appointment details
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single();

  if (fetchError || !appointment) {
    console.error('Error fetching appointment:', fetchError);
    return { data: null, error: fetchError };
  }

  // Get current max queue position for this shift
  const { data: maxPositionData } = await supabase
    .from('appointments')
    .select('queue_position')
    .eq('professional_id', appointment.professional_id)
    .eq('date', appointment.date)
    .eq('shift_name', appointment.shift_name)
    .not('queue_position', 'is', null)
    .order('queue_position', { ascending: false })
    .limit(1);

  const maxPosition = maxPositionData?.[0]?.queue_position || 0;
  const newPosition = maxPosition + 1;

  // Update appointment with queue position and status
  const { data, error } = await supabase
    .from('appointments')
    .update({
      queue_position: newPosition,
      status: 'confirmed', // Now confirmed/arrived
    })
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) {
    console.error('Error marking patient arrived:', error);
    return { data: null, error };
  }

  return { data, error: null, queuePosition: newPosition };
};

// Fetch queue for a specific date and shift
export const fetchQueueByDateAndShift = async (
  professionalId: string,
  date: string,
  shiftName: string
): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      professional:professionals(*)
    `)
    .eq('professional_id', professionalId)
    .eq('date', date)
    .eq('shift_name', shiftName)
    .neq('status', 'cancelled')
    .order('queue_position', { ascending: true });

  if (error) {
    console.error('Error fetching queue:', error);
    return [];
  }

  return data || [];
};

// Fetch queue for clinic (all professionals)
export const fetchClinicQueue = async (
  clinicId: string,
  date: string
): Promise<{ professional: Professional; shifts: { shiftName: string; appointments: Appointment[] }[] }[]> => {
  // Get all professionals with arrival_order mode
  const { data: professionals } = await supabase
    .from('professionals')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('scheduling_mode', 'arrival_order')
    .eq('is_active', true);

  if (!professionals?.length) {
    return [];
  }

  const result = await Promise.all(
    professionals.map(async (prof) => {
      // Get shifts for this day
      const dateObj = new Date(date + 'T00:00:00');
      const dayOfWeek = dateObj.getDay();
      
      const { data: shifts } = await supabase
        .from('professional_shifts')
        .select('*')
        .eq('professional_id', prof.id)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true);

      const shiftsWithQueue = await Promise.all(
        (shifts || []).map(async (shift) => {
          const appointments = await fetchQueueByDateAndShift(prof.id, date, shift.shift_name);
          return {
            shiftName: shift.shift_name,
            appointments,
          };
        })
      );

      return {
        professional: prof as Professional,
        shifts: shiftsWithQueue,
      };
    })
  );

  return result;
};
