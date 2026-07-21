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
    .ilike('username', username)
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#f25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7fba00" />
      <rect x="1" y="13" width="10" height="10" fill="#00a4ef" />
      <rect x="13" y="13" width="10" height="10" fill="#ffb900" />
    </svg>
  )
}

export default async function UserCardPage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
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

  async function signInWithMicrosoftToSave() {
    'use server'
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${siteUrl}/auth/callback?save=${username}`,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) throw error
    if (data.url) redirect(data.url)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <BusinessCard profile={profile} pageUrl={pageUrl} theme={profile.theme ?? 'midnight'} />
      <div className="mx-auto mt-4 w-full max-w-sm">
        {isLoggedInViewer ? (
          <SaveCardButton profileId={profile.id} initialSaved={initialSaved} />
        ) : !user ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Sign in to save to My Cards
            </p>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <form action={signInToSave} className="flex-1">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <GoogleIcon className="h-4 w-4" />
                  Google
                </button>
              </form>
              <form action={signInWithMicrosoftToSave} className="flex-1">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <MicrosoftIcon className="h-4 w-4" />
                  Microsoft
                </button>
              </form>
            </div>
            <a
              href={`/api/vcard/${username}`}
              className="flex items-center gap-1.5 text-sm text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
            >
              <Download className="h-3.5 w-3.5" />
              Or download to your phone&apos;s contacts app
            </a>
          </div>
        ) : null}
      </div>
    </div>
  )
}
