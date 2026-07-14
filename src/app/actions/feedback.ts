'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitFeedback(
  message: string,
  page: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase.from('feedback').insert({
    user_id: user.id,
    message,
    page,
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
