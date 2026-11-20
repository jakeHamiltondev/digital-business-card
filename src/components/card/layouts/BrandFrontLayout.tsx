'use client'

// Layout A — Brand Front
// Front is 100% brand. Person info lives on the back.

import type { Profile } from '@/lib/types'
import type { Theme } from '@/lib/themes'
import type { LayoutFaceProps } from '../types'
import { generateCardColors, getContrastColor, type CardColorTokens } from '@/lib/color-utils'
import { getThemeCardColors } from '@/lib/themes'
import { getPersonaConfig } from '@/lib/persona-config'
import Avatar from '../shared/Avatar'
import ActionButtons from '../shared/ActionButtons'
import ContactRows from '../shared/ContactRows'
import SaveContactButton from '../shared/SaveContactButton'
import QRCodeMini from '@/components/QRCodeMini'

const SHADOW = '0 18px 40px -18px rgba(10,20,40,0.45), 0 2px 6px rgba(10,20,40,0.12)'

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function getInitials(name: string | null): string {
  if (!name?.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase()
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase()
}

function getOrgName(profile: Profile): string | null {
  const src = getPersonaConfig(profile.persona).vcard.orgSource
  return src === 'university'
    ? (profile.student_info?.university ?? null)
    : (profile.company ?? null)
}

function getTagline(profile: Profile): string | null {
  switch (profile.persona) {
    case 'student':
      return profile.student_info?.major ?? null
    case 'recruiter':
      return profile.recruiter_info?.hiring_focus ?? profile.department ?? null
    default:
      return profile.department ?? null
  }
}

/** Convert '#aabbcc' → '170,187,204' for use in rgba() */
function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `${r},${g},${b}`
}

// ── Front ─────────────────────────────────────────────────────────────────────

