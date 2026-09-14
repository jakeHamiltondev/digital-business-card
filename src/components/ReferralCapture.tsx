'use client'

import { useEffect } from 'react'

export default function ReferralCapture({ referralCode }: { referralCode: string }) {
  useEffect(() => {
    document.cookie = `lf_ref=${encodeURIComponent(referralCode)};path=/;max-age=2592000;SameSite=Lax`
    try {
      localStorage.setItem('lf_ref', referralCode)
    } catch {}
  }, [referralCode])
  return null
}
