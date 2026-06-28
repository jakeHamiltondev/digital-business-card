'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveCard(profileId: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('saved_cards')
    .insert({ user_id: user.id, saved_profile_id: profileId })

  return { error: error?.message ?? null }
}

export async function unsaveCard(profileId: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('saved_cards')
    .delete()
    .eq('user_id', user.id)
    .eq('saved_profile_id', profileId)

  return { error: error?.message ?? null }
}

export async function checkIfSaved(profileId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('saved_cards')
    .select('id')
    .eq('user_id', user.id)
    .eq('saved_profile_id', profileId)
    .maybeSingle()

  return !!data
}
