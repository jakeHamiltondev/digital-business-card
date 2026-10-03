import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import LinkfolLogo from '@/components/LinkfolLogo'
import AvatarDropdown from '@/components/AvatarDropdown'

const activeClass = 'rounded-lg px-3 py-1.5 text-sm font-medium bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
const inactiveClass = 'rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'

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

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/dashboard" className={pathname === '/dashboard' ? activeClass : inactiveClass}>
            My Card
          </Link>
          <Link href="/dashboard/edit" className={pathname === '/dashboard/edit' ? activeClass : inactiveClass}>
            Edit Profile
          </Link>
          <Link href="/cards" className={pathname === '/cards' ? activeClass : inactiveClass}>
            Contacts
          </Link>
        </nav>

        <AvatarDropdown initial={initial} email={email} />
      </div>
    </header>
  )
}
