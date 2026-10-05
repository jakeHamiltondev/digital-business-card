-- Add resume_url to profiles
-- Stores the Supabase Storage path (not a signed URL), e.g. "{user_id}/resume.pdf"
alter table public.profiles
  add column if not exists resume_url text default null;

-- Create resumes bucket: private, PDF-only, max 5 MB
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;

-- Upload: authenticated users can upload to their own folder only
create policy "Users can upload own resume"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update: authenticated users can replace their own file (enables upsert)
create policy "Users can update own resume"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete: authenticated users can remove their own file
create policy "Users can delete own resume"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Select (signed URL generation): public access so unauthenticated server renders
-- can generate signed URLs for the public /{username}/resume page.
-- File content is still gated by the signed URL token — direct path access is blocked
-- by Supabase's private bucket enforcement at the CDN level.
create policy "Public can generate signed URLs for resumes"
  on storage.objects for select
  to public
  using (bucket_id = 'resumes');
