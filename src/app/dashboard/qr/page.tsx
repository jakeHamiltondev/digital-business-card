import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import QRDisplay from './QRDisplay'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'My QR Code | Linkfol',
}

export default async function QRPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) redirect('/dashboard')

  const cardUrl = `${siteUrl}/${profile.username}`
  const displayName = profile.full_name ?? `@${profile.username}`

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center">
      <Link
        href="/dashboard"
        className="absolute left-4 top-4 flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <QRDisplay url={cardUrl} />
      <p className="mt-6 text-xl font-semibold text-zinc-50">{displayName}</p>
      <p className="mt-2 text-sm text-zinc-400">linkfol.com/{profile.username}</p>
    </div>
  )
}
