-- Add work schedule and booking limits to professionals
ALTER TABLE public.professionals
ADD COLUMN work_start_time time without time zone DEFAULT '08:00'::time,
ADD COLUMN work_end_time time without time zone DEFAULT '18:00'::time,
ADD COLUMN has_lunch_break boolean DEFAULT false,
ADD COLUMN lunch_start_time time without time zone DEFAULT '12:00'::time,
ADD COLUMN lunch_end_time time without time zone DEFAULT '13:00'::time,
ADD COLUMN max_advance_days integer DEFAULT 365;

COMMENT ON COLUMN public.professionals.work_start_time IS 'Hora de início do expediente';
COMMENT ON COLUMN public.professionals.work_end_time IS 'Hora de fim do expediente';
COMMENT ON COLUMN public.professionals.has_lunch_break IS 'Se o profissional tem intervalo de almoço';
COMMENT ON COLUMN public.professionals.lunch_start_time IS 'Hora de início do almoço';
COMMENT ON COLUMN public.professionals.lunch_end_time IS 'Hora de fim do almoço';
COMMENT ON COLUMN public.professionals.max_advance_days IS 'Máximo de dias de antecedência para agendamento (365 = 1 ano)';