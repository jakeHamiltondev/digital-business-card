'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { label: 'My Card', href: '/dashboard' },
  { label: 'Edit Profile', href: '/dashboard/edit' },
  { label: 'Contacts', href: '/cards' },
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
