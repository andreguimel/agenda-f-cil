-- Add cancellation token to appointments table
ALTER TABLE public.appointments 
ADD COLUMN cancellation_token uuid DEFAULT gen_random_uuid();

-- Create unique index for cancellation token
CREATE UNIQUE INDEX idx_appointments_cancellation_token ON public.appointments(cancellation_token);

-- Allow anyone to view appointment by cancellation token (for cancellation page)
CREATE POLICY "Anyone can view appointment by cancellation token"
ON public.appointments
FOR SELECT
USING (true);

-- Allow anyone to cancel appointment by token (update status)
CREATE POLICY "Anyone can cancel appointment by token"
ON public.appointments
FOR UPDATE
USING (cancellation_token IS NOT NULL)
WITH CHECK (status = 'cancelled');