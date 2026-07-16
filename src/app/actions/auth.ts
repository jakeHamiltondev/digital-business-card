'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut({ scope: 'global' })
  redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: { prompt: 'select_account' },
    },
  })
  if (error) throw error
  if (data.url) redirect(data.url)
}

export async function signInWithMicrosoft() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: { prompt: 'select_account' },
    },
  })
  if (error) throw error
  if (data.url) redirect(data.url)
}
