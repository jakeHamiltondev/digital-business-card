'use client'

import { useState, useEffect } from 'react'
import type { Profile } from '@/lib/types'
import type { Theme } from '@/lib/themes'
import { getTheme } from '@/lib/themes'
import { isPro } from '@/lib/subscription'
import CardFront from './CardFront'
import CardBack from './CardBack'

function applyBrandColors(t: Theme, profile: Profile, userIsPro: boolean): Theme {
  if (!userIsPro) return t
  const primary = profile.brand_color_primary
  const accent = profile.brand_color_accent
  if (!primary && !accent) return t
  return {
    ...t,
    colors: {
      ...t.colors,
      ...(primary ? { iconColor: primary, avatarRing: primary } : {}),
      ...(accent ? { textSecondary: accent } : {}),
    },
  }
}

export default function CardContainer({
  profile,
  pageUrl,
  theme: themeId,
  hasResume,
}: {
  profile: Profile
  pageUrl: string
  theme?: string
  hasResume?: boolean
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [hideFront, setHideFront] = useState(false)

  useEffect(() => {
    setHideFront(isFlipped)
  }, [isFlipped])

  const userIsPro = isPro(profile)
  const baseTheme = getTheme(themeId ?? profile.theme)
  const t = applyBrandColors(baseTheme, profile, userIsPro)

  const handleFlip = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return
    setIsFlipped(prev => !prev)
  }

  return (
    <div
      className="mx-auto cursor-pointer select-none"
      style={{ width: 280, perspective: '1200px', WebkitPerspective: '1200px' }}
      onClick={handleFlip}
    >
      <div
        className="relative"
        style={{
          width: 280,
          height: 420,
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            opacity: hideFront ? 0 : 1,
          }}
        >
          <CardFront
            profile={profile}
            pageUrl={pageUrl}
            userIsPro={userIsPro}
            t={t}
            hasResume={hasResume}
          />
        </div>
        <CardBack
          profile={profile}
          pageUrl={pageUrl}
          userIsPro={userIsPro}
          t={t}
          hasResume={hasResume}
        />
      </div>
    </div>
  )
}
