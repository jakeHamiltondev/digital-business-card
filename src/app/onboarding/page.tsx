import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingClient from './OnboardingClient'

export const metadata: Metadata = {
  title: 'Get started | Linkfol',
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.full_name) {
    redirect('/dashboard')
  }

  let username = profile?.username ?? null
  const avatarUrl = profile?.avatar_url ?? null

  if (!profile) {
    const tempUsername = `user-${user.id.replace(/-/g, '').slice(0, 8)}`
    await supabase
      .from('profiles')
      .insert({ id: user.id, username: tempUsername, email: user.email ?? null })
    username = tempUsername
  }

  return (
    <OnboardingClient
      userId={user.id}
      userEmail={user.email ?? null}
      existingUsername={username!}
      existingAvatarUrl={avatarUrl}
    />
  )
}
