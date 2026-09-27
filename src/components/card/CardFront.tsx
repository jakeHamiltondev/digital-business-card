'use client'

import type { LayoutFaceProps } from './types'
import { LetterheadFront } from './layouts/LetterheadLayout'
import { BrandFrontFront } from './layouts/BrandFrontLayout'
import { ExecutiveFront } from './layouts/ExecutiveLayout'
import { PhotoHeroFront } from './layouts/PhotoHeroLayout'

export default function CardFront(props: LayoutFaceProps) {
  switch (props.profile.card_layout ?? 'letterhead') {
    case 'brand_front':      return <BrandFrontFront {...props} />
    case 'executive_classic': return <ExecutiveFront {...props} />
    case 'photo_hero':       return <PhotoHeroFront {...props} />
    default:                 return <LetterheadFront {...props} />
  }
}
