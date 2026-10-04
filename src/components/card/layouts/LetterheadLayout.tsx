'use client'

import type { LayoutFaceProps } from '../types'
import { generateCardColors, type CardColorTokens } from '@/lib/color-utils'
import { getThemeCardColors } from '@/lib/themes'
import SaveContactButton from '../shared/SaveContactButton'
import QRCodeMini from '@/components/QRCodeMini'

const SHADOW = '0 18px 40px -18px rgba(10,20,40,0.45), 0 2px 6px rgba(10,20,40,0.12)'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 0) return raw
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

// ── Icons (18×18 for action buttons, 16×16 for contact rows) ─────────────────

function PhoneIcon18() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function PhoneIcon16() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function EmailIcon18() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  )
}

function EmailIcon16() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  )
}

function LinkedInIcon18() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z" />
    </svg>
  )
}

function LinkedInIcon16() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z" />
    </svg>
  )
}

function WebsiteIcon18() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function WebsiteIcon16() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function MapPinIcon16() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function TwitterIcon16() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function InstagramIcon16() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function GitHubIcon16() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function TikTokIcon16() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.5a8.18 8.18 0 0 0 4.78 1.52V6.56a4.85 4.85 0 0 1-1.01.13z" />
    </svg>
  )
}

function SavePersonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  )
}

// ── Front ─────────────────────────────────────────────────────────────────────

export function LetterheadFront({ profile, pageUrl, userIsPro, t }: LayoutFaceProps) {
  const hasBrandColors = userIsPro && !!profile.brand_color_primary
  const themeTokens = getThemeCardColors(profile.theme)
  const cc: CardColorTokens = hasBrandColors
    ? generateCardColors(profile.brand_color_primary, profile.brand_color_accent)
    : themeTokens
  const bandGradient = hasBrandColors ? cc.bg : themeTokens.bandGradient
  const tonal        = hasBrandColors ? cc.bg : themeTokens.tonal
  const dot          = hasBrandColors ? 'rgba(255,255,255,0.10)' : themeTokens.dot
  const avatarGrad   = hasBrandColors ? cc.buttonBg : themeTokens.avatarGradient

  const phones = (profile.phones?.length ?? 0) > 0
    ? (profile.phones ?? [])
    : profile.phone
      ? [{ type: 'mobile' as const, number: profile.phone }]
      : []
  const primaryPhone = phones[0] ?? null

  const actionItems: Array<{ label: string; href: string; icon: React.ReactNode }> = []
  if (primaryPhone) actionItems.push({ label: 'Phone',    href: `tel:${primaryPhone.number}`,          icon: <PhoneIcon18 /> })
  if (profile.social_links?.linkedin) actionItems.push({ label: 'LinkedIn', href: profile.social_links.linkedin, icon: <LinkedInIcon18 /> })
  if (profile.email)   actionItems.push({ label: 'Email',   href: `mailto:${profile.email}`,             icon: <EmailIcon18 /> })
  if (profile.website) actionItems.push({ label: 'Website', href: profile.website,                       icon: <WebsiteIcon18 /> })
  const displayItems = actionItems.slice(0, 3)

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 18,
        overflow: 'hidden',
        background: cc.bg,
        boxShadow: SHADOW,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Gradient band with dot texture ── */}
      <div
        style={{
          height: 128,
          position: 'relative',
          flexShrink: 0,
          background: bandGradient,
          borderRadius: '18px 18px 0 0',
        }}
      >
        {/* Dot texture overlay fading toward the bottom */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${dot} 1.2px, transparent 1.3px)`,
            backgroundSize: '14px 14px',
            maskImage: 'linear-gradient(180deg, #000 10%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(180deg, #000 10%, transparent 95%)',
            borderRadius: '18px 18px 0 0',
          }}
        />
        {/* Logo — top-left, original colors, Pro only */}
        {userIsPro && profile.logo_url && (
          <img
            src={profile.logo_url}
            alt=""
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              height: 28,
              maxWidth: 100,
              objectFit: 'contain',
            }}
          />
        )}
      </div>

      {/* ── Body ── */}
      <div
        style={{
          padding: '0 20px 16px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
        }}
      >
        {/* Avatar overlapping band by 46px */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            marginTop: -46,
            border: `4px solid ${cc.bg}`,
            background: profile.avatar_url ? undefined : avatarGrad,
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
            fontSize: 30,
            color: '#fff',
            position: 'relative',
            zIndex: 2,
            letterSpacing: '0.02em',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            getInitials(profile.full_name)
          )}
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginTop: 8,
            color: cc.text,
            lineHeight: 1.15,
          }}
        >
          {profile.full_name || profile.username}
        </div>

        {/* Title · Company */}
        {(profile.title || profile.company) && (
          <div
            style={{
              fontSize: 13.5,
              color: cc.textMuted,
              fontWeight: 500,
              marginTop: 3,
            }}
          >
            {profile.title}{profile.company ? ` · ${profile.company}` : ''}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Action buttons — 3-column labeled grid */}
        {displayItems.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${displayItems.length}, 1fr)`,
              gap: 8,
              width: '100%',
            }}
          >
            {displayItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '9px 0 8px',
                  borderRadius: 12,
                  background: tonal,
                  color: cc.text,
                  fontSize: 11.5,
                  fontWeight: 700,
                  border: `1px solid ${cc.border}`,
                  textDecoration: 'none',
                }}
                onClick={e => e.stopPropagation()}
              >
                <span style={{ color: cc.iconColor }}>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>
        )}

        {/* Save contact CTA */}
        <div style={{ width: '100%', marginTop: 10 }}>
          <SaveContactButton
            profile={profile}
            bg={cc.buttonBg}
            textColor={cc.buttonText}
            label="Save contact"
            icon={<SavePersonIcon />}
          />
        </div>
      </div>
    </div>
  )
}

