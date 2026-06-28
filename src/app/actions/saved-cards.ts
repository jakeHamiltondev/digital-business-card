'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SavedCardWithProfile } from '@/lib/types'

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

export async function getSavedCards(): Promise<SavedCardWithProfile[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('saved_cards')
    .select('*, profile:profiles!saved_profile_id(*)')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })

  return (data ?? []) as SavedCardWithProfile[]
}

export async function toggleFavorite(
  savedCardId: string,
  isFavorite: boolean,
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('saved_cards')
    .update({ is_favorite: isFavorite })
    .eq('id', savedCardId)
    .eq('user_id', user.id)

  revalidatePath('/cards')
  return { error: error?.message ?? null }
}

export async function addTag(
  savedCardId: string,
  tag: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: current } = await supabase
    .from('saved_cards')
    .select('tags')
    .eq('id', savedCardId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!current) return { error: 'Card not found' }

  const tags = [...(current.tags ?? []), tag]

  const { error } = await supabase
    .from('saved_cards')
    .update({ tags })
    .eq('id', savedCardId)
    .eq('user_id', user.id)

  revalidatePath('/cards')
  return { error: error?.message ?? null }
}

export async function removeTag(
  savedCardId: string,
  tag: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: current } = await supabase
    .from('saved_cards')
    .select('tags')
    .eq('id', savedCardId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!current) return { error: 'Card not found' }

  const tags = (current.tags ?? []).filter((t: string) => t !== tag)

  const { error } = await supabase
    .from('saved_cards')
    .update({ tags })
    .eq('id', savedCardId)
    .eq('user_id', user.id)

  revalidatePath('/cards')
  return { error: error?.message ?? null }
}

export async function deleteSavedCard(
  savedCardId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('saved_cards')
    .delete()
    .eq('id', savedCardId)
    .eq('user_id', user.id)

  revalidatePath('/cards')
  return { error: error?.message ?? null }
}
