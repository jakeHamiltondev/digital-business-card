import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import BusinessCard from '@/components/BusinessCard'
import SaveCardButton from '@/components/SaveCardButton'
import type { Profile } from '@/lib/types'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

type Props = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  const profile = data as Profile | null

  if (!profile) {
    return { title: 'Card not found | Linkfol' }
  }

  const pageUrl = `${siteUrl}/${username}`
  const displayName = profile.full_name ?? `@${username}`
  const title = `${displayName} — Digital Business Card | Linkfol`

  let description: string
  if (profile.title && profile.company) {
    description = `${profile.title} at ${profile.company}`
  } else if (profile.title) {
    description = profile.title
  } else if (profile.bio) {
    description = profile.bio.slice(0, 160)
  } else {
    description = `View ${displayName}'s digital business card on Linkfol.`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Linkfol',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function UserCardPage({ params }: Props) {
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
      <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
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

  const { data: { user } } = await supabase.auth.getUser()
  const isOwnCard = user?.id === profile.id
  const isLoggedInViewer = !!user && !isOwnCard

  let initialSaved = false
  if (isLoggedInViewer) {
    const { data: saved } = await supabase
      .from('saved_cards')
      .select('id')
      .eq('user_id', user!.id)
      .eq('saved_profile_id', profile.id)
      .maybeSingle()
    initialSaved = !!saved
  }

  async function signInToSave() {
    'use server'
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback?save=${username}`,
      },
    })
    if (error) throw error
    if (data.url) redirect(data.url)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <BusinessCard profile={profile} pageUrl={pageUrl} />
      <div className="mx-auto mt-4 w-full max-w-sm">
        {isLoggedInViewer ? (
          <SaveCardButton profileId={profile.id} initialSaved={initialSaved} />
        ) : !user ? (
          <div className="flex flex-col items-center gap-3">
            <form action={signInToSave} className="w-full">
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Sign in to save to My Cards
              </button>
            </form>
            <a
              href={`/api/vcard/${username}`}
              className="flex items-center gap-1.5 text-sm text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
            >
              <Download className="h-3.5 w-3.5" />
              Or download contact
            </a>
          </div>
        ) : null}
      </div>
    </div>
  )
}
