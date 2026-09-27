import type { Profile } from './types'

const DEV_BYPASS_EMAIL = 'jh0695@gmail.com'

export function isPro(profile: Profile): boolean {
  if (profile.email === DEV_BYPASS_EMAIL) return true
  if (profile.plan !== 'pro') return false
  if (!profile.subscription_end_date) return true
  return new Date(profile.subscription_end_date) > new Date()
}

export function getSubscriptionStatus(profile: Profile): 'free' | 'pro' | 'expired' {
  if (profile.email === DEV_BYPASS_EMAIL) return 'pro'
  if (profile.plan !== 'pro') return 'free'
  if (!profile.subscription_end_date) return 'pro'
  if (new Date(profile.subscription_end_date) > new Date()) return 'pro'
  return 'expired'
}
