import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Subscription {
  id: string;
  clinic_id: string;
  status: 'trial' | 'active' | 'cancelled' | 'expired' | 'pending';
  trial_ends_at: string;
  current_period_start: string | null;
  current_period_end: string | null;
  mercadopago_subscription_id: string | null;
  price_amount: number;
}

export const useSubscription = (clinicId: string | null) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!clinicId) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('clinic_id', clinicId)
          .single();

        if (error) throw error;
        setSubscription(data as Subscription);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();

    // Subscribe to changes
    const channel = supabase
      .channel(`subscription-${clinicId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `clinic_id=eq.${clinicId}`,
        },
        (payload) => {
          console.log('Subscription updated:', payload);
          setSubscription(payload.new as Subscription);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinicId]);

  const isActive = () => {
    if (!subscription) return false;
    
    if (subscription.status === 'active') return true;
    
    if (subscription.status === 'trial') {
      const trialEnd = new Date(subscription.trial_ends_at);
      return trialEnd > new Date();
    }
    
    return false;
  };

  const isTrialExpired = () => {
    if (!subscription) return false;
    if (subscription.status !== 'trial') return false;
    
    const trialEnd = new Date(subscription.trial_ends_at);
    return trialEnd <= new Date();
  };

  const getDaysRemaining = () => {
    if (!subscription) return 0;
    
    let endDate: Date;
    
    if (subscription.status === 'trial') {
      endDate = new Date(subscription.trial_ends_at);
    } else if (subscription.status === 'active' && subscription.current_period_end) {
      endDate = new Date(subscription.current_period_end);
    } else {
      return 0;
    }
    
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const createCheckoutSession = async (email: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago-create-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            clinicId,
            email,
            backUrl: `${window.location.origin}/painel`,
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      return data;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      throw err;
    }
  };

  return {
    subscription,
    loading,
    error,
    isActive,
    isTrialExpired,
    getDaysRemaining,
    createCheckoutSession,
  };
};