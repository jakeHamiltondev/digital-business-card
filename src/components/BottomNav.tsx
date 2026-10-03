'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CreditCard, Pencil, Users } from 'lucide-react'

const tabs = [
  { label: 'My Card', href: '/dashboard', icon: CreditCard },
  { label: 'Edit', href: '/dashboard/edit', icon: Pencil },
  { label: 'Contacts', href: '/cards', icon: Users },
]

export default function BottomNav() {
  const pathname = usePathname()

  if (
    pathname === '/onboarding' ||
    pathname === '/dashboard/qr' ||
    pathname === '/dashboard/scan' ||
    pathname === '/' ||
    (!pathname.startsWith('/dashboard') && pathname !== '/cards')
  ) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom,0px)] md:hidden dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? 'text-indigo-500 dark:text-indigo-400'
                  : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
