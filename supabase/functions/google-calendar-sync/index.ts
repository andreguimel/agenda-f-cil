import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const tokens = await response.json();
  if (tokens.error) {
    throw new Error(`Token refresh failed: ${tokens.error_description || tokens.error}`);
  }

  return tokens;
}

async function getValidAccessToken(supabase: any, clinicId: string): Promise<string | null> {
  const { data: tokenData, error } = await supabase
    .from('google_calendar_tokens')
    .select('*')
    .eq('clinic_id', clinicId)
    .single();

  if (error || !tokenData) {
    console.log('No token found for clinic:', clinicId);
    return null;
  }

  const tokenExpiry = new Date(tokenData.token_expiry);
  const now = new Date();

  // Refresh if token expires in less than 5 minutes
  if (tokenExpiry.getTime() - now.getTime() < 5 * 60 * 1000) {
    console.log('Token expired or expiring soon, refreshing...');
    const newTokens = await refreshAccessToken(tokenData.refresh_token);
    
    const newExpiry = new Date(Date.now() + newTokens.expires_in * 1000);
    
    await supabase
      .from('google_calendar_tokens')
      .update({
        access_token: newTokens.access_token,
        token_expiry: newExpiry.toISOString(),
      })
      .eq('clinic_id', clinicId);

    return newTokens.access_token;
  }

  return tokenData.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { action, clinicId, appointment, date, professionalId, professional: professionalData } = await req.json();

    const accessToken = await getValidAccessToken(supabase, clinicId);
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Google Calendar not connected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create calendar for a professional
    if (action === 'create-calendar') {
      if (!professionalData || !professionalData.id) {
        return new Response(JSON.stringify({ error: 'Professional data required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Creating new calendar for professional: ${professionalData.name}`);
      
      const createCalendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: professionalData.name,
          description: `Agenda de ${professionalData.name} - ${professionalData.specialty}`,
          timeZone: 'America/Sao_Paulo',
        }),
      });

      const newCalendar = await createCalendarResponse.json();

      if (newCalendar.error) {
        console.error('Error creating calendar:', newCalendar.error);
        return new Response(JSON.stringify({ error: newCalendar.error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Created calendar with ID: ${newCalendar.id}`);

      // Save the calendar ID to the professional record
      await supabase
        .from('professionals')
        .update({ google_calendar_id: newCalendar.id })
        .eq('id', professionalData.id);

      return new Response(JSON.stringify({ success: true, calendarId: newCalendar.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'create-event') {
      // Create event in Google Calendar
      const { data: professional } = await supabase
        .from('professionals')
        .select('name, specialty, duration, google_calendar_id')
        .eq('id', appointment.professional_id)
        .single();

      if (!professional) {
        return new Response(JSON.stringify({ error: 'Professional not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Use professional's calendar or fallback to primary
      const calendarId = professional.google_calendar_id || 'primary';

      // Format time properly - appointment.time might be "08:00" or "08:00:00"
      const timeStr = appointment.time.substring(0, 5); // Get "HH:MM"
      const duration = professional.duration || 30;
      
      // Parse hours and minutes
      const [hours, minutes] = timeStr.split(':').map(Number);
      const endMinutes = hours * 60 + minutes + duration;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTimeStr = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

      const event = {
        summary: `Consulta: ${appointment.patient_name}`,
        description: `Paciente: ${appointment.patient_name}\nTelefone: ${appointment.patient_phone}\nEmail: ${appointment.patient_email}\n${appointment.notes ? `Observações: ${appointment.notes}` : ''}`,
        start: {
          dateTime: `${appointment.date}T${timeStr}:00`,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: `${appointment.date}T${endTimeStr}:00`,
          timeZone: 'America/Sao_Paulo',
        },
      };

      console.log(`Creating event in calendar ${calendarId}:`, JSON.stringify(event, null, 2));

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      const createdEvent = await response.json();

      if (createdEvent.error) {
        console.error('Google Calendar error:', createdEvent.error);
        return new Response(JSON.stringify({ error: createdEvent.error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update appointment with Google event ID
      await supabase
        .from('appointments')
        .update({ google_event_id: createdEvent.id })
        .eq('id', appointment.id);

      return new Response(JSON.stringify({ success: true, eventId: createdEvent.id, calendarId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete-event') {
      if (!appointment.google_event_id) {
        return new Response(JSON.stringify({ success: true, message: 'No event to delete' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get the professional's calendar ID
      const { data: professional } = await supabase
        .from('professionals')
        .select('google_calendar_id')
        .eq('id', appointment.professional_id)
        .single();

      const calendarId = professional?.google_calendar_id || 'primary';

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${appointment.google_event_id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok && response.status !== 404) {
        const error = await response.json();
        console.error('Google Calendar delete error:', error);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get-busy-times') {
      // Fetch busy times from Google Calendar for a specific date and professional
      let calendarId = 'primary';
      
      // If professionalId is provided, get their specific calendar
      if (professionalId) {
        const { data: professional } = await supabase
          .from('professionals')
          .select('google_calendar_id')
          .eq('id', professionalId)
          .single();
        
        if (professional?.google_calendar_id) {
          calendarId = professional.google_calendar_id;
        }
      }

      // Use local date format to avoid timezone issues
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?` +
        `timeMin=${date}T00:00:00-03:00&timeMax=${date}T23:59:59-03:00&singleEvents=true&timeZone=America/Sao_Paulo`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.error) {
        console.error('Google Calendar error:', data.error);
        return new Response(JSON.stringify({ error: data.error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Extract time directly from dateTime string to avoid timezone conversion issues
      // Google returns dateTime like "2025-12-17T12:00:00-03:00" - we extract "12:00" directly
      const extractTimeFromDateTime = (dateTime: string): string => {
        // Handle format: "2025-12-17T12:00:00-03:00" or "2025-12-17T12:00:00"
        const match = dateTime.match(/T(\d{2}:\d{2})/);
        return match ? match[1] : '00:00';
      };

      console.log(`[get-busy-times] Date: ${date}, CalendarId: ${calendarId}`);
      console.log(`[get-busy-times] Raw events from Google:`, JSON.stringify(data.items?.map((e: any) => ({
        summary: e.summary,
        start: e.start?.dateTime,
        end: e.end?.dateTime
      })) || [], null, 2));

      const busyTimes = (data.items || [])
        .filter((event: any) => event.start?.dateTime && event.end?.dateTime)
        .map((event: any) => ({
          start: extractTimeFromDateTime(event.start.dateTime),
          end: extractTimeFromDateTime(event.end.dateTime),
          summary: event.summary,
        }));

      console.log(`[get-busy-times] Processed busy times:`, JSON.stringify(busyTimes, null, 2));

      return new Response(JSON.stringify({ busyTimes }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
