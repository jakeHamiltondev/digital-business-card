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

  // Remove other users' saved copies of this profile first (avoids FK conflicts)
  await admin.from('saved_cards').delete().eq('saved_profile_id', user.id)

  // Remove this user's own saved cards
  await admin.from('saved_cards').delete().eq('user_id', user.id)

  // Delete avatar from storage (non-fatal)
  await admin.storage.from('avatars').remove([`${user.id}/avatar.jpg`])

  // Delete profile row
  const { error: profileError } = await admin
    .from('profiles')
    .delete()
    .eq('id', user.id)
  if (profileError) return { error: `Failed to delete profile: ${profileError.message}` }

  // Delete auth user
  const { error: authError } = await admin.auth.admin.deleteUser(user.id)
  if (authError) return { error: `Failed to delete account: ${authError.message}` }

  await supabase.auth.signOut({ scope: 'global' })
  redirect('/')
}
