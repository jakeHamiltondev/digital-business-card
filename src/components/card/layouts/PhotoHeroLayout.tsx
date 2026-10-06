'use client'

// Layout D — Photo Hero
// Full-bleed photo with gradient overlay. Bold, visual-first.

import type { Theme } from '@/lib/themes'
import type { LayoutFaceProps } from '../types'
import { generateCardColors, type CardColorTokens } from '@/lib/color-utils'
import { getThemeCardColors } from '@/lib/themes'
import { getPersonaConfig } from '@/lib/persona-config'
import ActionButtons from '../shared/ActionButtons'
import ContactRows from '../shared/ContactRows'
import SaveContactButton from '../shared/SaveContactButton'
import QRCodeMini from '@/components/QRCodeMini'

const SHADOW = '0 18px 40px -18px rgba(10,20,40,0.45), 0 2px 6px rgba(10,20,40,0.12)'
const PHOTO_H = 252  // top ~60% of 420px card

function getInitials(name: string | null): string {
  if (!name?.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase()
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase()
}

function makeBrandTheme(cc: CardColorTokens, t: Theme): Theme {
  const isDark = cc.text === '#ffffff'
  return {
    ...t,
    colors: {
      ...t.colors,
      background: cc.bg,
      cardBg: cc.bg,
      text: cc.text,
      textSecondary: cc.textMuted,
      mutedText: cc.textMuted,
      bioText: cc.textMuted,
      iconColor: cc.iconColor,
      contactBg: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
      contactBorder: cc.border,
      contactText: cc.text,
      border: cc.border,
      accent: cc.buttonBg,
      avatarRing: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.12)',
      avatarInitialBg: cc.buttonBg,
      avatarInitialText: cc.buttonText,
    },
  }
}

// ── Front ─────────────────────────────────────────────────────────────────────

export function PhotoHeroFront({ profile, userIsPro, t }: LayoutFaceProps) {
  const hasBrandColors = userIsPro && !!profile.brand_color_primary
  const cc: CardColorTokens = hasBrandColors
    ? generateCardColors(profile.brand_color_primary, profile.brand_color_accent)
    : getThemeCardColors(profile.theme)
  const brandT = makeBrandTheme(cc, t)

  const vcardCfg = getPersonaConfig(profile.persona).vcard

  const titleLine = vcardCfg.titleSource === 'major'
    ? (profile.student_info?.major ?? null)
    : (profile.title ?? null)

  const orgDisplay = vcardCfg.orgSource === 'university'
    ? (profile.student_info?.university ?? null)
    : (profile.company ?? null)

  const initials = getInitials(profile.full_name)

  const phones =
    (profile.phones?.length ?? 0) > 0
      ? profile.phones
      : profile.phone
        ? [{ type: 'mobile' as const, number: profile.phone }]
        : []
  const primaryPhone = phones?.[0] ?? null

  const ghostBtn: React.CSSProperties = {
    display: 'block',
    width: '100%',
    borderRadius: '0.75rem',
    padding: '10px 0',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 600,
    color: '#ffffff',
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.25)',
    textDecoration: 'none',
    boxSizing: 'border-box',
  }

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
      {/* ── Photo section (top 60%) ── */}
      <div style={{ position: 'relative', height: PHOTO_H, flexShrink: 0 }}>
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name ?? 'Profile photo'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              display: 'block',
            }}
          />
        ) : (
          // Gradient fallback with large initials monogram
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `radial-gradient(circle at 30% 30%, ${cc.bg}, ${cc.buttonBg})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 34,
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              {initials}
            </div>
          </div>
        )}

        {/* Dark gradient overlay: transparent at top, solid at bottom */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.72) 100%)',
          }}
        />

        {/* Logo badge — top-left corner, 36px tall */}
        {userIsPro && profile.logo_url && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 10,
              background: 'rgba(0,0,0,0.45)',
              borderRadius: 8,
              padding: '4px 8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
            }}
          >
            <img
              src={profile.logo_url}
              alt="Logo"
              style={{ height: 36, maxWidth: 120, objectFit: 'contain', display: 'block' }}
            />
          </div>
        )}

        {/* Name + title + company rendered on top of the overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 16,
            right: 16,
          }}
        >
          <h1
            style={{
              color: '#ffffff',
              fontSize: 22,
              fontWeight: 800,
              lineHeight: 1.15,
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
              margin: 0,
            }}
          >
            {profile.full_name || profile.username}
          </h1>
          {titleLine && (
            <p
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 14,
                marginTop: 3,
                textShadow: '0 1px 3px rgba(0,0,0,0.35)',
              }}
            >
              {titleLine}
            </p>
          )}
          {orgDisplay && (
            <p
              style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: 12,
                marginTop: 2,
                textShadow: '0 1px 3px rgba(0,0,0,0.35)',
              }}
            >
              {orgDisplay}
            </p>
          )}
        </div>
      </div>

      {/* ── Bottom section: save + call + email ghost buttons ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 8,
          padding: '14px 16px',
        }}
      >
        <SaveContactButton profile={profile} bg={cc.buttonBg} textColor={cc.buttonText} />
        {primaryPhone && (
          <a
            href={`tel:${primaryPhone.number}`}
            style={ghostBtn}
            onClick={e => e.stopPropagation()}
          >
            Call
          </a>
        )}
        {profile.email && (
          <a
            href={`mailto:${profile.email}`}
            style={ghostBtn}
            onClick={e => e.stopPropagation()}
          >
            Email
          </a>
        )}
      </div>
    </div>
  )
}

// ── Back ──────────────────────────────────────────────────────────────────────

export function PhotoHeroBack({ profile, pageUrl, userIsPro, t, hasResume }: LayoutFaceProps) {
  const hasBrandColors = userIsPro && !!profile.brand_color_primary
  const cc: CardColorTokens = hasBrandColors
    ? generateCardColors(profile.brand_color_primary, profile.brand_color_accent)
    : getThemeCardColors(profile.theme)
  const brandT = makeBrandTheme(cc, t)

  const vcardCfg = getPersonaConfig(profile.persona).vcard
  const orgDisplay = vcardCfg.orgSource === 'university'
    ? (profile.student_info?.university ?? null)
    : (profile.company ?? null)
  const selectedFields = profile.card_back_fields
  const showQR = !selectedFields || selectedFields.includes('qr')

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
        padding: '12px 16px',
      }}
    >
      {/* ── Identity header ── */}
      <div style={{ marginBottom: 8 }}>
        <p
          style={{
            color: cc.text,
            fontSize: 17,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {profile.full_name || profile.username}
        </p>
        {orgDisplay && (
          <p
            style={{
              color: cc.textMuted,
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {orgDisplay}
          </p>
        )}
      </div>

      {/* ── Contact rows ── */}
      <ContactRows profile={profile} pageUrl={pageUrl} t={brandT} maxRows={4} selectedFields={selectedFields} hasResume={hasResume} />

      {/* Spacer pushes QR + save to bottom */}
      <div style={{ flex: 1 }} />

      {/* ── QR code ── */}
      {showQR && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <QRCodeMini url={`${pageUrl}?qr=1`} />
        </div>
      )}

      {/* ── Save contact ── */}
      <SaveContactButton profile={profile} bg={cc.buttonBg} textColor={cc.buttonText} />
    </div>
  )
}
