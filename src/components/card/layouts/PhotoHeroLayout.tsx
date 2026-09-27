'use client'

// Layout D — Photo Hero
// Full implementation coming in Part 7.

import type { LayoutFaceProps } from '../types'
import ContactRows from '../shared/ContactRows'
import QRSection from '../shared/QRSection'

const FACE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: 18,
  overflow: 'hidden',
  border: '1px solid',
}

export function PhotoHeroFront({ t }: LayoutFaceProps) {
  return (
    <div
      style={{
        ...FACE,
        background: t.colors.background,
        borderColor: t.colors.border,
        backfaceVisibility: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <p style={{ color: t.colors.textSecondary, fontSize: 13, fontWeight: 600 }}>Photo Hero</p>
      <p style={{ color: t.colors.mutedText, fontSize: 11 }}>Layout D — coming soon</p>
    </div>
  )
}

export function PhotoHeroBack({ profile, pageUrl, t }: LayoutFaceProps) {
  return (
    <div
      style={{
        ...FACE,
        background: t.colors.background,
        borderColor: t.colors.border,
        backfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
      }}
    >
      <div style={{ flex: 1 }}>
        <ContactRows profile={profile} pageUrl={pageUrl} t={t} />
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', justifyContent: 'center' }}>
        <QRSection url={`${pageUrl}?qr=1`} label="Tap to flip back" t={t} />
      </div>
    </div>
  )
}
