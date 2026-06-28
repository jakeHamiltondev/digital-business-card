import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '../ProfileForm'
import AvatarUpload from '@/components/AvatarUpload'
import type { Profile } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Edit Profile | Linkfol',
}

export default async function EditProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  let profile: Profile | null = null

  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (existing) {
    profile = existing as Profile
  } else {
    const username = `user-${user.id.replace(/-/g, '').slice(0, 8)}`
    const { data: created } = await supabase
      .from('profiles')
      .insert({ id: user.id, username, email: user.email ?? null })
      .select()
      .single()
    profile = created as Profile | null
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-2xl space-y-12 px-4 py-10">
        <section>
          <h2 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Edit Profile
          </h2>
          {profile ? (
            <div className="space-y-8">
              <AvatarUpload
                userId={user.id}
                avatarUrl={profile.avatar_url}
                fullName={profile.full_name}
              />
              <ProfileForm profile={profile} />
            </div>
          ) : (
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load profile. Please refresh the page.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
