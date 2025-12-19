-- Add weekend work columns to professionals table
ALTER TABLE public.professionals 
ADD COLUMN works_saturday boolean NOT NULL DEFAULT false,
ADD COLUMN saturday_start_time time without time zone DEFAULT '08:00:00',
ADD COLUMN saturday_end_time time without time zone DEFAULT '12:00:00',
ADD COLUMN works_sunday boolean NOT NULL DEFAULT false,
ADD COLUMN sunday_start_time time without time zone DEFAULT '08:00:00',
ADD COLUMN sunday_end_time time without time zone DEFAULT '12:00:00';