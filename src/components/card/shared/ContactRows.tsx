'use client'

import { Phone, Mail, Globe, MapPin, Calendar } from 'lucide-react'
import type { Profile } from '@/lib/types'
import type { Theme } from '@/lib/themes'
import { getContrastColor } from '@/lib/color-utils'

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 0) return raw
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

// 7% opacity divider that works on both light and dark card backgrounds.
// getContrastColor(text) === '#0f172a' means text is light (high luminance) → bg is dark.
function dividerColor(t: Theme): string {
  return getContrastColor(t.colors.text) === '#0f172a'
    ? 'rgba(255,255,255,0.07)'
    : 'rgba(0,0,0,0.07)'
}

type Row = {
  id: string
  href?: string
  isExternal?: boolean
  icon: React.ReactNode
  label: string
  sublabel?: string
  multiline?: string[]
}

function buildRows(profile: Profile, iconColor: string): Row[] {
  const rows: Row[] = []

  const phones =
    (profile.phones?.length ?? 0) > 0
      ? (profile.phones ?? [])
      : profile.phone
        ? [{ type: 'mobile' as const, number: profile.phone }]
        : []

  for (const p of phones) {
    rows.push({
      id: `phone-${p.number}`,
      href: `tel:${p.number}`,
      icon: <Phone className="h-4 w-4 shrink-0" style={{ color: iconColor }} />,
      label: formatPhone(p.number),
      sublabel: phones.length > 1 ? p.type : undefined,
    })
  }

  if (profile.email) {
    rows.push({
      id: 'email',
      href: `mailto:${profile.email}`,
      icon: <Mail className="h-4 w-4 shrink-0" style={{ color: iconColor }} />,
      label: profile.email,
    })
  }

  if (profile.website) {
    rows.push({
      id: 'website',
      href: profile.website,
      isExternal: true,
      icon: <Globe className="h-4 w-4 shrink-0" style={{ color: iconColor }} />,
      label: profile.website.replace(/^https?:\/\//, ''),
    })
  }

  // Prefer personal location (city the user lives in) over work address
  if (profile.location) {
    rows.push({
      id: 'location',
      icon: <MapPin className="h-4 w-4 shrink-0" style={{ color: iconColor }} />,
      label: profile.location,
    })
  } else if (profile.address_visibility === 'public' && profile.work_address) {
    const a = profile.work_address
    const lines: string[] = []
    if (a.street1) lines.push(a.street1)
    if (a.street2) lines.push(a.street2)
    const cityState = [a.city, a.state].filter(Boolean).join(', ')
    if (cityState) lines.push(cityState)
    if (a.zip) lines.push(a.zip)
    if (a.country) lines.push(a.country)
    if (lines.length > 0) {
      rows.push({
        id: 'address',
        icon: <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: iconColor }} />,
        label: lines[0],
        multiline: lines,
      })
    }
  }

  const schedulingLink = profile.recruiter_info?.scheduling_link
  if (schedulingLink) {
    rows.push({
      id: 'scheduling',
      href: schedulingLink,
      isExternal: true,
      icon: <Calendar className="h-4 w-4 shrink-0" style={{ color: iconColor }} />,
      label: schedulingLink.replace(/^https?:\/\//, '').split('/')[0],
    })
  }

  return rows
}

export default function ContactRows({
  profile,
  pageUrl,
  t,
  maxRows = 5,
  hideOverflowLink = false,
}: {
  profile: Profile
  pageUrl: string
  t: Theme
  maxRows?: number
  hideOverflowLink?: boolean
}) {
  const rows = buildRows(profile, t.colors.iconColor)
  const visible = rows.slice(0, maxRows)
  const hasOverflow = rows.length > maxRows
  const border = dividerColor(t)

  return (
    <div>
      {visible.map(row => {
        const inner = row.multiline ? (
          <>
            {row.icon}
            <div className="leading-snug">
              {row.multiline.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </>
        ) : (
          <>
            {row.icon}
            <span className="flex-1 truncate">{row.label}</span>
            {row.sublabel && (
              <span className="text-xs capitalize opacity-50">{row.sublabel}</span>
            )}
          </>
        )

        const rowStyle: React.CSSProperties = {
          display: 'flex',
          alignItems: row.multiline ? 'flex-start' : 'center',
          gap: 12,
          paddingTop: 9,
          paddingBottom: 9,
          fontSize: 13,
          fontWeight: 500,
          color: t.colors.contactText,
          borderBottom: `1px solid ${border}`,
        }

        if (row.href) {
          return (
            <a
              key={row.id}
              href={row.href}
              target={row.isExternal ? '_blank' : undefined}
              rel={row.isExternal ? 'noopener noreferrer' : undefined}
              style={rowStyle}
              className="transition hover:opacity-70"
              onClick={e => e.stopPropagation()}
            >
              {inner}
            </a>
          )
        }

        return (
          <div key={row.id} style={rowStyle}>
            {inner}
          </div>
        )
      })}

      {hasOverflow && !hideOverflowLink && (
        <a
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block pt-2 text-center text-xs underline underline-offset-2 transition hover:opacity-70"
          style={{ color: t.colors.textSecondary }}
          onClick={e => e.stopPropagation()}
        >
          View full profile →
        </a>
      )}
    </div>
  )
}
