-- Migration to add due_date to reminders table
ALTER TABLE public.reminders ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;
