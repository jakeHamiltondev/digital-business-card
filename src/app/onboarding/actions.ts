'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function checkUsername(username: string): Promise<{ available: boolean }> {
  if (!username || username.length < 2) return { available: false }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { available: false }

  const clean = username.toLowerCase().replace(/[^a-z0-9-]/g, '')
  if (!clean || clean.length < 2) return { available: false }

  const { data } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', clean)
    .neq('id', user.id)
    .maybeSingle()

  return { available: !data }
}

export async function saveOnboardingProfile(data: {
  full_name: string
  title: string
  company: string
  email: string
  phone: string
  username: string
  linkedin: string
  twitter: string
  instagram: string
  github: string
  theme: string
}): Promise<{ success: boolean; error: string | null; username?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const username = data.username.toLowerCase().trim()
  if (!username) return { success: false, error: 'Username is required' }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', username)
    .neq('id', user.id)
    .maybeSingle()

  if (existing) return { success: false, error: 'That username is already taken' }

  const social_links: Record<string, string> = {}
  for (const [platform, value] of Object.entries({
    linkedin: data.linkedin,
    twitter: data.twitter,
    instagram: data.instagram,
    github: data.github,
  })) {
    if (value?.trim()) social_links[platform] = value.trim()
  }

  const phone = data.phone ? data.phone.replace(/\D/g, '') || null : null

  const { error } = await supabase
    .from('profiles')
    .update({
      username,
      full_name: data.full_name?.trim() || null,
      title: data.title?.trim() || null,
      company: data.company?.trim() || null,
      email: data.email?.trim() || null,
      phone,
      social_links,
      theme: data.theme || 'midnight',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/${username}`)
  return { success: true, error: null, username }
}
