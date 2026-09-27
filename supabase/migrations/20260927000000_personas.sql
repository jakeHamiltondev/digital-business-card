-- Migration: Personas + classic business card fields
-- Apply in Supabase SQL editor or via: supabase db push
-- Safe to re-run: all ADD COLUMN statements use IF NOT EXISTS

-- ── Persona ──────────────────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS persona text NOT NULL DEFAULT 'professional';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_persona_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_persona_check
      CHECK (persona IN ('professional', 'student', 'recruiter'));
  END IF;
END $$;

-- Backfill existing rows (DEFAULT handles new rows)
UPDATE profiles SET persona = 'professional' WHERE persona IS NULL OR persona = '';

-- ── Professional fields ───────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS department text;

-- phones: array of {type: 'mobile'|'office'|'fax', number: string}
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phones jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Migrate existing single phone → phones array
UPDATE profiles
SET phones = jsonb_build_array(
  jsonb_build_object('type', 'mobile', 'number', phone)
)
WHERE phone IS NOT NULL
  AND phone <> ''
  AND phones = '[]'::jsonb;

-- work_address: {street1, street2, city, state, zip, country}
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS work_address jsonb;

-- address_visibility controls card display vs vCard inclusion vs hidden
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS address_visibility text NOT NULL DEFAULT 'vcard_only';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_address_visibility_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_address_visibility_check
      CHECK (address_visibility IN ('public', 'vcard_only', 'hidden'));
  END IF;
END $$;

-- location: city/state only, always public ("Where are you based?")
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS location text;

-- ── Pro-only fields ───────────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS logo_url text;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS brand_color_primary text;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS brand_color_accent text;

-- ── Student-specific fields ───────────────────────────────────────────────────
-- {university, major, expected_graduation (YYYY-MM), campus_org}

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS student_info jsonb;

-- ── Recruiter-specific fields ─────────────────────────────────────────────────
-- {hiring_focus, scheduling_link, careers_page_url}

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS recruiter_info jsonb;

-- ── RLS note ──────────────────────────────────────────────────────────────────
-- New columns inherit existing table-level RLS policies (auth.uid() = id).
-- No additional column-level policies required.
-- Pro-only enforcement for logo_url / brand_color_* is handled in server actions
-- via isPro() — not at the database level.
