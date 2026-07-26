'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function deleteAccount(): Promise<{ error: string }> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return { error: 'Service role key not configured' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  // Step 1: Remove other users' saved copies of this profile
  const { error: e1 } = await admin.from('saved_cards').delete().eq('saved_profile_id', user.id)
  if (e1) return { error: `Step 1 (saved_cards by profile) failed: ${e1.message}` }

  // Step 2: Remove this user's own saved cards
  const { error: e2 } = await admin.from('saved_cards').delete().eq('user_id', user.id)
  if (e2) return { error: `Step 2 (saved_cards by user) failed: ${e2.message}` }

  // Step 3: Delete avatar from storage
  const { error: e3 } = await admin.storage.from('avatars').remove([`${user.id}/avatar.jpg`])
  if (e3) console.warn('Avatar removal non-fatal error:', e3.message)

  // Step 4: Delete profile row
  const { error: e4 } = await admin.from('profiles').delete().eq('id', user.id)
  if (e4) return { error: `Step 4 (profile delete) failed: ${e4.message}` }

  // Step 5: Delete auth user
  const { error: e5 } = await admin.auth.admin.deleteUser(user.id)
  if (e5) return { error: `Step 5 (auth.admin.deleteUser) failed: ${e5.message}` }

  await supabase.auth.signOut({ scope: 'global' })
  redirect('/')
}
