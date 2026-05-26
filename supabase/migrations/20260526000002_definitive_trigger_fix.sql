-- ============================================================
-- PERBAIKAN DEFINITIF: handle_new_user trigger
-- Menghapus semua referensi ke kolom 'divisi' dan 'durasi_magang'
-- yang sudah dihapus dari tabel profiles.
-- Jalankan script ini di Supabase SQL Editor.
-- ============================================================

-- Langkah 1: Hapus trigger lama agar tidak konflik
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Langkah 2: Tulis ulang fungsi trigger secara bersih
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $func$
DECLARE
    def_office UUID;
BEGIN
    -- Cari kantor berdasarkan nama, dengan fallback ke kantor pertama
    SELECT id INTO def_office 
    FROM public.offices 
    WHERE nama ILIKE '%WITEL%' 
    LIMIT 1;
    
    IF def_office IS NULL THEN
        SELECT id INTO def_office FROM public.offices LIMIT 1;
    END IF;

    -- Insert profil pengguna baru (tanpa divisi, tanpa durasi_magang)
    INSERT INTO public.profiles (
        id, 
        nama, 
        nim, 
        pembimbing, 
        mulai_magang, 
        selesai_magang, 
        lokasi_kantor
    )
    VALUES (
        new.id,
        new.raw_user_meta_data->>'nama',
        new.raw_user_meta_data->>'nim',
        new.raw_user_meta_data->>'pembimbing',
        COALESCE(
            NULLIF(new.raw_user_meta_data->>'mulai_magang', '')::DATE,
            CURRENT_DATE
        ),
        COALESCE(
            NULLIF(new.raw_user_meta_data->>'selesai_magang', '')::DATE,
            CURRENT_DATE + interval '90 days'
        ),
        def_office
    );
    
    RETURN new;
EXCEPTION
    WHEN others THEN
        -- Log error ke PostgreSQL log dan re-raise agar auth tidak silently fail
        RAISE LOG 'handle_new_user error: %', SQLERRM;
        RAISE;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- Langkah 3: Pasang kembali trigger ke auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
