'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isPro } from '@/lib/subscription'
import type {
  Profile,
  Persona,
  AddressVisibility,
  PhoneEntry,
  WorkAddress,
  StudentInfo,
  RecruiterInfo,
  SocialLinks,
} from '@/lib/types'

export type FormState = {
  success: boolean
  error: string | null
}

export async function updateProfile(data: {
  username: string
  persona: Persona
  full_name: string | null
  title: string | null
  company: string | null
  department: string | null
  bio: string | null
  phones: PhoneEntry[]
  email: string | null
  website: string | null
  social_links: SocialLinks
  theme: string
  work_address: WorkAddress | null
  address_visibility: AddressVisibility
  location: string | null
  logo_url: string | null
  brand_color_primary: string | null
  brand_color_accent: string | null
  student_info: StudentInfo | null
  recruiter_info: RecruiterInfo | null
}): Promise<FormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const username = data.username?.toLowerCase().trim() ?? ''
  if (!username) return { success: false, error: 'Username is required' }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', username)
    .neq('id', user.id)
    .maybeSingle()
  if (existing) return { success: false, error: 'That username is already taken' }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('plan, subscription_end_date, email')
    .eq('id', user.id)
    .single()
  const userIsPro = currentProfile ? isPro(currentProfile as Profile) : false

  const payload: Record<string, unknown> = {
    username,
    persona: data.persona,
    full_name: data.full_name,
    title: data.title,
    company: data.company,
    department: data.department,
    bio: data.bio,
    phones: data.phones,
    email: data.email,
    website: data.website,
    social_links: data.social_links,
    theme: data.theme,
    work_address: data.work_address,
    address_visibility: data.address_visibility,
    location: data.location,
    student_info: data.student_info,
    recruiter_info: data.recruiter_info,
    updated_at: new Date().toISOString(),
  }

  if (userIsPro) {
    payload.logo_url = data.logo_url
    payload.brand_color_primary = data.brand_color_primary
    payload.brand_color_accent = data.brand_color_accent
  }

  const { error } = await supabase.from('profiles').update(payload).eq('id', user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard')
  revalidatePath(`/${username}`)
  redirect(`/${username}`)
}

export async function updateAvatarUrl(avatarUrl: string): Promise<FormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard')
  return { success: true, error: null }
}
