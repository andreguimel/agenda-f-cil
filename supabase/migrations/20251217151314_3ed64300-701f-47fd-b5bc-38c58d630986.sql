-- Add scheduling mode to professionals
ALTER TABLE public.professionals 
ADD COLUMN scheduling_mode text NOT NULL DEFAULT 'time_slots',
ADD COLUMN show_queue_position boolean NOT NULL DEFAULT false;

-- Create table for professional shifts (for arrival order mode)
CREATE TABLE public.professional_shifts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
  shift_name text NOT NULL, -- 'morning', 'afternoon', 'evening'
  start_time time NOT NULL,
  end_time time NOT NULL,
  max_slots integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(professional_id, day_of_week, shift_name)
);

-- Enable RLS
ALTER TABLE public.professional_shifts ENABLE ROW LEVEL SECURITY;

-- Anyone can view active shifts (for public booking)
CREATE POLICY "Anyone can view active shifts"
ON public.professional_shifts
FOR SELECT
USING (is_active = true);

-- Staff can manage shifts
CREATE POLICY "Staff can manage shifts"
ON public.professional_shifts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN professionals prof ON prof.clinic_id = p.clinic_id
    WHERE p.user_id = auth.uid() AND prof.id = professional_shifts.professional_id
  )
);

-- Add queue_position to appointments for arrival order tracking
ALTER TABLE public.appointments
ADD COLUMN queue_position integer,
ADD COLUMN shift_name text;

-- Create trigger for updated_at
CREATE TRIGGER update_professional_shifts_updated_at
BEFORE UPDATE ON public.professional_shifts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();