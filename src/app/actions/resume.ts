'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ResumeEntry, ResumeEntryType } from '@/lib/types'

export async function uploadResume(formData: FormData): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('file') as File | null
  if (!file) return { error: 'No file provided.' }

  const ALLOWED_TYPES: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/msword': 'doc',
  }
  const ext = ALLOWED_TYPES[file.type]
  if (!ext) return { error: 'File must be a PDF or Word document.' }
  if (file.size > 5 * 1024 * 1024) return { error: 'File must be under 5 MB.' }

  // NOTE: Run this SQL in Supabase dashboard to allow DOCX uploads:
  // UPDATE storage.buckets SET allowed_mime_types = array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'] WHERE id = 'resumes';

  // Delete any existing resume file (may have a different extension)
  const { data: profileData } = await supabase
    .from('profiles')
    .select('resume_url')
    .eq('id', user.id)
    .single()
  if (profileData?.resume_url) {
    await supabase.storage.from('resumes').remove([profileData.resume_url])
  }

  const path = `${user.id}/resume.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: 'Upload failed. Please try again.' }

  const { error: dbError } = await supabase
    .from('profiles')
    .update({ resume_url: path })
    .eq('id', user.id)

  if (dbError) return { error: dbError.message }

  revalidatePath('/dashboard/resume')
  return { error: null }
}

export async function deleteResume(): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('resume_url')
    .eq('id', user.id)
    .single()
  if (profileData?.resume_url) {
    await supabase.storage.from('resumes').remove([profileData.resume_url])
  }

  const { error } = await supabase
    .from('profiles')
    .update({ resume_url: null })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/resume')
  return { error: null }
}

export async function getResumeEntries(userId: string): Promise<ResumeEntry[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('resume_entries')
    .select('*')
    .eq('user_id', userId)
    .order('type', { ascending: true })
    .order('sort_order', { ascending: true })
  return (data ?? []) as ResumeEntry[]
}

export async function addResumeEntry(formData: {
  type: ResumeEntryType
  title: string
  organization?: string
  location?: string
  start_date?: string
  end_date?: string
  description?: string
  skills_list?: string[]
  sort_order?: number
}): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('resume_entries').insert({
    user_id: user.id,
    ...formData,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/resume')
  return { error: null }
}

export async function updateResumeEntry(
  id: string,
  formData: {
    title?: string
    organization?: string
    location?: string
    start_date?: string
    end_date?: string
    description?: string
    skills_list?: string[]
    sort_order?: number
  },
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('resume_entries')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/resume')
  return { error: null }
}

export async function deleteResumeEntry(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('resume_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/resume')
  return { error: null }
}

export async function reorderResumeEntries(
  entries: { id: string; sort_order: number }[],
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const updates = entries.map(({ id, sort_order }) =>
    supabase
      .from('resume_entries')
      .update({ sort_order, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id),
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) return { error: failed.error.message }

  revalidatePath('/dashboard/resume')
  return { error: null }
}
