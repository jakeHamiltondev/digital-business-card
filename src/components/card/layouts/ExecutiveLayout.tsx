'use client'

// Layout C — Executive Classic
// Paper-like, serif typography, fixed color palette. No photo.

import { Cormorant_Garamond } from 'next/font/google'
import { QRCodeSVG } from 'qrcode.react'
import type { LayoutFaceProps } from '../types'
import { getPersonaConfig } from '@/lib/persona-config'
import SaveContactButton from '../shared/SaveContactButton'

// Cormorant Garamond — loaded at module level per next/font requirements
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

// ── Fixed palette ─────────────────────────────────────────────────────────────
const PAPER  = '#fbfaf7'
const NAVY   = '#1d2a36'
const GOLD   = '#b39b76'
const CREAM  = '#efe9df'
const INK    = '#1d1510'
const WARM   = '#5a4f44'
const MUTED  = '#8a7b6e'

const SHADOW = '0 18px 40px -18px rgba(10,20,40,0.45), 0 2px 6px rgba(10,20,40,0.12)'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 0) return raw
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

function GoldRule() {
  return (
    <div
      style={{
        width: 64,
        height: 1,
        background: GOLD,
        margin: '12px auto',
      }}
    />
  )
}

// ── Front ─────────────────────────────────────────────────────────────────────

