import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/app/dashboard/ProfileForm'
import DangerZone from '@/app/dashboard/edit/DangerZone'
import type { Profile } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Edit Profile | Linkfol',
}

export default async function EditPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const [{ data: existing }, { count: resumeCount }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('resume_entries').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const profile = existing as Profile | null
  const hasResume = (resumeCount ?? 0) > 0 || !!profile?.resume_url

  if (!profile) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 pb-24 md:pb-10">
        <ProfileForm profile={profile} userId={user.id} hasResume={hasResume} />

        <DangerZone />
      </main>
    </div>
  )
}
