import type { Theme } from '@/lib/themes'
import type { Profile } from '@/lib/types'

export type LayoutFaceProps = {
  profile: Profile
  pageUrl: string
  userIsPro: boolean
  t: Theme
  hasResume?: boolean
}
