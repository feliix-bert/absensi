-- DDL untuk Supabase SQL Editor
-- Jalankan query ini di Dashboard Supabase -> SQL Editor -> New Query

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nik TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'intern',
  "passwordHash" TEXT NOT NULL,
  cohort TEXT DEFAULT '2026',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdBy" TEXT,
  "updatedAt" TIMESTAMPTZ,
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMPTZ,
  "deletedBy" TEXT,
  "passwordResetAt" TIMESTAMPTZ,
  "passwordResetBy" TEXT
);

-- Buat indeks case-insensitive untuk pencarian NIK cepat
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_nik_upper ON public.users (UPPER(nik));