// ── Back ──────────────────────────────────────────────────────────────────────

export function LetterheadBack({ profile, pageUrl, userIsPro, t, hasResume }: LayoutFaceProps) {
  const hasBrandColors = userIsPro && !!profile.brand_color_primary
  const themeTokens = getThemeCardColors(profile.theme)
  const cc: CardColorTokens = hasBrandColors
    ? generateCardColors(profile.brand_color_primary, profile.brand_color_accent)
    : themeTokens
  const tonal      = hasBrandColors ? cc.bg : themeTokens.tonal
  const avatarGrad = hasBrandColors ? cc.buttonBg : themeTokens.avatarGradient

  const phones = (profile.phones?.length ?? 0) > 0
    ? (profile.phones ?? [])
    : profile.phone
      ? [{ type: 'mobile' as const, number: profile.phone }]
      : []
  const primaryPhone = phones[0] ?? null

  const selectedFields = profile.card_back_fields  // null = show all
  const showQR = !selectedFields || selectedFields.includes('qr')
  const sl = profile.social_links

  type ContactRow = { id: string; icon: React.ReactNode; value: string; href: string | null }
  const contactRows: ContactRow[] = []
  if (profile.email && (!selectedFields || selectedFields.includes('email')))
    contactRows.push({ id: 'email', icon: <EmailIcon16 />, value: profile.email, href: `mailto:${profile.email}` })
  if (primaryPhone && (!selectedFields || selectedFields.includes('phone')))
    contactRows.push({ id: 'phone', icon: <PhoneIcon16 />, value: formatPhone(primaryPhone.number), href: `tel:${primaryPhone.number}` })
  if (sl?.linkedin && (!selectedFields || selectedFields.includes('linkedin')))
    contactRows.push({ id: 'linkedin', icon: <LinkedInIcon16 />, value: sl.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\//, '').replace(/\/$/, ''), href: sl.linkedin })
  if (sl?.twitter && (!selectedFields || selectedFields.includes('twitter')))
    contactRows.push({ id: 'twitter', icon: <TwitterIcon16 />, value: sl.twitter.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), href: sl.twitter })
  if (sl?.instagram && (!selectedFields || selectedFields.includes('instagram')))
    contactRows.push({ id: 'instagram', icon: <InstagramIcon16 />, value: sl.instagram.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), href: sl.instagram })
  if (sl?.github && (!selectedFields || selectedFields.includes('github')))
    contactRows.push({ id: 'github', icon: <GitHubIcon16 />, value: sl.github.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, ''), href: sl.github })
  if (sl?.tiktok && (!selectedFields || selectedFields.includes('tiktok')))
    contactRows.push({ id: 'tiktok', icon: <TikTokIcon16 />, value: sl.tiktok.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), href: sl.tiktok })
  if (profile.website && (!selectedFields || selectedFields.includes('website')))
    contactRows.push({ id: 'website', icon: <WebsiteIcon16 />, value: profile.website.replace(/^https?:\/\//, ''), href: profile.website })
  if (profile.location && (!selectedFields || selectedFields.includes('location')))
    contactRows.push({ id: 'location', icon: <MapPinIcon16 />, value: profile.location, href: null })

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 18,
        overflow: 'hidden',
        background: cc.bg,
        boxShadow: SHADOW,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        display: 'flex',
        flexDirection: 'column',
        padding: '22px 20px 16px',
      }}
    >
      {/* ── Header row ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          paddingBottom: 12,
          borderBottom: `1px solid ${cc.border}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: profile.avatar_url ? undefined : avatarGrad,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 14,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            getInitials(profile.full_name)
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: cc.text,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {profile.full_name || profile.username}
          </div>
          <div
            style={{
              fontSize: 12,
              color: cc.textMuted,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {profile.title || profile.company}
          </div>
        </div>
      </div>

      {/* ── Contact rows ── */}
      <div style={{ marginTop: 4 }}>
        {contactRows.map((row, i) => {
          const isLast = i === contactRows.length - 1
          const rowStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: '10px 2px',
            fontSize: 13,
            color: cc.text,
            borderBottom: isLast ? 'none' : `1px solid ${cc.border}`,
            textDecoration: 'none',
          }
          const inner = (
            <>
              <span
                style={{
                  color: cc.iconColor,
                  flex: 'none',
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {row.icon}
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {row.value}
              </span>
            </>
          )
          if (row.href) {
            return (
              <a
                key={row.id}
                href={row.href}
                target={row.href.startsWith('http') ? '_blank' : undefined}
                rel={row.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                style={rowStyle}
                onClick={e => e.stopPropagation()}
              >
                {inner}
              </a>
            )
          }
          return <div key={row.id} style={rowStyle}>{inner}</div>
        })}
      </div>

      {/* Resume link — gated until Pro launch (do not change false &&) */}
      {false && hasResume && (
        <a
          href={`/${profile.username}/resume`}
          className="mb-2 inline-block text-xs underline underline-offset-4"
          style={{ color: cc.textMuted }}
          onClick={e => e.stopPropagation()}
        >
          View my resume →
        </a>
      )}

      {/* ── QR area — pushed to bottom ── */}
      {showQR && (
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            borderRadius: 14,
            background: tonal,
            border: `1px solid ${cc.border}`,
          }}
        >
          <QRCodeMini url={`${pageUrl}?qr=1`} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: cc.text }}>Scan to save</div>
            <div style={{ fontSize: 11.5, color: cc.textMuted }}>Any phone camera works</div>
          </div>
        </div>
      )}

      {/* ── Watermark ── */}
      <div
        style={{
          textAlign: 'center',
          fontSize: 10,
          color: cc.textMuted,
          marginTop: 10,
          letterSpacing: '0.04em',
        }}
      >
        Made with Linkfol
      </div>
    </div>
  )
}
