'use client'

import { Phone, Mail, Globe, MapPin, Calendar, FileText } from 'lucide-react'
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

function buildRows(profile: Profile, iconColor: string, selectedFields?: string[] | null, hasResume?: boolean): Row[] {
  const sel = selectedFields  // null = show all
  const rows: Row[] = []

  const phones =
    (profile.phones?.length ?? 0) > 0
      ? (profile.phones ?? [])
      : profile.phone
        ? [{ type: 'mobile' as const, number: profile.phone }]
        : []

  if (!sel || sel.includes('phone')) {
    for (const p of phones) {
      rows.push({
        id: `phone-${p.number}`,
        href: `tel:${p.number}`,
        icon: <Phone className="h-4 w-4 shrink-0" style={{ color: iconColor }} />,
        label: formatPhone(p.number),
        sublabel: phones.length > 1 ? p.type : undefined,
      })
    }
  }

  if (profile.email && (!sel || sel.includes('email'))) {
    rows.push({
      id: 'email',
      href: `mailto:${profile.email}`,
      icon: <Mail className="h-4 w-4 shrink-0" style={{ color: iconColor }} />,
      label: profile.email,
    })
  }

  const sl = profile.social_links
  if (sl?.linkedin && (!sel || sel.includes('linkedin'))) {
    rows.push({
      id: 'linkedin',
      href: sl.linkedin,
      isExternal: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" style={{ color: iconColor }}>
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z" />
        </svg>
      ),
      label: sl.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\//, '').replace(/\/$/, ''),
    })
  }

  if (sl?.twitter && (!sel || sel.includes('twitter'))) {
    rows.push({
      id: 'twitter',
      href: sl.twitter,
      isExternal: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" style={{ color: iconColor }}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      label: sl.twitter.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
    })
  }

  if (sl?.instagram && (!sel || sel.includes('instagram'))) {
    rows.push({
      id: 'instagram',
      href: sl.instagram,
      isExternal: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" style={{ color: iconColor }}>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="3" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
      label: sl.instagram.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
    })
  }

  if (sl?.github && (!sel || sel.includes('github'))) {
    rows.push({
      id: 'github',
      href: sl.github,
      isExternal: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" style={{ color: iconColor }}>
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      ),
      label: sl.github.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, ''),
    })
  }

  if (sl?.tiktok && (!sel || sel.includes('tiktok'))) {
    rows.push({
      id: 'tiktok',
      href: sl.tiktok,
      isExternal: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" style={{ color: iconColor }}>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.5a8.18 8.18 0 0 0 4.78 1.52V6.56a4.85 4.85 0 0 1-1.01.13z" />
        </svg>
      ),
      label: sl.tiktok.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
    })
  }

  if (profile.website && (!sel || sel.includes('website'))) {
    rows.push({
      id: 'website',
      href: profile.website,
      isExternal: true,
      icon: <Globe className="h-4 w-4 shrink-0" style={{ color: iconColor }} />,
      label: profile.website.replace(/^https?:\/\//, ''),
    })
  }

  // Prefer personal location (city the user lives in) over work address
  if (!sel || sel.includes('location')) {
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

  if (hasResume && (!sel || sel.includes('resume'))) {
    rows.push({
      id: 'resume',
      href: `/${profile.username}/resume`,
      icon: <FileText className="h-4 w-4 shrink-0" style={{ color: iconColor }} />,
      label: 'Resume',
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
  selectedFields,
  hasResume,
}: {
  profile: Profile
  pageUrl: string
  t: Theme
  maxRows?: number
  hideOverflowLink?: boolean
  selectedFields?: string[] | null
  hasResume?: boolean
}) {
  const rows = buildRows(profile, t.colors.iconColor, selectedFields, hasResume)
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
