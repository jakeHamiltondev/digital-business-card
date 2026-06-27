import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BusinessCard from '@/components/BusinessCard'
import { Pencil, QrCode, Users } from 'lucide-react'
import type { Profile } from '@/lib/types'

const landingTitle = 'Linkfol — Your Professional Identity, One Link Away'
const landingDescription =
  'Create a digital business card you can share with anyone. Perfect for networking, career fairs, and making lasting first impressions.'

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
  username: 'alexmorgan',
  full_name: 'Alex Morgan',
  title: 'Product Designer',
  company: 'Acme Co',
  bio: 'I design products that people love. Focused on simplicity, usability, and creating experiences that make work feel effortless.',
  avatar_url: null,
  phone: null,
  email: 'alex@acme.co',
  website: 'https://alexmorgan.co',
  social_links: {
    linkedin: '#',
    twitter: '#',
  },
  created_at: '',
  updated_at: '',
}

const features = [
  {
    Icon: Pencil,
    title: 'Create',
    description:
      'Build your digital business card in minutes. Add your photo, contact info, social links, and a personal bio.',
  },
  {
    Icon: QrCode,
    title: 'Share',
    description:
      'Every card comes with a unique link and QR code. Share it anywhere — email, LinkedIn, or print it out.',
  },
  {
    Icon: Users,
    title: 'Connect',
    description:
      'Make a lasting impression at networking events, career fairs, and interviews. No paper required.',
  },
]

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="flex min-h-screen scroll-smooth flex-col bg-zinc-50 dark:bg-black">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
          Your Professional Identity,{' '}
          <span className="text-zinc-400 dark:text-zinc-500">One Link Away</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
          Create a digital business card you can share with anyone. Perfect for
          networking, career fairs, and making lasting first impressions.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3">
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="rounded-xl bg-zinc-900 px-8 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Get Started — it's free
            </button>
          </form>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">No app download needed</p>
        </div>
      </section>

      {/* Demo card preview */}
      <section className="flex flex-col items-center bg-zinc-100 px-4 py-20 dark:bg-zinc-950">
        <p className="mb-10 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          See what your card looks like
        </p>
        <BusinessCard
          profile={demoProfile}
          pageUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://linkfol.co'}/alexmorgan`}
        />
      </section>

      {/* Features */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-16 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Everything you need, nothing you don't
          </h2>
          <div className="grid gap-12 sm:grid-cols-3">
            {features.map(({ Icon, title, description }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <Icon className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
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

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
        © 2026 Linkfol
      </footer>
    </div>
  )
}
