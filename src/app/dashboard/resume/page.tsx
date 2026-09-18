import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getResumeEntries } from '@/app/actions/resume'
import { isPro } from '@/lib/subscription'
import ResumeClient from './ResumeClient'
import type { Profile } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Resume Builder | Linkfol',
}

export default async function ResumePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const profile = profileData as Profile | null

  // Temporary bypass for testing — remove before Pro launch
  const canAccess = profile && (isPro(profile) || profile.email === 'jh0695@gmail.com')

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <main className="mx-auto max-w-2xl px-4 py-10">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Resume Builder
            </h1>
          </div>
          <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Resume Builder is a Pro feature
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Upgrade to build and share your professional resume.
            </p>
            <Link
              href="/pricing"
              className="mt-6 inline-block rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Upgrade to Pro
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const entries = await getResumeEntries(user.id)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-2xl space-y-10 px-4 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Resume Builder
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Build your professional history. This information will power your AI-generated resume.
          </p>
        </div>
        <ResumeClient initialEntries={entries} />
      </main>
    </div>
  )
}
