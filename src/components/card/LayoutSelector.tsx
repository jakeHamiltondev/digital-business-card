'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'

export type CardLayout = 'letterhead' | 'brand_front' | 'executive_classic' | 'photo_hero'

const LAYOUTS: { id: CardLayout; name: string; proOnly: boolean }[] = [
  { id: 'letterhead',        name: 'Letterhead',  proOnly: false },
  { id: 'brand_front',       name: 'Brand Front', proOnly: true  },
  { id: 'executive_classic', name: 'Executive',   proOnly: true  },
  { id: 'photo_hero',        name: 'Photo Hero',  proOnly: true  },
]

// ── Thumbnail sketches ────────────────────────────────────────────────────────
// Fixed 80×120px (portrait 2:3). Illustrate layout structure, not live data.

const GRAD = 'linear-gradient(135deg, #6366f1, #8b5cf6)'
const DARK = '#18181c'
const GOLD = '#b39b76'

function LetterheadThumb() {
  return (
    <div style={{ width: 80, height: 120, background: DARK, borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
      {/* Brand band */}
      <div style={{ height: 38, background: GRAD }} />
      {/* Avatar overlapping band */}
      <div style={{
        position: 'absolute', top: 26, left: '50%', transform: 'translateX(-50%)',
        width: 22, height: 22, borderRadius: '50%',
        background: '#3f3f5a', border: '2px solid #fff',
      }} />
      {/* Name + title */}
      <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <div style={{ height: 3, width: 36, borderRadius: 2, background: 'rgba(255,255,255,0.55)' }} />
        <div style={{ height: 2, width: 24, borderRadius: 2, background: 'rgba(255,255,255,0.25)' }} />
      </div>
      {/* Contact rows */}
      <div style={{ padding: '8px 10px 0', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[38, 30, 26].map((w, i) => (
          <div key={i} style={{ height: 2, width: w, borderRadius: 2, background: 'rgba(255,255,255,0.18)' }} />
        ))}
      </div>
      {/* Save button */}
      <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, height: 12, borderRadius: 4, background: GRAD, opacity: 0.85 }} />
    </div>
  )
}

function BrandFrontThumb() {
  return (
    <div style={{ width: 80, height: 120, borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0, background: `radial-gradient(circle at 30% 30%, #6366f1, #8b5cf6)` }}>
      {/* Monogram circle */}
      <div style={{
        position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)',
        width: 24, height: 24, borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 700, color: '#fff',
      }}>
        JH
      </div>
      {/* Company name + tagline */}
      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <div style={{ height: 3, width: 42, borderRadius: 2, background: 'rgba(255,255,255,0.8)' }} />
        <div style={{ height: 2, width: 28, borderRadius: 2, background: 'rgba(255,255,255,0.45)' }} />
      </div>
      {/* Chip at bottom */}
      <div style={{
        position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
        width: 52, height: 14, borderRadius: 999,
        background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
      }} />
    </div>
  )
}

function ExecutiveThumb() {
  return (
    <div style={{ width: 80, height: 120, background: '#fbfaf7', borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
      {/* Company name */}
      <div style={{ position: 'absolute', top: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ height: 2, width: 38, borderRadius: 2, background: '#8a7b6e' }} />
      </div>
      {/* Gold rule */}
      <div style={{ position: 'absolute', top: 27, left: '50%', transform: 'translateX(-50%)', width: 24, height: 1, background: GOLD }} />
      {/* Full name (larger) */}
      <div style={{ position: 'absolute', top: 37, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <div style={{ height: 4, width: 44, borderRadius: 2, background: '#1d1510' }} />
        <div style={{ height: 2, width: 30, borderRadius: 2, background: '#5a4f44' }} />
      </div>
      {/* Gold rule */}
      <div style={{ position: 'absolute', top: 56, left: '50%', transform: 'translateX(-50%)', width: 24, height: 1, background: GOLD }} />
      {/* Contact stack */}
      <div style={{ position: 'absolute', top: 65, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        {[28, 36, 28].map((w, i) => (
          <div key={i} style={{ height: 2, width: w, borderRadius: 2, background: '#8a7b6e' }} />
        ))}
      </div>
    </div>
  )
}

function PhotoHeroThumb() {
  return (
    <div style={{ width: 80, height: 120, background: DARK, borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
      {/* Photo area (top 60%) */}
      <div style={{ height: 72, background: GRAD, position: 'relative' }}>
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.65) 100%)',
        }} />
        {/* Name + title on photo */}
        <div style={{ position: 'absolute', bottom: 7, left: 8 }}>
          <div style={{ height: 3, width: 34, borderRadius: 2, background: '#fff' }} />
          <div style={{ height: 2, width: 22, borderRadius: 2, background: 'rgba(255,255,255,0.65)', marginTop: 3 }} />
        </div>
      </div>
      {/* Bottom strip: action buttons */}
      <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>
    </div>
  )
}

const THUMB: Record<CardLayout, () => React.ReactNode> = {
  letterhead:        () => <LetterheadThumb />,
  brand_front:       () => <BrandFrontThumb />,
  executive_classic: () => <ExecutiveThumb />,
  photo_hero:        () => <PhotoHeroThumb />,
}

// ── LayoutSelector ────────────────────────────────────────────────────────────

export default function LayoutSelector({
  value,
  onChange,
  userIsPro,
}: {
  value: string
  onChange: (layout: CardLayout) => void
  userIsPro: boolean
}) {
  const [showUpgradeHint, setShowUpgradeHint] = useState(false)

  function handleClick(layout: typeof LAYOUTS[number]) {
    if (!userIsPro && layout.proOnly) {
      setShowUpgradeHint(true)
      return
    }
    setShowUpgradeHint(false)
    onChange(layout.id)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {LAYOUTS.map((layout) => {
          const locked = !userIsPro && layout.proOnly
          const selected = value === layout.id

          return (
            <button
              key={layout.id}
              type="button"
              onClick={() => handleClick(layout)}
              className={`group flex-shrink-0 flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500`}
              aria-label={`${layout.name} layout${locked ? ' (Pro)' : ''}`}
              aria-pressed={selected}
            >
              {/* Thumbnail wrapper */}
              <div
                className="relative transition-all"
                style={{
                  borderRadius: 10,
                  border: selected
                    ? '2px solid #6366f1'
                    : '2px solid transparent',
                  outline: selected ? 'none' : undefined,
                  boxShadow: selected
                    ? '0 0 0 1px #6366f1'
                    : '0 0 0 1px rgba(0,0,0,0.1)',
                  opacity: locked ? 0.55 : 1,
                }}
              >
                {THUMB[layout.id]()}

                {/* Lock overlay for Pro-only layouts on free tier */}
                {locked && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.35)',
                    }}
                  >
                    <Lock className="h-4 w-4 text-white drop-shadow" />
                  </div>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium ${
                  selected
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {layout.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Upgrade hint — shown when free user clicks a Pro layout */}
      {showUpgradeHint && !userIsPro && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Card layouts are available on Pro
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                Upgrade to unlock Brand Front, Executive, and Photo Hero.
              </p>
              <a
                href="/pricing"
                className="mt-2 inline-block text-xs font-medium text-zinc-900 underline underline-offset-2 hover:no-underline dark:text-zinc-100"
              >
                View Pro plans →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
