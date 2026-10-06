import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Eye, QrCode, Camera, FileText } from 'lucide-react'
import QRCodeBlock from '@/components/QRCodeBlock'
import BusinessCard from '@/components/BusinessCard'
import UpgradeToast from '@/components/UpgradeToast'
import type { Profile } from '@/lib/types'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'My Card | Linkfol',
}

export default async function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const showUpgradeSuccess = searchParams.upgraded === 'true'
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  let profile: Profile | null = null

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: existing },
    { count: totalViews },
    { count: recentViews },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('card_views').select('*', { count: 'exact', head: true }).eq('profile_id', user.id),
    supabase.from('card_views').select('*', { count: 'exact', head: true }).eq('profile_id', user.id).gte('created_at', sevenDaysAgo),
  ])

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
  const qrUrl = cardUrl ? `${cardUrl}?qr=1` : null
  const hasContact = !!(profile?.email || profile?.phones?.length || profile?.website)
  const isIncomplete = profile && (!profile.full_name || !profile.title || !hasContact)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 pb-24 md:pb-10">
        <UpgradeToast show={showUpgradeSuccess} />

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

        {profile && cardUrl && (
          <div className="flex flex-col gap-10 sm:flex-row sm:items-center">
            {/* Card preview */}
            <div className="flex justify-center sm:flex-1">
              <BusinessCard profile={profile} pageUrl={cardUrl!} theme={profile.theme ?? 'midnight'} />
            </div>

            {/* Share tools */}
            <div className="flex flex-col items-center gap-5 sm:flex-1">
              <QRCodeBlock url={cardUrl} qrUrl={qrUrl ?? undefined} />
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={profile ? `/${profile.username}` : '#'}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Eye className="h-4 w-4" />
            View My Card
          </Link>
          <Link
            href="/dashboard/qr"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <QrCode className="h-4 w-4" />
            Full Screen QR
          </Link>
          <Link
            href="/dashboard/scan"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Camera className="h-4 w-4" />
            Scan QR Code
          </Link>
          <Link
            href="/dashboard/resume"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <FileText className="h-4 w-4" />
            Resume
          </Link>
        </div>

        {/* Stats */}
        <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">
          {totalViews ?? 0} total views · {recentViews ?? 0} this week
        </p>
      </main>
    </div>
  )
}
