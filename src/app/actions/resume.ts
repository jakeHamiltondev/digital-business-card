'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isPro } from '@/lib/subscription'
import type { ResumeEntry, ResumeEntryType, Profile } from '@/lib/types'

const BYPASS_EMAIL = 'jh0695@gmail.com'

async function requireProForBuilder(): Promise<{ allowed: false; error: string } | { allowed: true; userId: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { allowed: false, error: 'Not authenticated' }

  if (user.email !== BYPASS_EMAIL) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileData || !isPro(profileData as Profile)) {
      return { allowed: false, error: 'Pro subscription required' }
    }
  }

  return { allowed: true, userId: user.id }
}

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
  const check = await requireProForBuilder()
  if (!check.allowed) return { error: check.error }

  const supabase = await createClient()
  const { error } = await supabase.from('resume_entries').insert({
    user_id: check.userId,
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
  const check = await requireProForBuilder()
  if (!check.allowed) return { error: check.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from('resume_entries')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', check.userId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/resume')
  return { error: null }
}

export async function deleteResumeEntry(id: string): Promise<{ error: string | null }> {
  const check = await requireProForBuilder()
  if (!check.allowed) return { error: check.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from('resume_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', check.userId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/resume')
  return { error: null }
}

export async function reorderResumeEntries(
  entries: { id: string; sort_order: number }[],
): Promise<{ error: string | null }> {
  const check = await requireProForBuilder()
  if (!check.allowed) return { error: check.error }

  const supabase = await createClient()
  const updates = entries.map(({ id, sort_order }) =>
    supabase
      .from('resume_entries')
      .update({ sort_order, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', check.userId),
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) return { error: failed.error.message }

  revalidatePath('/dashboard/resume')
  return { error: null }
}

export async function importResumeEntries(parsed: {
  experience: Array<{ title: string; organization?: string; location?: string; start_date?: string; end_date?: string; description?: string }>
  education: Array<{ title: string; organization?: string; location?: string; start_date?: string; end_date?: string; description?: string }>
  skills: Array<{ title: string; skills_list?: string[] }>
  projects: Array<{ title: string; organization?: string; description?: string }>
  certifications: Array<{ title: string; organization?: string; end_date?: string }>
}): Promise<{ error: string | null }> {
  const check = await requireProForBuilder()
  if (!check.allowed) return { error: check.error }

  const supabase = await createClient()
  const { error: deleteError } = await supabase
    .from('resume_entries')
    .delete()
    .eq('user_id', check.userId)
  if (deleteError) return { error: deleteError.message }

  type InsertRow = {
    user_id: string
    type: ResumeEntryType
    title: string
    organization: string | null
    location: string | null
    start_date: string | null
    end_date: string | null
    description: string | null
    skills_list: string[] | null
    sort_order: number
  }

  const rows: InsertRow[] = []

  parsed.experience.forEach((e, i) => {
    rows.push({
      user_id: check.userId,
      type: 'experience',
      title: e.title,
      organization: e.organization || null,
      location: e.location || null,
      start_date: e.start_date || null,
      end_date: e.end_date || null,
      description: e.description || null,
      skills_list: null,
      sort_order: i,
    })
  })

  parsed.education.forEach((e, i) => {
    rows.push({
      user_id: check.userId,
      type: 'education',
      title: e.title,
      organization: e.organization || null,
      location: e.location || null,
      start_date: e.start_date || null,
      end_date: e.end_date || null,
      description: e.description || null,
      skills_list: null,
      sort_order: i,
    })
  })

  parsed.skills.forEach((e, i) => {
    rows.push({
      user_id: check.userId,
      type: 'skill',
      title: e.title,
      organization: null,
      location: null,
      start_date: null,
      end_date: null,
      description: null,
      skills_list: e.skills_list ?? null,
      sort_order: i,
    })
  })

  parsed.projects.forEach((e, i) => {
    rows.push({
      user_id: check.userId,
      type: 'project',
      title: e.title,
      organization: e.organization || null,
      location: null,
      start_date: null,
      end_date: null,
      description: e.description || null,
      skills_list: null,
      sort_order: i,
    })
  })

  parsed.certifications.forEach((e, i) => {
    rows.push({
      user_id: check.userId,
      type: 'certification',
      title: e.title,
      organization: e.organization || null,
      location: null,
      start_date: e.end_date || null,
      end_date: null,
      description: null,
      skills_list: null,
      sort_order: i,
    })
  })

  if (rows.length === 0) {
    revalidatePath('/dashboard/resume')
    return { error: null }
  }

  const { error: insertError } = await supabase.from('resume_entries').insert(rows)
  if (insertError) return { error: insertError.message }

  revalidatePath('/dashboard/resume')
  return { error: null }
}
