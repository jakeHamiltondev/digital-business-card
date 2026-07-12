import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Pencil, Eye, Bookmark, Share2 } from 'lucide-react'
import QRCodeBlock from '@/components/QRCodeBlock'
import BusinessCard from '@/components/BusinessCard'
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

  const displayName = profile?.full_name ?? profile?.username ?? 'there'
  const cardUrl = profile ? `${siteUrl}/${profile.username}` : null
  const isIncomplete = profile && (!profile.full_name || !profile.title)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        {isIncomplete && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800 dark:bg-amber-950">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Complete your profile to get the most out of Linkfol.{' '}
              <Link
                href="/dashboard/edit"
                className="font-medium underline underline-offset-2 hover:no-underline"
              >
                Edit profile →
              </Link>
            </p>
          </div>
        )}

        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome back, {displayName}
        </h1>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link
            href="/dashboard/edit"
            className="flex flex-col items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <div className="rounded-xl bg-zinc-100 p-2.5 dark:bg-zinc-800">
              <Pencil className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">Edit Profile</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Update your info</p>
            </div>
          </Link>

          <Link
            href={profile ? `/${profile.username}` : '#'}
            className="flex flex-col items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <div className="rounded-xl bg-zinc-100 p-2.5 dark:bg-zinc-800">
              <Eye className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">View My Card</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">See your public card</p>
            </div>
          </Link>

          <Link
            href="/cards"
            className="flex flex-col items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <div className="rounded-xl bg-zinc-100 p-2.5 dark:bg-zinc-800">
              <Bookmark className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">My Cards</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Saved contacts</p>
            </div>
          </Link>

          <Link
            href="#share"
            className="flex flex-col items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <div className="rounded-xl bg-zinc-100 p-2.5 dark:bg-zinc-800">
              <Share2 className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">Share</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Your card link & QR</p>
            </div>
          </Link>
        </div>

        {profile && cardUrl && (
          <section id="share">
            <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Share your card
            </h2>
            <div className="rounded-2xl border border-zinc-200 bg-white px-8 py-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {/* Card preview */}
                <div className="flex items-center justify-center">
                  <div
                    className="pointer-events-none select-none overflow-hidden"
                    style={{ width: 269, height: 378 }}
                  >
                    <div
                      style={{
                        width: 384,
                        height: 540,
                        transform: 'scale(0.7)',
                        transformOrigin: 'top left',
                      }}
                    >
                      <BusinessCard profile={profile} pageUrl={cardUrl} />
                    </div>
                  </div>
                </div>

                {/* Share tools */}
                <div className="flex flex-col items-center justify-center gap-5">
                  <QRCodeBlock url={cardUrl} />
                  <Link
                    href={`/${profile.username}`}
                    className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    View my card
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
