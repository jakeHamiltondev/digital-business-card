import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'
import AvatarUpload from '@/components/AvatarUpload'
import QRCodeBlock from '@/components/QRCodeBlock'
import type { Profile } from '@/lib/types'


const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Dashboard | Linkfol',
}

export default async function DashboardPage() {
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

  const cardUrl = profile ? `${siteUrl}/${profile.username}` : null

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

        {profile && cardUrl && (
          <section>
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Share
            </h2>
            <div className="rounded-2xl border border-zinc-200 bg-white px-8 py-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-col items-center gap-5">
                <QRCodeBlock url={cardUrl} />
                <Link
                  href={`/${profile.username}`}
                  className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  View my card
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
