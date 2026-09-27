'use client'

import type { Profile } from '@/lib/types'
import CardContainer from '@/components/card/CardContainer'

// Thin wrapper — kept for backward compatibility with existing imports.
// All rendering logic lives in src/components/card/.
export default function BusinessCard({
  profile,
  pageUrl,
  theme,
  hasResume,
}: {
  profile: Profile
  pageUrl: string
  theme?: string
  hasResume?: boolean
}) {
  return (
    <CardContainer
      profile={profile}
      pageUrl={pageUrl}
      theme={theme}
      hasResume={hasResume}
    />
  )
}
