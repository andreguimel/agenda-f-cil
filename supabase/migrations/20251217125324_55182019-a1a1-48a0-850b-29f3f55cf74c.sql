-- Add google_event_id column to blocked_times table
ALTER TABLE public.blocked_times ADD COLUMN IF NOT EXISTS google_event_id text;