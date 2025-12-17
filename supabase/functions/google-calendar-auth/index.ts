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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'authorize') {
      // Generate OAuth URL for Google Calendar
      const { clinicId, redirectUri } = await req.json();
      
      const scopes = [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly'
      ].join(' ');

      const state = JSON.stringify({ clinicId, redirectUri });
      const encodedState = btoa(state);

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID!);
      authUrl.searchParams.set('redirect_uri', `${SUPABASE_URL}/functions/v1/google-calendar-auth?action=callback`);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', scopes);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', encodedState);

      return new Response(JSON.stringify({ authUrl: authUrl.toString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'callback') {
      // Handle OAuth callback
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        const { redirectUri } = state ? JSON.parse(atob(state)) : { redirectUri: '' };
        return new Response(`
          <html>
            <body>
              <p>Erro na autenticação. Redirecionando...</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'google-calendar-error', error: '${error}' }, '*');
                  window.close();
                } else {
                  window.location.href = '${redirectUri}/painel?google_calendar=error&message=${encodeURIComponent(error)}';
                }
              </script>
            </body>
          </html>
        `, { headers: { 'Content-Type': 'text/html' } });
      }

      if (!code || !state) {
        return new Response('Missing code or state', { status: 400 });
      }

      const { clinicId, redirectUri } = JSON.parse(atob(state));

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID!,
          client_secret: GOOGLE_CLIENT_SECRET!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${SUPABASE_URL}/functions/v1/google-calendar-auth?action=callback`,
        }),
      });

      const tokens = await tokenResponse.json();

      if (tokens.error) {
        console.error('Token error:', tokens);
        return new Response(`
          <html>
            <body>
              <script>
                window.opener.postMessage({ type: 'google-calendar-error', error: '${tokens.error_description || tokens.error}' }, '*');
                window.close();
              </script>
            </body>
          </html>
        `, { headers: { 'Content-Type': 'text/html' } });
      }

      // Store tokens in database
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

      const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

      const { error: dbError } = await supabase
        .from('google_calendar_tokens')
        .upsert({
          clinic_id: clinicId,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: tokenExpiry.toISOString(),
        }, { onConflict: 'clinic_id' });

      if (dbError) {
        console.error('Database error:', dbError);
        return new Response(`
          <html>
            <body>
              <script>
                window.opener.postMessage({ type: 'google-calendar-error', error: 'Failed to save tokens' }, '*');
                window.close();
              </script>
            </body>
          </html>
        `, { headers: { 'Content-Type': 'text/html' } });
      }

      // Success - try popup message first, then redirect
      return new Response(`
        <html>
          <body>
            <p>Conectado com sucesso! Redirecionando...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'google-calendar-success' }, '*');
                window.close();
              } else {
                // Direct redirect case - redirect back to app
                window.location.href = '${redirectUri}/painel?google_calendar=success';
              }
            </script>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    if (action === 'disconnect') {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { clinicId } = await req.json();
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

      const { error } = await supabase
        .from('google_calendar_tokens')
        .delete()
        .eq('clinic_id', clinicId);

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to disconnect' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'status') {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { clinicId } = await req.json();
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

      const { data, error } = await supabase
        .from('google_calendar_tokens')
        .select('id, created_at')
        .eq('clinic_id', clinicId)
        .single();

      return new Response(JSON.stringify({ 
        connected: !!data && !error,
        connectedAt: data?.created_at 
      }), {
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
