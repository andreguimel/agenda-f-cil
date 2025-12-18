import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { clinicId, email, backUrl } = await req.json();
    console.log('[mercadopago-create-subscription] Creating subscription for clinic:', clinicId);

    if (!clinicId || !email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get clinic info
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('name')
      .eq('id', clinicId)
      .single();

    if (clinicError) {
      console.error('[mercadopago-create-subscription] Clinic not found:', clinicError);
      return new Response(JSON.stringify({ error: 'Clinic not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Mercado Pago subscription (preapproval)
    const mpResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: `Assinatura Agendaberta - ${clinic.name}`,
        external_reference: clinicId,
        payer_email: email,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 149,
          currency_id: 'BRL',
        },
        back_url: backUrl || `${req.headers.get('origin')}/painel`,
        status: 'pending',
      }),
    });

    if (!mpResponse.ok) {
      const mpError = await mpResponse.text();
      console.error('[mercadopago-create-subscription] MP error:', mpError);
      return new Response(JSON.stringify({ error: 'Failed to create subscription in Mercado Pago' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const mpSubscription = await mpResponse.json();
    console.log('[mercadopago-create-subscription] MP Subscription created:', mpSubscription.id);

    // Update subscription in database with pending status
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'pending',
        mercadopago_subscription_id: mpSubscription.id,
      })
      .eq('clinic_id', clinicId);

    if (updateError) {
      console.error('[mercadopago-create-subscription] Error updating subscription:', updateError);
    }

    return new Response(JSON.stringify({
      success: true,
      init_point: mpSubscription.init_point,
      subscription_id: mpSubscription.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[mercadopago-create-subscription] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});