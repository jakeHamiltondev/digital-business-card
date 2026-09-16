import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getResumeEntries } from '@/app/actions/resume'
import ResumeClient from './ResumeClient'

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
