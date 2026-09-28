'use client'

// Layout A — Brand Front
// Front is 100% brand. Person info lives on the back.

import type { Profile } from '@/lib/types'
import type { Theme } from '@/lib/themes'
import type { LayoutFaceProps } from '../types'
import { generateCardColors, type CardColorTokens } from '@/lib/color-utils'
import { getPersonaConfig } from '@/lib/persona-config'
import Avatar from '../shared/Avatar'
import ActionButtons from '../shared/ActionButtons'
import ContactRows from '../shared/ContactRows'
import SaveContactButton from '../shared/SaveContactButton'
import QRCodeMini from '@/components/QRCodeMini'

const SHADOW = '0 18px 40px -18px rgba(10,20,40,0.45), 0 2px 6px rgba(10,20,40,0.12)'
const LINKFOL_PRIMARY = '#6366f1'
const LINKFOL_ACCENT  = '#8b5cf6'

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

// ── Front ─────────────────────────────────────────────────────────────────────

export function BrandFrontFront({ profile, userIsPro, t }: LayoutFaceProps) {
  const rawPrimary = (userIsPro ? profile.brand_color_primary : null) ?? LINKFOL_PRIMARY
  const rawAccent  = (userIsPro ? profile.brand_color_accent  : null) ?? LINKFOL_ACCENT
  const cc = generateCardColors(
    userIsPro ? profile.brand_color_primary : null,
    userIsPro ? profile.brand_color_accent  : null,
  )

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
        background: rawPrimary,
        boxShadow: SHADOW,
        backfaceVisibility: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 16,
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      {/* Spacer pushes logo+text toward vertical center */}
      <div style={{ flex: 1 }} />

      {/* Logo or monogram */}
      {userIsPro && profile.logo_url ? (
        <img
          src={profile.logo_url}
          alt="Logo"
          style={{
            height: 110,
            maxWidth: 200,
            objectFit: 'contain',
            mixBlendMode: 'multiply',
          }}
        />
      ) : (
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            fontWeight: 700,
            color: cc.text,
          }}
        >
          {(orgName ?? profile.full_name ?? '?')[0]?.toUpperCase() ?? '?'}
        </div>
      )}

      {/* Company / university name */}
      {orgName && (
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

      {/* Initials chip — "tap to connect" */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.14)',
          border: '1px solid rgba(255,255,255,0.25)',
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
        <span style={{ color: cc.text, fontSize: 12 }}>tap to connect</span>
      </div>
    </div>
  )
}

// ── Back ──────────────────────────────────────────────────────────────────────
// Person-centric: avatar + identity, action buttons, contact rows, QR, save.
// maxRows=3 keeps everything on-card without scrolling.

export function BrandFrontBack({ profile, pageUrl, userIsPro, t, hasResume }: LayoutFaceProps) {
  const cc = generateCardColors(
    userIsPro ? profile.brand_color_primary : null,
    userIsPro ? profile.brand_color_accent  : null,
  )
  const brandT = makeBrandTheme(cc, t)

  const orgName = getOrgName(profile)

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
        transform: 'rotateY(180deg)',
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 16px 8px',
      }}
    >
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
                WebkitLineClamp: 3,
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

      {/* Resume link — gated until Pro launch (do not change false &&) */}
      {false && hasResume && (
        <a
          href={`/${profile.username}/resume`}
          className="mt-2 inline-block text-xs underline underline-offset-4"
          style={{ color: cc.textMuted }}
          onClick={e => e.stopPropagation()}
        >
          View my resume →
        </a>
      )}

      {/* ── Action buttons ── */}
      <div style={{ marginTop: 6 }}>
        <ActionButtons profile={profile} t={brandT} />
      </div>

      {/* ── Contact rows (max 3 keeps layout on-card without scrolling) ── */}
      <div style={{ marginTop: 6 }}>
        <ContactRows profile={profile} pageUrl={pageUrl} t={brandT} maxRows={3} hideOverflowLink />
      </div>

      {/* Spacer pushes QR + save to bottom */}
      <div style={{ flex: 1 }} />

      {/* ── QR code ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
        <QRCodeMini url={`${pageUrl}?qr=1`} />
      </div>

      {/* ── Save contact ── */}
      <SaveContactButton profile={profile} bg={cc.buttonBg} textColor={cc.buttonText} />
    </div>
  )
}
