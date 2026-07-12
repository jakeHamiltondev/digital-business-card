import { Mail } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { getTheme, type Theme } from '@/lib/themes'

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function Avatar({ name, avatarUrl, t }: { name: string | null; avatarUrl: string | null; t: Theme }) {
  const ringStyle = { boxShadow: `0 0 0 4px ${t.colors.avatarRing}` }
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? 'Profile photo'}
        className="h-24 w-24 rounded-full object-cover object-top"
        style={ringStyle}
      />
    )
  }
  const initial = name?.trim().charAt(0).toUpperCase() ?? '?'
  return (
    <div
      className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-semibold"
      style={{ backgroundColor: t.colors.avatarInitialBg, color: t.colors.avatarInitialText, ...ringStyle }}
    >
      {initial}
    </div>
  )
}

export default function CardPreviewStatic({ profile }: { profile: Profile }) {
  const t = getTheme(profile.theme)
  const social = profile.social_links ?? {}
  const titleLine = [profile.title, profile.company].filter(Boolean).join(' at ')

  const socialItems = [
    { href: social.linkedin, Icon: LinkedInIcon, label: 'LinkedIn' },
    { href: social.twitter, Icon: TwitterIcon, label: 'Twitter / X' },
    { href: social.instagram, Icon: InstagramIcon, label: 'Instagram' },
    { href: social.github, Icon: GitHubIcon, label: 'GitHub' },
  ].filter((item): item is { href: string; Icon: typeof LinkedInIcon; label: string } => Boolean(item.href))

  return (
    <div
      className="w-full max-w-sm border px-8 py-10"
      style={{
        background: t.colors.background,
        borderColor: t.colors.border,
        borderRadius: t.style.borderRadius,
        boxShadow: t.style.shadow,
      }}
    >
      <div className="flex flex-col items-center text-center">
        <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} t={t} />
        <h2
          className="mt-4 text-2xl tracking-tight"
          style={{ color: t.colors.text, fontWeight: t.style.fontWeight }}
        >
          {profile.full_name || profile.username}
        </h2>
        {titleLine && (
          <p className="mt-1 text-sm font-medium" style={{ color: t.colors.textSecondary }}>
            {titleLine}
          </p>
        )}
      </div>

      {profile.email && (
        <div className="mt-6">
          <div
            className="flex items-center gap-3 border px-4 py-3 text-sm font-medium"
            style={{
              background: t.colors.contactBg,
              borderColor: t.colors.contactBorder,
              color: t.colors.contactText,
              borderRadius: t.style.innerRadius,
            }}
          >
            <Mail className="h-4 w-4 shrink-0" style={{ color: t.colors.iconColor }} />
            {profile.email}
          </div>
        </div>
      )}

      {socialItems.length > 0 && (
        <div className="mt-4 flex justify-center gap-3">
          {socialItems.map(({ Icon, label }) => (
            <div key={label} className="rounded-lg p-2" style={{ color: t.colors.iconColor }}>
              <Icon className="h-5 w-5" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
