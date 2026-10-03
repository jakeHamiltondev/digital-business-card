import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import LinkfolLogo from '@/components/LinkfolLogo'
import AvatarDropdown from '@/components/AvatarDropdown'
import NavLinks from '@/components/NavLinks'

export default async function Navbar() {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname')
  if (pathname === '/onboarding' || pathname === '/dashboard/qr' || pathname === '/dashboard/scan') return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const initial = (user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? 'U').toUpperCase()
  const email = user.email ?? ''

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" aria-label="Linkfol home">
          <LinkfolLogo size="sm" />
        </Link>

        <NavLinks />

        <AvatarDropdown initial={initial} email={email} />
      </div>
    </header>
  )
}
