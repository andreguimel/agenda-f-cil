-- Enable realtime for appointments table
ALTER TABLE appointments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;