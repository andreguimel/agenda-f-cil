-- Add google_calendar_id column to professionals table
ALTER TABLE public.professionals 
ADD COLUMN google_calendar_id text;

-- Add comment explaining the column
COMMENT ON COLUMN public.professionals.google_calendar_id IS 'Google Calendar ID for this professional - created automatically when first appointment is synced';