import Link from 'next/link'
import { isPro } from '@/lib/subscription'
import type { Profile } from '@/lib/types'
import ManageSubscriptionButton from './ManageSubscriptionButton'

export default function SubscriptionSection({ profile }: { profile: Profile }) {
  const userIsPro = isPro(profile)

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Subscription
      </h2>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Current plan</p>
            <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-50">
              {userIsPro ? 'Pro' : 'Free'}
            </p>
            {userIsPro && profile.subscription_end_date && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Renews{' '}
                {new Date(profile.subscription_end_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
          {userIsPro ? (
            <ManageSubscriptionButton />
          ) : (
            <Link
              href="/pricing"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
