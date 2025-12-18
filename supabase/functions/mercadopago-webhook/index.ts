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

    const body = await req.json();
    console.log('[mercadopago-webhook] Received webhook:', JSON.stringify(body));

    const { action, data, type } = body;

    // Handle subscription events
    if (type === 'subscription_preapproval' || type === 'subscription_authorized_payment') {
      const subscriptionId = data?.id;
      
      if (!subscriptionId) {
        console.log('[mercadopago-webhook] No subscription ID in webhook');
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch subscription details from Mercado Pago
      const mpResponse = await fetch(
        `https://api.mercadopago.com/preapproval/${subscriptionId}`,
        {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')}`,
          },
        }
      );

      if (!mpResponse.ok) {
        console.error('[mercadopago-webhook] Failed to fetch subscription from MP');
        return new Response(JSON.stringify({ error: 'Failed to fetch subscription' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const mpSubscription = await mpResponse.json();
      console.log('[mercadopago-webhook] MP Subscription:', JSON.stringify(mpSubscription));

      const externalReference = mpSubscription.external_reference;
      if (!externalReference) {
        console.log('[mercadopago-webhook] No external_reference in subscription');
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Map MP status to our status
      let status: 'trial' | 'active' | 'cancelled' | 'expired' | 'pending' = 'pending';
      if (mpSubscription.status === 'authorized') {
        status = 'active';
      } else if (mpSubscription.status === 'cancelled') {
        status = 'cancelled';
      } else if (mpSubscription.status === 'paused') {
        status = 'expired';
      }

      // Update subscription in database
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status,
          mercadopago_subscription_id: subscriptionId,
          mercadopago_customer_id: mpSubscription.payer_id,
          current_period_start: mpSubscription.date_created,
          current_period_end: mpSubscription.next_payment_date,
        })
        .eq('clinic_id', externalReference);

      if (updateError) {
        console.error('[mercadopago-webhook] Error updating subscription:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update subscription' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('[mercadopago-webhook] Subscription updated successfully');
    }

    // Handle payment events
    if (type === 'payment') {
      const paymentId = data?.id;
      
      if (paymentId) {
        // Fetch payment details
        const paymentResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            headers: {
              'Authorization': `Bearer ${Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')}`,
            },
          }
        );

        if (paymentResponse.ok) {
          const payment = await paymentResponse.json();
          console.log('[mercadopago-webhook] Payment:', JSON.stringify(payment));

          if (payment.status === 'approved' && payment.external_reference) {
            // Activate subscription
            const { error } = await supabase
              .from('subscriptions')
              .update({
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              })
              .eq('clinic_id', payment.external_reference);

            if (error) {
              console.error('[mercadopago-webhook] Error activating subscription:', error);
            } else {
              console.log('[mercadopago-webhook] Subscription activated via payment');
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[mercadopago-webhook] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});