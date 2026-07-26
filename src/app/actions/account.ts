'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function deleteAccount(): Promise<{ error: string }> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return { error: '[DEBUG] Service role key not configured' }

  // Confirm which key is loaded — service role keys start with "eyJ" and are much longer than anon keys
  const keyPrefix = serviceKey.slice(0, 10)
  console.log('[deleteAccount] serviceKey prefix:', keyPrefix, '| total length:', serviceKey.length)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '[DEBUG] Not authenticated' }

  console.log('[deleteAccount] user.id:', user.id)

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  // Step 1: Remove other users' saved copies of this profile
  console.log('[deleteAccount] step 1: deleting saved_cards by saved_profile_id')
  const { error: e1 } = await admin.from('saved_cards').delete().eq('saved_profile_id', user.id)
  if (e1) return { error: `[DEBUG] step 1 (saved_cards by profile) failed: ${e1.message} | code: ${e1.code}` }

  // Step 2: Remove this user's own saved cards
  console.log('[deleteAccount] step 2: deleting saved_cards by user_id')
  const { error: e2 } = await admin.from('saved_cards').delete().eq('user_id', user.id)
  if (e2) return { error: `[DEBUG] step 2 (saved_cards by user) failed: ${e2.message} | code: ${e2.code}` }

  // Step 3: Delete avatar from storage
  console.log('[deleteAccount] step 3: removing avatar from storage')
  const { error: e3 } = await admin.storage.from('avatars').remove([`${user.id}/avatar.jpg`])
  if (e3) console.warn('[deleteAccount] step 3 (avatar) non-fatal error:', e3.message)

  // Step 4: Delete profile row — using admin client (should bypass RLS)
  console.log('[deleteAccount] step 4: deleting profile row')
  const { error: e4 } = await admin.from('profiles').delete().eq('id', user.id)
  if (e4) return { error: `[DEBUG] step 4 (profile delete) failed: ${e4.message} | code: ${e4.code} | hint: ${e4.hint ?? 'none'}` }

  // Step 5: Delete auth user
  console.log('[deleteAccount] step 5: deleting auth user')
  const { error: e5 } = await admin.auth.admin.deleteUser(user.id)
  if (e5) return { error: `[DEBUG] step 5 (auth.admin.deleteUser) failed: ${e5.message}` }

  console.log('[deleteAccount] all steps succeeded, signing out')
  await supabase.auth.signOut({ scope: 'global' })
  redirect('/')
}
