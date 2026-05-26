-- Fix the handle_new_user trigger to match the updated profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_office_id UUID;
BEGIN
  -- Dapatkan ID kantor pertama secara otomatis
  SELECT id INTO default_office_id FROM public.offices LIMIT 1;

  INSERT INTO public.profiles (id, nama, nim, pembimbing, mulai_magang, selesai_magang, lokasi_kantor)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'nama',
    new.raw_user_meta_data->>'nim',
    new.raw_user_meta_data->>'pembimbing',
    new.raw_user_meta_data->>'mulai_magang',
    new.raw_user_meta_data->>'selesai_magang',
    default_office_id
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
