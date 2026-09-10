import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isPro } from '@/lib/subscription'
import type { Profile } from '@/lib/types'
import PricingButtons from './PricingButtons'

export const metadata: Metadata = {
  title: 'Pricing | Linkfol',
}

const freeFeatures = [
  '1 digital business card',
  'QR code + shareable link',
  '5 card themes',
  'Save contacts to My Cards',
  'vCard download',
]

const proFeatures = [
  'Everything in Free, plus:',
  'Resume builder + AI assistant',
  'Card analytics',
  'Remove Linkfol branding',
  'Up to 3 cards',
  'Apple Wallet card',
  'Custom theme colors',
]

const proComingSoon = new Set([
  'Resume builder + AI assistant',
  'Card analytics',
  'Remove Linkfol branding',
  'Up to 3 cards',
  'Apple Wallet card',
  'Custom theme colors',
])

export default async function PricingPage() {
  redirect('/dashboard')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userIsPro = false
  let isOnFree = false

  if (user) {
    const userId = user!.id
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, subscription_end_date')
      .eq('id', userId)
      .maybeSingle()

    if (profile) {
      userIsPro = isPro(profile as Profile)
      isOnFree = !userIsPro
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Simple, honest pricing
          </h1>
          <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400">
            Start free. Upgrade when you&apos;re ready.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Free tier */}
          <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Free</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">$0</span>
                <span className="text-zinc-500 dark:text-zinc-400">/mo</span>
              </div>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Forever free</p>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{feature}</span>
                </li>
              ))}
            </ul>

            {user && isOnFree && (
              <span className="rounded-lg border border-zinc-200 px-4 py-2.5 text-center text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
                Your current plan
              </span>
            )}
          </div>

          {/* Pro tier */}
          <div className="flex flex-col rounded-2xl border-2 border-violet-500 bg-white p-8 shadow-sm dark:bg-zinc-900">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Pro</h2>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                  Most popular
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">$5</span>
                <span className="text-zinc-500 dark:text-zinc-400">/mo</span>
              </div>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">or $49/yr — save 18%</p>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {feature}
                    {proComingSoon.has(feature) && (
                      <span className="ml-1.5 rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                        coming soon
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <PricingButtons isLoggedIn={!!user} isPro={userIsPro} />
          </div>
        </div>
      </main>
    </div>
  )
}
