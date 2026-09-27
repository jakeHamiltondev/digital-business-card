'use client'

import type { LayoutFaceProps } from './types'
import { LetterheadBack } from './layouts/LetterheadLayout'
import { BrandFrontBack } from './layouts/BrandFrontLayout'
import { ExecutiveBack } from './layouts/ExecutiveLayout'
import { PhotoHeroBack } from './layouts/PhotoHeroLayout'

export default function CardBack(props: LayoutFaceProps) {
  switch (props.profile.card_layout ?? 'letterhead') {
    case 'brand_front':       return <BrandFrontBack {...props} />
    case 'executive_classic': return <ExecutiveBack {...props} />
    case 'photo_hero':        return <PhotoHeroBack {...props} />
    default:                  return <LetterheadBack {...props} />
  }
}