export function ExecutiveFront({ profile, userIsPro }: LayoutFaceProps) {
  const vcardCfg = getPersonaConfig(profile.persona).vcard

  const orgDisplay = vcardCfg.orgSource === 'university'
    ? (profile.student_info?.university ?? null)
    : (profile.company ?? null)

  const titleDisplay = vcardCfg.titleSource === 'major'
    ? (profile.student_info?.major ?? null)
    : (profile.title ?? profile.department ?? null)

  // Prefer personal location; fall back to work address city/state
  const addrDisplay = profile.location ?? (() => {
    if (profile.address_visibility === 'public' && profile.work_address) {
      const a = profile.work_address
      const cs = [a.city, a.state].filter(Boolean).join(', ')
      return cs || a.country || null
    }
    return null
  })()

  const phones =
    (profile.phones?.length ?? 0) > 0
      ? profile.phones
      : profile.phone
        ? [{ type: 'mobile' as const, number: profile.phone }]
        : []

  const primaryPhone = phones?.[0]?.number ?? null

  const contactItems = [
    addrDisplay,
    primaryPhone ? formatPhone(primaryPhone) : null,
    profile.email,
  ].filter(Boolean) as string[]

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 18,
        overflow: 'hidden',
        background: PAPER,
        boxShadow: SHADOW,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 24px',
      }}
    >
      {/* Logo — Pro + logo only */}
      {userIsPro && profile.logo_url && (
        <>
          <img
            src={profile.logo_url}
            alt="Logo"
            style={{ height: 68, maxWidth: 180, objectFit: 'contain', marginBottom: 8 }}
          />
        </>
      )}

      {/* Company / university name */}
      {orgDisplay && (
        <p
          style={{
            fontFamily: cormorant.style.fontFamily,
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: WARM,
            textAlign: 'center',
            marginBottom: userIsPro && profile.logo_url ? 0 : 0,
          }}
        >
          {orgDisplay}
        </p>
      )}

      <GoldRule />

      {/* Full name — small-caps */}
      <h1
        style={{
          fontFamily: cormorant.style.fontFamily,
          fontWeight: 500,
          fontSize: 28,
          fontVariant: 'small-caps',
          color: INK,
          textAlign: 'center',
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        {profile.full_name || profile.username}
      </h1>

      {/* Title — italic */}
      {titleDisplay && (
        <p
          style={{
            fontFamily: cormorant.style.fontFamily,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 17,
            color: WARM,
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          {titleDisplay}
        </p>
      )}

      <GoldRule />

      {/* Contact stack */}
      {contactItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          {contactItems.map((item, i) => (
            <p
              key={i}
              style={{
                fontFamily: cormorant.style.fontFamily,
                fontWeight: 500,
                fontSize: 12,
                color: MUTED,
                textAlign: 'center',
                margin: 0,
              }}
            >
              {item}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Back ──────────────────────────────────────────────────────────────────────

export function ExecutiveBack({ profile, pageUrl, userIsPro, hasResume }: LayoutFaceProps) {
  const vcardCfg = getPersonaConfig(profile.persona).vcard

  const orgDisplay = vcardCfg.orgSource === 'university'
    ? (profile.student_info?.university ?? null)
    : (profile.company ?? null)

  // Build contact items for the middle section
  const addrDisplay = (() => {
    if (profile.address_visibility === 'public' && profile.work_address) {
      const a = profile.work_address
      const cs = [a.city, a.state].filter(Boolean).join(', ')
      return cs || a.country || null
    }
    return profile.location ?? null
  })()

  const phones =
    (profile.phones?.length ?? 0) > 0
      ? profile.phones
      : profile.phone
        ? [{ type: 'mobile' as const, number: profile.phone }]
        : []

  const primaryPhone = phones?.[0]?.number ?? null
  const selectedFields = profile.card_back_fields
  const showQR = !selectedFields || selectedFields.includes('qr')
  const sl = profile.social_links

  const contactItems: string[] = []
  if (primaryPhone && (!selectedFields || selectedFields.includes('phone')))
    contactItems.push(formatPhone(primaryPhone))
  if (profile.email && (!selectedFields || selectedFields.includes('email')))
    contactItems.push(profile.email)
  if (addrDisplay && (!selectedFields || selectedFields.includes('location')))
    contactItems.push(addrDisplay)
  if (sl?.linkedin && (!selectedFields || selectedFields.includes('linkedin')))
    contactItems.push(sl.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\//, '').replace(/\/$/, ''))
  if (sl?.twitter && (!selectedFields || selectedFields.includes('twitter')))
    contactItems.push(sl.twitter.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))
  if (sl?.instagram && (!selectedFields || selectedFields.includes('instagram')))
    contactItems.push(sl.instagram.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))
  if (sl?.github && (!selectedFields || selectedFields.includes('github')))
    contactItems.push(sl.github.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, ''))
  if (sl?.tiktok && (!selectedFields || selectedFields.includes('tiktok')))
    contactItems.push(sl.tiktok.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))
  if (profile.website && (!selectedFields || selectedFields.includes('website')))
    contactItems.push(profile.website.replace(/^https?:\/\//, ''))

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 18,
        overflow: 'hidden',
        background: NAVY,
        boxShadow: SHADOW,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 24px 24px',
      }}
    >
      {/* ── Top: logo + company name + rule ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        {userIsPro && profile.logo_url && (
          <img
            src={profile.logo_url}
            alt="Logo"
            style={{
              height: 62,
              maxWidth: 180,
              objectFit: 'contain',
            }}
          />
        )}

        {orgDisplay && (
          <p
            style={{
              fontFamily: cormorant.style.fontFamily,
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: CREAM,
              textAlign: 'center',
            }}
          >
            {orgDisplay}
          </p>
        )}

        <div style={{ width: 64, height: 1, background: GOLD }} />
      </div>

      {/* ── Middle: contact rows ── */}
      {contactItems.length > 0 && (
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            width: '100%',
          }}
        >
          {contactItems.map((item, i) => (
            <p
              key={i}
              style={{
                fontFamily: cormorant.style.fontFamily,
                fontWeight: 500,
                fontSize: 13,
                color: CREAM,
                textAlign: 'center',
                margin: 0,
                opacity: 0.85,
              }}
            >
              {item}
            </p>
          ))}
        </div>
      )}

      {/* Resume link — shows when user has a resume (uploaded or built) */}
      {hasResume && (
        <a
          href={`/${profile.username}/resume`}
          style={{ color: GOLD, fontSize: 12, textDecoration: 'underline' }}
          onClick={e => e.stopPropagation()}
        >
          View my resume →
        </a>
      )}

      {/* Spacer pushes QR + save to bottom */}
      <div style={{ flex: 1 }} />

      {/* ── Bottom: QR + save button ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          width: '100%',
        }}
      >
        {/* QR — cream tinted */}
        {showQR && (
          <div
            style={{
              background: CREAM,
              borderRadius: 10,
              padding: 6,
            }}
          >
            <QRCodeSVG
              value={`${pageUrl}?qr=1`}
              size={72}
              marginSize={1}
              fgColor={NAVY}
              bgColor={CREAM}
            />
          </div>
        )}

        <SaveContactButton
          profile={profile}
          bg={GOLD}
          textColor={NAVY}
        />
      </div>
    </div>
  )
}
