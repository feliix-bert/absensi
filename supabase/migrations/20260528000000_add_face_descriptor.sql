-- Migration: Add face recognition fields to profiles
-- Minimal addition — existing columns and rows are untouched.
-- face_descriptor: 128-float array stored as JSONB (no raw images)
-- face_enrolled_at: audit timestamp of when enrollment happened

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS face_descriptor JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS face_enrolled_at TIMESTAMPTZ DEFAULT NULL;

-- Index for fast lookup when checking enrollment status
CREATE INDEX IF NOT EXISTS idx_profiles_face_enrolled
  ON profiles (id)
  WHERE face_descriptor IS NOT NULL;
