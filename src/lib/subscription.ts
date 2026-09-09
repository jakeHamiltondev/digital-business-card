import type { Profile } from './types'

export function isPro(profile: Profile): boolean {
  if (profile.plan !== 'pro') return false
  if (!profile.subscription_end_date) return true
  return new Date(profile.subscription_end_date) > new Date()
}

export function getSubscriptionStatus(profile: Profile): 'free' | 'pro' | 'expired' {
  if (profile.plan !== 'pro') return 'free'
  if (!profile.subscription_end_date) return 'pro'
  if (new Date(profile.subscription_end_date) > new Date()) return 'pro'
  return 'expired'
}
