-- Create custom types for enum if necessary
CREATE TYPE attendance_status AS ENUM ('Hadir', 'Izin', 'Sakit', 'Terlambat', 'Absen');

-- Create offices table
CREATE TABLE offices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama VARCHAR NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create profiles table
-- Linked to auth.users
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    nama VARCHAR,
    nim VARCHAR,
    pembimbing VARCHAR,
    durasi_magang VARCHAR,
    lokasi_kantor UUID REFERENCES offices(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create attendance table
CREATE TABLE attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out TIMESTAMP WITH TIME ZONE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION NOT NULL,
    status attendance_status NOT NULL DEFAULT 'Hadir',
    qr_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
    ON profiles FOR SELECT
    USING ( true );

CREATE POLICY "Users can insert their own profile."
    ON profiles FOR INSERT
    WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
    ON profiles FOR UPDATE
    USING ( auth.uid() = id );

-- Offices Policies
CREATE POLICY "Offices are viewable by everyone."
    ON offices FOR SELECT
    USING ( true );

-- Attendance Policies
CREATE POLICY "Users can view their own attendance."
    ON attendance FOR SELECT
    USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert their own attendance."
    ON attendance FOR INSERT
    WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own attendance."
    ON attendance FOR UPDATE
    USING ( auth.uid() = user_id );

-- Create a trigger to handle new user signup
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

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create Indexes for performance
CREATE INDEX idx_profiles_lokasi ON profiles(lokasi_kantor);
CREATE INDEX idx_attendance_user_id ON attendance(user_id);
CREATE INDEX idx_attendance_check_in ON attendance(check_in);
