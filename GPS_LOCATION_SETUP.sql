-- KL BEETLE: optional GPS location fields for visitor logs
-- Run this once in Supabase Dashboard > SQL Editor.
alter table public.visitor_logs
  add column if not exists gps_latitude double precision,
  add column if not exists gps_longitude double precision,
  add column if not exists gps_accuracy double precision,
  add column if not exists gps_consent_at timestamptz;

-- Existing table permissions and RLS policies remain in place.
