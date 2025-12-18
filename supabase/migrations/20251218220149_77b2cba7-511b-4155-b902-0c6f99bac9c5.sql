-- Add operating hours columns to clinics table
ALTER TABLE public.clinics 
ADD COLUMN opening_time time without time zone DEFAULT '08:00:00',
ADD COLUMN closing_time time without time zone DEFAULT '18:00:00';