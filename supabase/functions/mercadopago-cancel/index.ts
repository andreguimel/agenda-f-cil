import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { clinicId, reason, feedback } = await req.json();
    console.log('[mercadopago-cancel] Cancelling subscription for clinic:', clinicId);

    if (!clinicId) {
      return new Response(JSON.stringify({ error: 'Missing clinicId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('clinic_id', clinicId)
      .single();

    if (subError || !subscription) {
      console.error('[mercadopago-cancel] Subscription not found:', subError);
      return new Response(JSON.stringify({ error: 'Subscription not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Cancel in Mercado Pago if there's an active subscription
    if (subscription.mercadopago_subscription_id) {
      const mpResponse = await fetch(
        `https://api.mercadopago.com/preapproval/${subscription.mercadopago_subscription_id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'cancelled' }),
        }
      );

      if (!mpResponse.ok) {
        const mpError = await mpResponse.text();
        console.error('[mercadopago-cancel] MP error:', mpError);
        // Continue anyway to update local status
      } else {
        console.log('[mercadopago-cancel] MP subscription cancelled');
      }
    }

    // Update subscription status
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('clinic_id', clinicId);

    if (updateError) {
      console.error('[mercadopago-cancel] Error updating subscription:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update subscription' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Store cancellation feedback
    if (reason || feedback) {
      const { error: feedbackError } = await supabase
        .from('cancellation_feedback')
        .insert({
          clinic_id: clinicId,
          reason,
          feedback,
        });

      if (feedbackError) {
        console.error('[mercadopago-cancel] Error storing feedback:', feedbackError);
        // Don't fail the request for feedback error
      }
    }

    console.log('[mercadopago-cancel] Subscription cancelled successfully');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[mercadopago-cancel] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});