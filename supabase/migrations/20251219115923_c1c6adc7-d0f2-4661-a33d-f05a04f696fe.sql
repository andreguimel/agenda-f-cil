-- Update handle_new_user to create a clinic for each new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_clinic_id uuid;
  clinic_slug text;
BEGIN
  -- Generate a unique slug for the clinic
  clinic_slug := 'clinica-' || substr(NEW.id::text, 1, 8);
  
  -- Create a new clinic for this user
  INSERT INTO public.clinics (name, slug, email)
  VALUES (
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Minha Clínica'),
    clinic_slug,
    NEW.email
  )
  RETURNING id INTO new_clinic_id;
  
  -- Create the user profile with the clinic_id
  INSERT INTO public.profiles (user_id, email, full_name, clinic_id, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    new_clinic_id,
    'admin'
  );
  
  RETURN NEW;
END;
$$;

-- Add INSERT policy for clinics (for the trigger)
DROP POLICY IF EXISTS "System can create clinics" ON public.clinics;
CREATE POLICY "System can create clinics" 
ON public.clinics 
FOR INSERT 
WITH CHECK (true);

-- Make sure staff can view their own clinic professionals (including inactive for management)
DROP POLICY IF EXISTS "Staff can view all their clinic professionals" ON public.professionals;
CREATE POLICY "Staff can view all their clinic professionals"
ON public.professionals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.clinic_id = professionals.clinic_id
  )
);