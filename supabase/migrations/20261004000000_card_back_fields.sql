-- Card back field visibility
-- NULL = show all (backward compat), otherwise an array of field IDs to display
alter table public.profiles
  add column if not exists card_back_fields text[] default null;
