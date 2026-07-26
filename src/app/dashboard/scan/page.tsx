import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QRScanner from './QRScanner'

export const metadata: Metadata = {
  title: 'Scan QR Code | Linkfol',
}

export default async function ScanPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-950">
      <QRScanner />
    </div>
  )
}
