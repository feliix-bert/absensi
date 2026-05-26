-- 1. Profiles Table Updates
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS durasi_magang;

ALTER TABLE public.profiles 
  ADD COLUMN mulai_magang DATE DEFAULT CURRENT_DATE NOT NULL;

ALTER TABLE public.profiles 
  ADD COLUMN selesai_magang DATE DEFAULT CURRENT_DATE + interval '90 days' NOT NULL;

-- 2. Update trigger to include new fields (divisi removed)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $func$
DECLARE
    def_office UUID;
BEGIN
    SELECT id INTO def_office FROM public.offices WHERE nama LIKE '%WITEL SUMSEL BABEL%' LIMIT 1;
    IF def_office IS NULL THEN
        SELECT id INTO def_office FROM public.offices LIMIT 1;
    END IF;

    INSERT INTO public.profiles (id, nama, nim, pembimbing, mulai_magang, selesai_magang, lokasi_kantor)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'nama',
        new.raw_user_meta_data->>'nim',
        new.raw_user_meta_data->>'pembimbing',
        COALESCE((new.raw_user_meta_data->>'mulai_magang')::DATE, CURRENT_DATE),
        COALESCE((new.raw_user_meta_data->>'selesai_magang')::DATE, CURRENT_DATE + interval '90 days'),
        def_office
    );
    RETURN new;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Reminders Table
CREATE TABLE public.reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR NOT NULL,
    is_completed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reminders"
    ON public.reminders FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Notifications Table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR NOT NULL, -- e.g., 'attendance', 'system', 'reminder'
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications"
    ON public.notifications FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Auto-notification Trigger for Attendance
CREATE OR REPLACE FUNCTION public.handle_attendance_notification()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      'Absen Masuk Berhasil',
      'Anda telah berhasil absen masuk pada ' || to_char(NEW.check_in AT TIME ZONE 'Asia/Jakarta', 'HH24:MI'),
      'attendance'
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.check_out IS NULL AND NEW.check_out IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      'Absen Keluar Berhasil',
      'Anda telah berhasil absen keluar pada ' || to_char(NEW.check_out AT TIME ZONE 'Asia/Jakarta', 'HH24:MI'),
      'attendance'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_attendance_change
  AFTER INSERT OR UPDATE ON public.attendance
  FOR EACH ROW EXECUTE PROCEDURE public.handle_attendance_notification();
