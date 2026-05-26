-- Remove divisi column from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS divisi;

-- Re-create the handle_new_user trigger to exclude divisi
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, nim, pembimbing, durasi_magang)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'nama',
    new.raw_user_meta_data->>'nim',
    new.raw_user_meta_data->>'pembimbing',
    new.raw_user_meta_data->>'durasi_magang'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
