import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Profile, ResumeEntry, ResumeEntryType } from '@/lib/types'
import { Download } from 'lucide-react'

const SECTION_ORDER: ResumeEntryType[] = [
  'experience',
  'education',
  'skill',
  'project',
  'certification',
]

const SECTION_LABELS: Record<ResumeEntryType, string> = {
  experience: 'Work Experience',
  education: 'Education',
  skill: 'Skills',
  project: 'Projects',
  certification: 'Certifications',
}

type Props = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('full_name')
    .ilike('username', username)
    .maybeSingle()

  if (!data) return { title: 'Resume not found | Linkfol' }
  const name = (data as { full_name: string | null }).full_name ?? `@${username}`
  return { title: `${name} — Resume | Linkfol` }
}

export default async function PublicResumePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .maybeSingle()

  const profile = profileData as Profile | null

  if (!profile) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
        <div className="text-center">
          <p className="text-5xl font-bold text-zinc-200 dark:text-zinc-800">404</p>
          <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Card not found
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            No card exists for{' '}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">@{username}</span>.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Go home
          </Link>
        </div>
      </div>
    )
  }

  const { data: entriesData } = await supabase
    .from('resume_entries')
    .select('*')
    .eq('user_id', profile.id)
    .order('sort_order', { ascending: true })

  const entries = (entriesData ?? []) as ResumeEntry[]

  if (entries.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            No resume available yet
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {profile.full_name ?? `@${username}`} hasn&apos;t published their resume yet.
          </p>
          <Link
            href={`/${username}`}
            className="mt-6 inline-block rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            View their card
          </Link>
        </div>
      </div>
    )
  }

  const entriesByType: Partial<Record<ResumeEntryType, ResumeEntry[]>> = {}
  for (const entry of entries) {
    if (!entriesByType[entry.type]) entriesByType[entry.type] = []
    entriesByType[entry.type]!.push(entry)
  }

  const titleLine = [profile.title, profile.company].filter(Boolean).join(' at ')

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 print:bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12 print:px-8 print:py-8">
        {/* Download buttons — hidden when printing */}
        <div className="mb-6 flex justify-end gap-2 print:hidden">
          <a
            href={`/api/resume/pdf/${username}`}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Download className="h-4 w-4" />
            PDF
          </a>
          <a
            href={`/api/resume/docx/${username}`}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Download className="h-4 w-4" />
            DOCX
          </a>
        </div>

        {/* Header */}
        <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800 print:border-zinc-300">
          <div className="flex items-center gap-5">
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? username}
                className="h-16 w-16 shrink-0 rounded-full object-cover object-top"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 print:text-zinc-900">
                {profile.full_name ?? `@${username}`}
              </h1>
              {titleLine && (
                <p className="mt-0.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 print:text-zinc-600">
                  {titleLine}
                </p>
              )}
              {(profile.email || profile.phone) && (
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-500 print:text-zinc-500">
                  {profile.email && <span>{profile.email}</span>}
                  {profile.phone && <span>{profile.phone}</span>}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Sections */}
        <main className="mt-8 space-y-10">
          {SECTION_ORDER.map((type) => {
            const sectionEntries = entriesByType[type]
            if (!sectionEntries || sectionEntries.length === 0) return null
            return (
              <section key={type}>
                <h2 className="mb-4 border-b border-zinc-100 pb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:border-zinc-800 dark:text-zinc-500 print:border-zinc-200 print:text-zinc-500">
                  {SECTION_LABELS[type]}
                </h2>

                {type === 'skill' ? (
                  <div className="space-y-4">
                    {sectionEntries.map((entry) => (
                      <div key={entry.id}>
                        <p className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 print:text-zinc-700">
                          {entry.title}
                        </p>
                        {entry.skills_list && entry.skills_list.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {entry.skills_list.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 print:border print:border-zinc-300 print:bg-transparent print:text-zinc-600"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sectionEntries.map((entry) => (
                      <div key={entry.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 print:text-zinc-900">
                            {entry.title}
                          </h3>
                          {(entry.start_date || entry.end_date) && (
                            <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-500 print:text-zinc-500">
                              {[entry.start_date, entry.end_date].filter(Boolean).join(' – ')}
                            </span>
                          )}
                        </div>
                        {entry.organization && (
                          <p className="mt-0.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 print:text-zinc-600">
                            {entry.organization}
                            {entry.location && (
                              <span className="font-normal text-zinc-400 dark:text-zinc-500 print:text-zinc-500">
                                {' · '}{entry.location}
                              </span>
                            )}
                          </p>
                        )}
                        {entry.description && (
                          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 print:text-zinc-600">
                            {entry.description}
                          </p>
                        )}
                        {type === 'project' && entry.skills_list && entry.skills_list.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {entry.skills_list.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 print:border print:border-zinc-300 print:bg-transparent print:text-zinc-600"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </main>

        {/* Back link — hidden when printing */}
        <div className="mt-12 border-t border-zinc-100 pt-6 dark:border-zinc-800 print:hidden">
          <Link
            href={`/${username}`}
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            ← Back to {profile.full_name ?? `@${username}`}&apos;s card
          </Link>
        </div>
      </div>
    </div>
  )
}
