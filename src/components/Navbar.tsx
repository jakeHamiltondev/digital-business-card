import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'

export default async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link
          href="/dashboard"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Linkfol
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/edit"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Edit Profile
          </Link>
          <Link
            href="/cards"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            My Cards
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  )
}
