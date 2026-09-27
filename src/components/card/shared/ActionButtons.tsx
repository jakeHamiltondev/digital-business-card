'use client'

import { Phone, Mail, Globe } from 'lucide-react'
import type { Profile } from '@/lib/types'
import type { Theme } from '@/lib/themes'
import { LinkedInIcon } from './SocialIcons'

export default function ActionButtons({
  profile,
  t,
}: {
  profile: Profile
  t: Theme
}) {
  const phones =
    (profile.phones?.length ?? 0) > 0
      ? profile.phones
      : profile.phone
        ? [{ type: 'mobile' as const, number: profile.phone }]
        : []

  const primaryPhone = phones?.[0]

  const buttons = [
    primaryPhone && { href: `tel:${primaryPhone.number}`, label: 'Call',     Icon: Phone },
    profile.email && { href: `mailto:${profile.email}`,   label: 'Email',    Icon: Mail },
    profile.website && { href: profile.website,           label: 'Website',  Icon: Globe },
    profile.social_links?.linkedin && {
      href: profile.social_links.linkedin,
      label: 'LinkedIn',
      Icon: LinkedInIcon,
    },
  ].filter(Boolean) as { href: string; label: string; Icon: React.ComponentType<{ className?: string }> }[]

  if (buttons.length === 0) return null

  const btnStyle: React.CSSProperties = {
    background: t.colors.contactBg,
    color: t.colors.iconColor,
    borderColor: t.colors.contactBorder,
    width: 44,
    height: 44,
    minWidth: 44,
  }

  return (
    <div className="flex justify-center gap-3">
      {buttons.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          aria-label={label}
          className="flex items-center justify-center rounded-full border transition hover:brightness-110"
          style={btnStyle}
          onClick={e => e.stopPropagation()}
        >
          <Icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  )
}
