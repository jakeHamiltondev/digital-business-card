import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LinkfolLogo from '@/components/LinkfolLogo'
import VeteranBadge from '@/components/VeteranBadge'
import ReferralCapture from '@/components/ReferralCapture'
import PhoneMockup from '@/components/landing/PhoneMockup'
import { GraduationCap, Briefcase, Users, Pencil, QrCode, Check, X } from 'lucide-react'
import { signInWithGoogle, signInWithMicrosoft } from '@/app/actions/auth'

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

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#f25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7fba00" />
      <rect x="1" y="13" width="10" height="10" fill="#00a4ef" />
      <rect x="13" y="13" width="10" height="10" fill="#ffb900" />
    </svg>
  )
}

function SignInButtons() {
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="flex items-center gap-2.5 rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <GoogleIcon className="h-5 w-5" />
          Sign in with Google
        </button>
      </form>
      <form action={signInWithMicrosoft}>
        <button
          type="submit"
          className="flex items-center gap-2.5 rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <MicrosoftIcon className="h-5 w-5" />
          Sign in with Microsoft
        </button>
      </form>
    </div>
  )
}

function SignInButtonsDark() {
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="flex items-center gap-2.5 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-100"
        >
          <GoogleIcon className="h-5 w-5" />
          Sign in with Google
        </button>
      </form>
      <form action={signInWithMicrosoft}>
        <button
          type="submit"
          className="flex items-center gap-2.5 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-100"
        >
          <MicrosoftIcon className="h-5 w-5" />
          Sign in with Microsoft
        </button>
      </form>
    </div>
  )
}

const comparisonRows = [
  { paper: 'Runs out before the event ends', linkfol: 'Never runs out' },
  { paper: 'Reprint every time info changes', linkfol: 'Edit your profile in seconds' },
  { paper: 'In-person handoff only', linkfol: 'QR code or shareable link' },
  { paper: 'No way to follow up', linkfol: 'See who scanned your card' },
  { paper: 'Just a name and number', linkfol: 'Full profile — bio, links, resume' },
]

const whoItsFor = [
  {
    Icon: GraduationCap,
    label: 'Students',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50 dark:bg-blue-950',
    description:
      'Career fairs, internship drives, and on-campus recruiting. Hand out a QR code instead of paper and stand out from the stack.',
  },
  {
    Icon: Briefcase,
    label: 'Professionals',
    iconColor: 'text-zinc-700 dark:text-zinc-300',
    iconBg: 'bg-zinc-100 dark:bg-zinc-800',
    description:
      'Conferences, client meetings, and chance encounters. Always have the perfect card ready — even when you forgot to pack paper ones.',
  },
  {
    Icon: Users,
    label: 'Recruiters & teams',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950',
    description:
      'Hand your card to candidates instead of juggling paper resumes. Perfect for career fairs, meetups, and networking events.',
  },
]

const howItWorks = [
  {
    Icon: GoogleIcon,
    step: '01',
    title: 'Sign up in seconds',
    description: 'One click with Google or Microsoft. No forms, no friction.',
  },
  {
    Icon: Pencil,
    step: '02',
    title: 'Build your card',
    description: 'Add your title, photo, bio, and social links in minutes.',
  },
  {
    Icon: QrCode,
    step: '03',
    title: 'Share everywhere',
    description: 'At career fairs, on emails, in bios. Anyone with a phone can view it.',
  },
]

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  const { ref } = await searchParams
  const referralCode = typeof ref === 'string' ? ref.slice(0, 64).replace(/[^a-zA-Z0-9_-]/g, '') : ''

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {referralCode && <ReferralCapture referralCode={referralCode} />}

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-zinc-50/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <LinkfolLogo size="sm" />
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Get started
            </button>
          </form>
        </div>
      </header>

      {/* Hero */}
      <section id="get-started" className="flex flex-col items-center px-4 py-24 text-center sm:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Digital business cards
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
            The business card that{' '}
            <span className="relative whitespace-nowrap">
              never runs out
              <span
                className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-blue-500"
                aria-hidden="true"
              />
            </span>
            .
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
            Share your complete professional profile with a single QR scan. Update it
            anytime from your phone — no reprints, no missed connections.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <SignInButtons />
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Already have an account? Same buttons, just sign in.
            </p>
          </div>
        </div>
      </section>

      {/* Phone demo */}
      <section className="bg-zinc-100 px-4 py-20 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl">
          <p className="mb-12 text-center text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Pick your style
          </p>
          <div className="flex justify-center">
            <PhoneMockup />
          </div>
          <p className="mt-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
            Tap the card to flip it · Switch themes · Toggle persona
          </p>
        </div>
      </section>

      {/* Comparison ledger */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-3 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Paper cards belong in the past
          </h2>
          <p className="mb-14 text-center text-base text-zinc-500 dark:text-zinc-400">
            Linkfol does everything a paper card can&rsquo;t.
          </p>

          {/* Column headers */}
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-zinc-100 px-5 py-3 text-center text-sm font-semibold text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
              Paper Card
            </div>
            <div className="rounded-xl bg-zinc-900 px-5 py-3 text-center text-sm font-semibold text-zinc-200 dark:bg-zinc-800">
              Linkfol
            </div>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-2">
            {comparisonRows.map(({ paper, linkfol }, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-xl bg-zinc-100 px-5 py-4 dark:bg-zinc-900">
                  <X className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-600" />
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">{paper}</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-zinc-900 px-5 py-4 dark:bg-zinc-800">
                  <Check className="h-4 w-4 shrink-0 text-blue-400" />
                  <span className="text-sm font-medium text-zinc-100">{linkfol}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-zinc-100 px-4 py-24 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Built for every career moment
          </h2>
          <p className="mb-14 text-center text-base text-zinc-500 dark:text-zinc-400">
            Whether you&rsquo;re handing out your first business card or your hundredth.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {whoItsFor.map(({ Icon, label, iconColor, iconBg, description }) => (
              <div
                key={label}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800"
              >
                <div className={`mb-4 inline-flex rounded-xl p-3 ${iconBg}`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {label}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Up and running in minutes
          </h2>
          <p className="mb-16 text-center text-base text-zinc-500 dark:text-zinc-400">
            Three steps from sign-up to share.
          </p>
          <div className="grid gap-10 sm:grid-cols-3">
            {howItWorks.map(({ Icon, step, title, description }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                  <Icon className="h-7 w-7 text-zinc-600 dark:text-zinc-300" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                    {step.replace('0', '')}
                  </span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark CTA */}
      <section className="bg-zinc-900 px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            Ready to leave paper behind?
          </h2>
          <p className="mb-10 text-base text-zinc-400">
            Create your digital card in minutes. It&rsquo;s waiting for you.
          </p>
          <div className="flex flex-col items-center gap-4">
            <SignInButtonsDark />
            <p className="text-sm text-zinc-500">
              Already have an account? Same buttons, just sign in.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-10 text-center dark:border-zinc-800">
        <p className="text-sm text-zinc-400 dark:text-zinc-600">© 2026 Linkfol</p>
        <div className="mt-4 flex justify-center">
          <VeteranBadge size="md" />
        </div>
      </footer>
    </div>
  )
}
