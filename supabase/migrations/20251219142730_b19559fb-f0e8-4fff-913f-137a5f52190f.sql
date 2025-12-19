-- Create patients table
CREATE TABLE public.patients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, phone)
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Add patient_id to appointments for linking
ALTER TABLE public.appointments ADD COLUMN patient_id uuid REFERENCES public.patients(id);

-- RLS policies for patients
CREATE POLICY "Staff can view clinic patients" ON public.patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid() AND profiles.clinic_id = patients.clinic_id
    )
  );

CREATE POLICY "Staff can manage clinic patients" ON public.patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid() AND profiles.clinic_id = patients.clinic_id
    )
  );

CREATE POLICY "Anyone can create patients" ON public.patients
  FOR INSERT WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get or create patient
CREATE OR REPLACE FUNCTION public.upsert_patient(
  p_clinic_id uuid,
  p_name text,
  p_email text,
  p_phone text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  patient_id uuid;
BEGIN
  -- Try to find existing patient by phone
  SELECT id INTO patient_id
  FROM patients
  WHERE clinic_id = p_clinic_id AND phone = p_phone;
  
  IF patient_id IS NULL THEN
    -- Create new patient
    INSERT INTO patients (clinic_id, name, email, phone)
    VALUES (p_clinic_id, p_name, p_email, p_phone)
    RETURNING id INTO patient_id;
  ELSE
    -- Update existing patient name/email if provided
    UPDATE patients
    SET name = COALESCE(NULLIF(p_name, ''), name),
        email = COALESCE(NULLIF(p_email, ''), email),
        updated_at = now()
    WHERE id = patient_id;
  END IF;
  
  RETURN patient_id;
END;
$$;