import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getResumeEntries } from '@/app/actions/resume'
import { isPro } from '@/lib/subscription'
import ResumeClient from './ResumeClient'
import ResumeUploadSection from './ResumeUploadSection'
import type { Profile } from '@/lib/types'
import { Download } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Resume | Linkfol',
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

  // Generate a signed URL for the dashboard "View" link (1-hour expiry)
  let signedUrl: string | null = null
  if (profile?.resume_url) {
    const { data } = await supabase.storage
      .from('resumes')
      .createSignedUrl(profile.resume_url, 3600)
    signedUrl = data?.signedUrl ?? null
  }

  // Temporary bypass for testing — remove before Pro launch
  const canAccessBuilder =
    profile && (isPro(profile) || profile.email === 'jh0695@gmail.com')

  const entries = canAccessBuilder ? await getResumeEntries(user.id) : []

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-2xl space-y-10 px-4 py-10">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          ← Back
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Resume
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Upload a PDF or build your resume with the Pro editor.
            </p>
          </div>
          {entries.length > 0 && profile && (
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={`/api/resume/pdf/${profile.username}`}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Download className="h-4 w-4" />
                PDF
              </a>
              <a
                href={`/api/resume/docx/${profile.username}`}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Download className="h-4 w-4" />
                DOCX
              </a>
            </div>
          )}
        </div>

        {/* Upload section — free for all users */}
        <ResumeUploadSection
          resumeUrl={profile?.resume_url ?? null}
          signedUrl={signedUrl}
        />

        {/* Pro resume builder */}
        {canAccessBuilder ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Resume Builder
              </h2>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                Build your professional history. This information will power your AI-generated resume.
              </p>
            </div>
            <ResumeClient initialEntries={entries} />
          </section>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Resume Builder is a Pro feature
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Upgrade to build and AI-polish your professional resume.
            </p>
            <Link
              href="/pricing"
              className="mt-6 inline-block rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
