'use client'

import { useState } from 'react'

interface Props {
  isLoggedIn: boolean
  isPro: boolean
}

export default function PricingButtons({ isLoggedIn, isPro }: Props) {
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)

  if (isPro) {
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="rounded-full bg-violet-100 px-4 py-1.5 text-sm font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
          Current plan
        </span>
      </div>
    )
  }

  const handleCheckout = async (plan: 'monthly' | 'yearly') => {
    if (!isLoggedIn) {
      window.location.href = '/'
      return
    }
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setLoading(null)
      }
    } catch {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => handleCheckout('monthly')}
        disabled={!!loading}
        className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
      >
        {loading === 'monthly' ? 'Redirecting…' : 'Go Monthly — $5/mo'}
      </button>
      <button
        onClick={() => handleCheckout('yearly')}
        disabled={!!loading}
        className="rounded-xl border border-violet-200 bg-violet-50 px-5 py-3 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-60 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-300 dark:hover:bg-violet-900/40"
      >
        {loading === 'yearly' ? 'Redirecting…' : 'Go Yearly — $49/yr'}
      </button>
      <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">Save 18% with annual billing</p>
    </div>
  )
}