export function BrandFrontFront({ profile, userIsPro, t, hasResume }: LayoutFaceProps) {
  const hasBrandColors = userIsPro && !!profile.brand_color_primary
  const cc: CardColorTokens = hasBrandColors
    ? generateCardColors(profile.brand_color_primary, profile.brand_color_accent)
    : getThemeCardColors(profile.theme)
  const isDark = getContrastColor(cc.bg) === '#ffffff'

  const orgName  = getOrgName(profile)
  const tagline  = getTagline(profile)
  const initials = getInitials(profile.full_name)

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 18,
        overflow: 'hidden',
        background: `radial-gradient(ellipse at 50% 40%, rgba(${hexToRgb(cc.buttonBg)}, ${isDark ? 0.18 : 0.12}) 0%, ${cc.bg} 65%)`,
        boxShadow: SHADOW,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 16,
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      {/* Atmospheric brand glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 200,
          height: 200,
          background: `radial-gradient(circle, rgba(${hexToRgb(cc.buttonBg)}, ${isDark ? 0.12 : 0.08}) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Spacer pushes logo+text toward vertical center */}
      <div style={{ flex: 1 }} />

      {/* Logo or monogram */}
      {userIsPro && profile.logo_url && (profile.front_identity_display ?? 'both') !== 'name_only' ? (
        <div
          style={{
            background: `rgba(${hexToRgb(cc.buttonBg)}, ${isDark ? 0.15 : 0.08})`,
            border: `1px solid rgba(${hexToRgb(cc.buttonBg)}, ${isDark ? 0.25 : 0.15})`,
            borderRadius: 16,
            padding: '12px 16px',
            boxShadow: `0 0 30px rgba(${hexToRgb(cc.buttonBg)}, ${isDark ? 0.15 : 0.08})`,
            zIndex: 1,
          }}
        >
          <img
            src={profile.logo_url}
            alt="Logo"
            style={{
              height: 90,
              maxWidth: 180,
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            background: `rgba(${hexToRgb(cc.buttonBg)}, ${isDark ? 0.15 : 0.08})`,
            border: `1px solid rgba(${hexToRgb(cc.buttonBg)}, ${isDark ? 0.25 : 0.15})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 700,
            color: isDark ? '#ffffff' : cc.text,
            boxShadow: `0 0 30px rgba(${hexToRgb(cc.buttonBg)}, ${isDark ? 0.15 : 0.08})`,
            zIndex: 1,
          }}
        >
          {(orgName ?? profile.full_name ?? '?')[0]?.toUpperCase() ?? '?'}
        </div>
      )}

      {/* Company / university name */}
      {orgName && (profile.front_identity_display ?? 'both') !== 'logo_only' && (
        <p
          style={{
            color: cc.text,
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginTop: 14,
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {orgName}
        </p>
      )}

      {/* Job title */}
      {profile.title && (
        <p
          style={{
            color: cc.text,
            fontSize: 14,
            fontWeight: 400,
            opacity: 0.85,
            marginTop: 6,
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          {profile.title}
        </p>
      )}

      {/* Tagline / department */}
      {tagline && (
        <p
          style={{
            color: cc.text,
            fontSize: 13,
            opacity: 0.7,
            marginTop: 4,
            textAlign: 'center',
          }}
        >
          {tagline}
        </p>
      )}

      {/* Spacer pushes chip to bottom */}
      <div style={{ flex: 1 }} />

      {/* View Resume — subtle text link */}
      {hasResume && (
        <a
          href={`/${profile.username}/resume`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 12,
            color: cc.iconColor,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            marginBottom: 10,
            opacity: 0.8,
          }}
          onClick={e => e.stopPropagation()}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg>
          View Resume
        </a>
      )}

      {/* Initials chip — "tap to connect" */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.06)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.12)'}`,
          borderRadius: 999,
          padding: '6px 14px',
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 700,
            color: cc.text,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <span style={{ color: isDark ? 'rgba(255,255,255,0.7)' : cc.textMuted, fontSize: 12 }}>tap to connect</span>
      </div>
    </div>
  )
}

// ── Back ──────────────────────────────────────────────────────────────────────
// Person-centric: avatar + identity, action buttons, contact rows, QR, save.
// maxRows=3 keeps everything on-card without scrolling.

export function BrandFrontBack({ profile, pageUrl, userIsPro, t, hasResume }: LayoutFaceProps) {
  const hasBrandColors = userIsPro && !!profile.brand_color_primary
  const cc: CardColorTokens = hasBrandColors
    ? generateCardColors(profile.brand_color_primary, profile.brand_color_accent)
    : getThemeCardColors(profile.theme)
  const isDark = getContrastColor(cc.bg) === '#ffffff'
  const brandT = makeBrandTheme(cc, t)

  const orgName = getOrgName(profile)
  const selectedFields = profile.card_back_fields
  const showQR = !selectedFields || selectedFields.includes('qr')

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 18,
        overflow: 'hidden',
        background: `radial-gradient(ellipse at 50% 15%, rgba(${hexToRgb(cc.buttonBg)}, ${isDark ? 0.12 : 0.08}) 0%, ${cc.bg} 55%)`,
        boxShadow: SHADOW,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        display: 'flex',
        flexDirection: 'column',
        padding: '18px 16px 8px',
      }}
    >
      {/* Atmospheric brand glow (subtle) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 220,
          height: 140,
          background: `radial-gradient(circle, rgba(${hexToRgb(cc.buttonBg)}, ${isDark ? 0.08 : 0.05}) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Identity row: avatar + name/title/org side-by-side ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flexShrink: 0 }}>
          <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} t={brandT} size={72} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              color: cc.text,
              fontSize: 16,
              fontWeight: 700,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {profile.full_name || profile.username}
          </p>
          {profile.title && (
            <p
              style={{
                color: cc.textMuted,
                fontSize: 12,
                marginTop: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.35,
              }}
            >
              {profile.title}
            </p>
          )}
          {orgName && (
            <p
              style={{
                color: cc.textMuted,
                fontSize: 11,
                marginTop: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {orgName}
            </p>
          )}
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div style={{ marginTop: 12 }}>
        <ActionButtons profile={profile} t={brandT} selectedFields={selectedFields} />
      </div>

      {/* ── Contact rows (max 3 keeps layout on-card without scrolling) ── */}
      <div style={{ marginTop: 10 }}>
        <ContactRows profile={profile} pageUrl={pageUrl} t={brandT} maxRows={3} hideOverflowLink selectedFields={selectedFields} hasResume={hasResume} />
      </div>

      {/* Spacer pushes QR + save to bottom */}
      <div style={{ flex: 1 }} />

      {/* ── QR code ── */}
      {showQR && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
          <QRCodeMini url={`${pageUrl}?qr=1`} />
        </div>
      )}

      {/* ── Save contact ── */}
      <SaveContactButton profile={profile} bg={cc.buttonBg} textColor={cc.buttonText} />

      {!userIsPro && (
        <p
          style={{
            fontSize: 9,
            color: cc.textMuted,
            textAlign: 'center',
            marginTop: 8,
            opacity: 0.5,
            letterSpacing: '0.04em',
          }}
        >
          Made with Linkfol
        </p>
      )}
    </div>
  )
}
