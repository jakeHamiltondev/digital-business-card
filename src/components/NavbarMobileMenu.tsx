'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import LinkfolLogo from '@/components/LinkfolLogo'

const linkClass =
  'block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'

export default function NavbarMobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-4 dark:border-zinc-800">
              <LinkfolLogo size="sm" />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-3">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/edit"
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                Edit Profile
              </Link>
              <Link
                href="/cards"
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                My Cards
              </Link>
              <form action={signOut}>
                <button type="submit" className={linkClass}>
                  Sign out
                </button>
              </form>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
