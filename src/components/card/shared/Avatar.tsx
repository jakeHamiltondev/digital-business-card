'use client'

import type { Theme } from '@/lib/themes'

export default function Avatar({
  name,
  avatarUrl,
  t,
  size = 96,
  ringColor,
}: {
  name: string | null
  avatarUrl: string | null
  t: Theme
  size?: number
  ringColor?: string
}) {
  const px = `${size}px`
  const ring = ringColor ?? t.colors.avatarRing
  const ringStyle: React.CSSProperties = { boxShadow: `0 0 0 4px ${ring}` }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? 'Profile photo'}
        className="rounded-full object-cover object-top"
        style={{ width: px, height: px, ...ringStyle }}
      />
    )
  }

  const initial = name?.trim().charAt(0).toUpperCase() ?? '?'

  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold"
      style={{
        width: px,
        height: px,
        fontSize: Math.round(size * 0.35),
        backgroundColor: t.colors.avatarInitialBg,
        color: t.colors.avatarInitialText,
        ...ringStyle,
      }}
    >
      {initial}
    </div>
  )
}
