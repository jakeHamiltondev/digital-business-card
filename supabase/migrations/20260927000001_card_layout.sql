-- Migration: card_layout column
-- Safe to re-run: ADD COLUMN uses IF NOT EXISTS; constraint guarded by DO block

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS card_layout text NOT NULL DEFAULT 'letterhead';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_card_layout_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_card_layout_check
      CHECK (card_layout IN ('brand_front', 'letterhead', 'executive_classic', 'photo_hero'));
  END IF;
END $$;

-- Backfill any edge-case NULLs (DEFAULT handles new rows)
UPDATE profiles SET card_layout = 'letterhead' WHERE card_layout IS NULL OR card_layout = '';

-- RLS note: new column inherits existing table-level RLS (auth.uid() = id).
-- Layout access enforcement (Pro gating) is handled in server actions via isPro().
