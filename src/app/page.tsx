import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BusinessCard from '@/components/BusinessCard'
import { Pencil, QrCode } from 'lucide-react'
import type { Profile } from '@/lib/types'

const landingTitle = 'Linkfol — Your Digital Business Card for Every Opportunity'
const landingDescription =
  'Share your full professional profile with a QR scan. Perfect for career fairs, networking events, and making lasting impressions. No app needed.'

export const metadata: Metadata = {
  title: landingTitle,
  description: landingDescription,
  openGraph: {
    title: landingTitle,
    description: landingDescription,
  },
}

async function signInWithGoogle() {
  'use server'
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  if (error) throw error
  if (data.url) redirect(data.url)
}

const demoProfile: Profile = {
  id: 'demo',
  username: 'jordantaylor',
  full_name: 'Jordan Taylor',
  title: 'Marketing Major',
  company: 'State University, Class of 2026',
  bio: 'Marketing student passionate about brand strategy and digital media. Actively seeking internship opportunities in marketing and communications.',
  avatar_url: null,
  phone: null,
  email: 'jordan@example.com',
  website: null,
  social_links: {
    linkedin: 'https://linkedin.com/in/jordantaylor',
  },
  created_at: '',
  updated_at: '',
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  let profileCount = 0
  try {
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
    profileCount = count ?? 0
  } catch {
    profileCount = 0
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-28 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
            Your digital business card for every career fair, every handshake,{' '}
            <span className="text-zinc-400 dark:text-zinc-500">every opportunity.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
            Share your full professional profile with a QR scan. No app needed.
          </p>
          <div className="mt-10 flex flex-col items-center gap-5">
            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="rounded-xl bg-zinc-900 px-8 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Create your free card
              </button>
            </form>
            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                Already have an account? Sign in
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Demo card */}
      <section className="flex flex-col items-center bg-zinc-100 px-4 py-20 dark:bg-zinc-950">
        <p className="mb-10 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          See what your card could look like
        </p>
        <BusinessCard
          profile={demoProfile}
          pageUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://linkfol.co'}/jordantaylor`}
        />
      </section>

      {/* How it works */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-16 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            How it works
          </h2>
          <div className="grid gap-12 sm:grid-cols-3">
            {(
              [
                {
                  Icon: GoogleIcon,
                  step: '01',
                  title: 'Sign up in seconds',
                  description: 'One click with your Google account',
                },
                {
                  Icon: Pencil,
                  step: '02',
                  title: 'Build your card',
                  description: 'Add your info, photo, and social links',
                },
                {
                  Icon: QrCode,
                  step: '03',
                  title: 'Share anywhere',
                  description: 'At career fairs, networking events, or online',
                },
              ] as const
            ).map(({ Icon, step, title, description }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <Icon className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                  {step}
                </p>
                <h3 className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-zinc-100 px-4 py-16 text-center dark:bg-zinc-950">
        <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">
          Built by a UNCW grad for students who network
        </p>
        <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
          {profileCount > 0
            ? `Join ${profileCount.toLocaleString()} professionals on Linkfol`
            : 'Join professionals on Linkfol'}
        </p>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-28 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Ready to stand out?
        </h2>
        <div className="mt-8">
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="rounded-xl bg-zinc-900 px-8 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Create your free card
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
        © 2026 Linkfol
      </footer>
    </div>
  )
}
