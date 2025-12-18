-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('trial', 'active', 'cancelled', 'expired', 'pending');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  status subscription_status NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  mercadopago_subscription_id TEXT,
  mercadopago_customer_id TEXT,
  price_amount DECIMAL(10,2) NOT NULL DEFAULT 149.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clinic_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Staff can view their clinic subscription
CREATE POLICY "Staff can view their clinic subscription"
ON public.subscriptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.clinic_id = subscriptions.clinic_id
  )
);

-- Staff can update their clinic subscription
CREATE POLICY "Staff can update their clinic subscription"
ON public.subscriptions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.clinic_id = subscriptions.clinic_id
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create trial subscription when clinic is created
CREATE OR REPLACE FUNCTION public.handle_new_clinic_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (clinic_id, status, trial_ends_at)
  VALUES (NEW.id, 'trial', NOW() + INTERVAL '7 days');
  RETURN NEW;
END;
$$;

-- Create trigger for new clinics
CREATE TRIGGER on_clinic_created_subscription
AFTER INSERT ON public.clinics
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_clinic_subscription();

-- Create subscriptions for existing clinics
INSERT INTO public.subscriptions (clinic_id, status, trial_ends_at)
SELECT id, 'trial', NOW() + INTERVAL '7 days'
FROM public.clinics
WHERE id NOT IN (SELECT clinic_id FROM public.subscriptions);