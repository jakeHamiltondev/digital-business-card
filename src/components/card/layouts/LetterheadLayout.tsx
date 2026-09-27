'use client'

import type { LayoutFaceProps } from '../types'
import { generateCardColors } from '@/lib/color-utils'
import { getPersonaConfig, getCardFrontValue, type CardFrontFieldKey } from '@/lib/persona-config'
import Avatar from '../shared/Avatar'
import ActionButtons from '../shared/ActionButtons'
import ContactRows from '../shared/ContactRows'
import SaveContactButton from '../shared/SaveContactButton'
import QRCodeMini from '@/components/QRCodeMini'

const SHADOW = '0 18px 40px -18px rgba(10,20,40,0.45), 0 2px 6px rgba(10,20,40,0.12)'

// ── Persona subtitle lines (front) ────────────────────────────────────────────
// Renders persona-specific fields below the name. Excludes name, logo, and
// scheduling_link (scheduling link is a contact row on the back).

function PersonaSubtitleLines({
  profile,
  t,
}: Pick<LayoutFaceProps, 'profile' | 't'>) {
  const config = getPersonaConfig(profile.persona)
  const nodes: React.ReactNode[] = []
  let lineIdx = 0

  for (const { key, proOnly } of config.cardFront) {
    if (proOnly) continue
    if (key === 'name') continue
    if (key === 'scheduling_link') continue

    if (key === 'recruiter_badge') {
      nodes.push(
        <span
          key="badge"
          style={{
            marginTop: 6,
            display: 'inline-flex',
            alignItems: 'center',
            background: t.colors.contactBg,
            color: t.colors.contactText,
            border: `1px solid ${t.colors.contactBorder}`,
            borderRadius: 999,
            padding: '2px 10px',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Recruiter
        </span>
      )
      continue
    }

    const value = getCardFrontValue(profile, key as CardFrontFieldKey)
    if (!value) continue

    const isFirst = lineIdx === 0
    lineIdx++

    nodes.push(
      <p
        key={key}
        style={{
          color: isFirst ? t.colors.textSecondary : t.colors.mutedText,
          fontSize: isFirst ? 14 : 12,
          fontWeight: isFirst ? 500 : 400,
          marginTop: isFirst ? 4 : 2,
          textAlign: 'center',
        }}
      >
        {value}
      </p>
    )
  }

  return <>{nodes}</>
}

// ── Back header org name (resolves company or university by persona) ───────────

function orgName(profile: LayoutFaceProps['profile']): string | null {
  const src = getPersonaConfig(profile.persona).vcard.orgSource
  return src === 'university'
    ? (profile.student_info?.university ?? null)
    : (profile.company ?? null)
}

// ── Front ─────────────────────────────────────────────────────────────────────

export function LetterheadFront({ profile, pageUrl, userIsPro, t }: LayoutFaceProps) {
  const cc = generateCardColors(
    userIsPro ? profile.brand_color_primary : null,
    userIsPro ? profile.brand_color_accent : null,
  )

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 18,
        overflow: 'hidden',
        background: t.colors.background,
        boxShadow: SHADOW,
        backfaceVisibility: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Brand band (150px) ── */}
      <div
        style={{
          height: 150,
          flexShrink: 0,
          background: cc.bgGradient,
          position: 'relative',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        {/* Logo top-left — Pro users with logo only */}
        {userIsPro && profile.logo_url && (
          <img
            src={profile.logo_url}
            alt="Logo"
            style={{ height: 32, maxWidth: 100, objectFit: 'contain' }}
          />
        )}
        {/* 5px accent stripe at band bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 5,
            background: cc.buttonBg,
          }}
        />
      </div>

      {/* ── Card body ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 16px 16px',
          overflow: 'hidden',
        }}
      >
        {/* Avatar overlapping band by 50px, 4px white ring */}
        <div style={{ marginTop: -50 }}>
          <Avatar
            name={profile.full_name}
            avatarUrl={profile.avatar_url}
            t={t}
            size={96}
            ringColor="#ffffff"
          />
        </div>

        <h1
          style={{
            color: t.colors.text,
            fontSize: 19,
            fontWeight: 700,
            marginTop: 10,
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {profile.full_name || profile.username}
        </h1>

        <PersonaSubtitleLines profile={profile} t={t} />

        {/* Push action buttons to bottom */}
        <div style={{ flex: 1 }} />

        <ActionButtons profile={profile} t={t} />
      </div>
    </div>
  )
}

// ── Back ──────────────────────────────────────────────────────────────────────

export function LetterheadBack({ profile, pageUrl, userIsPro, t, hasResume }: LayoutFaceProps) {
  const cc = generateCardColors(
    userIsPro ? profile.brand_color_primary : null,
    userIsPro ? profile.brand_color_accent : null,
  )

  const org = orgName(profile)

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 18,
        overflow: 'hidden',
        background: t.colors.background,
        boxShadow: SHADOW,
        backfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Branded header bar ── */}
      <div
        style={{
          height: 40,
          flexShrink: 0,
          background: cc.bgGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 14px',
        }}
      >
        {userIsPro && profile.logo_url ? (
          <img
            src={profile.logo_url}
            alt="Logo"
            style={{ height: 24, maxWidth: 100, objectFit: 'contain' }}
          />
        ) : (
          <span
            style={{
              color: cc.text,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {org || profile.full_name || profile.username}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '10px 16px 12px',
          overflow: 'hidden',
        }}
      >
        {/* Resume link — gated until Pro launch (do not change false &&) */}
        {false && hasResume && (
          <a
            href={`/${profile.username}/resume`}
            className="mb-2 inline-block text-sm underline underline-offset-4"
            style={{ color: t.colors.textSecondary }}
            onClick={e => e.stopPropagation()}
          >
            View my resume →
          </a>
        )}

        <ContactRows profile={profile} pageUrl={pageUrl} t={t} maxRows={5} />

        {/* Spacer pushes QR + button to bottom */}
        <div style={{ flex: 1 }} />

        {/* QR code — back only */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <QRCodeMini url={`${pageUrl}?qr=1`} />
        </div>

        <SaveContactButton
          profile={profile}
          bg={cc.buttonBg}
          textColor={cc.buttonText}
        />
      </div>
    </div>
  )
}
