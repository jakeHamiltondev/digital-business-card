'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type FormState = {
  success: boolean
  error: string | null
}

export async function updateProfile(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const str = (key: string): string | null => {
    const val = (formData.get(key) as string | null)?.trim()
    return val || null
  }

  const username = str('username')
  if (!username) {
    return { success: false, error: 'Username is required' }
  }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .maybeSingle()

  if (existing) {
    return { success: false, error: 'That username is already taken' }
  }

  const social_links: Record<string, string> = {}
  for (const platform of ['linkedin', 'twitter', 'instagram', 'github']) {
    const val = str(platform)
    if (val) social_links[platform] = val
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      username,
      full_name: str('full_name'),
      title: str('title'),
      company: str('company'),
      bio: str('bio'),
      avatar_url: str('avatar_url'),
      phone: str('phone'),
      email: str('email'),
      website: str('website'),
      social_links,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, error: null }
}

export async function updateAvatarUrl(avatarUrl: string): Promise<FormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, error: null }
}
