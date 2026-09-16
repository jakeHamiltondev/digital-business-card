'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ResumeEntry, ResumeEntryType } from '@/lib/types'

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
