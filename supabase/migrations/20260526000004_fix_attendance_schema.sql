-- Add missing columns to attendance table
-- 'notes' is used for izin/sakit reason
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS notes TEXT;

-- Make qr_token nullable since izin/sakit doesn't have one
ALTER TABLE public.attendance ALTER COLUMN qr_token DROP NOT NULL;

-- Make latitude/longitude/accuracy nullable since izin/sakit doesn't have GPS
ALTER TABLE public.attendance ALTER COLUMN latitude DROP NOT NULL;
ALTER TABLE public.attendance ALTER COLUMN longitude DROP NOT NULL;
ALTER TABLE public.attendance ALTER COLUMN accuracy DROP NOT NULL;
