-- Add shift display order column to professionals table
ALTER TABLE public.professionals 
ADD COLUMN shift_display_order text NOT NULL DEFAULT 'morning_first';

-- Add comment explaining the column
COMMENT ON COLUMN public.professionals.shift_display_order IS 'Order to display shifts: morning_first, afternoon_first, evening_first';