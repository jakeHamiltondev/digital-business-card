import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BusinessCard from '@/components/BusinessCard'
import type { Profile } from '@/lib/types'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default async function UserCardPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  const profile = data as Profile | null
  const pageUrl = `${siteUrl}/${username}`

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
        <div className="text-center">
          <p className="text-5xl font-bold text-zinc-200 dark:text-zinc-800">404</p>
          <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Card not found
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            No card exists for <span className="font-medium text-zinc-700 dark:text-zinc-300">@{username}</span>.
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <BusinessCard profile={profile} pageUrl={pageUrl} />
    </div>
  )
}
