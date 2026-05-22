DO $$
DECLARE
    def_office UUID;
BEGIN
    -- 1. Find the ID of the default office
    SELECT id INTO def_office FROM public.offices WHERE nama LIKE '%WITEL SUMSEL BABEL%' LIMIT 1;
    
    -- Safety check: if no office is found, we should use any office as a fallback
    IF def_office IS NULL THEN
        SELECT id INTO def_office FROM public.offices LIMIT 1;
    END IF;

    -- 2. Backfill existing profiles where lokasi_kantor IS NULL
    UPDATE public.profiles
    SET lokasi_kantor = def_office
    WHERE lokasi_kantor IS NULL;
END $$;

-- 3. Update the trigger function to always insert this default office
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $func$
DECLARE
    def_office UUID;
BEGIN
    -- Fetch the default office dynamically
    SELECT id INTO def_office FROM public.offices WHERE nama LIKE '%WITEL SUMSEL BABEL%' LIMIT 1;
    
    -- Fallback
    IF def_office IS NULL THEN
        SELECT id INTO def_office FROM public.offices LIMIT 1;
    END IF;

    INSERT INTO public.profiles (id, nama, nim, divisi, pembimbing, durasi_magang, lokasi_kantor)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'nama',
        new.raw_user_meta_data->>'nim',
        new.raw_user_meta_data->>'divisi',
        new.raw_user_meta_data->>'pembimbing',
        new.raw_user_meta_data->>'durasi_magang',
        def_office
    );
    RETURN new;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Alter the profiles table to make lokasi_kantor NOT NULL
ALTER TABLE public.profiles ALTER COLUMN lokasi_kantor SET NOT NULL;
