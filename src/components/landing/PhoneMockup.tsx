'use client'

import { useState } from 'react'
import BusinessCard from '@/components/BusinessCard'
import type { Profile } from '@/lib/types'

const THEMES: { id: string; name: string; bg: string; border?: boolean }[] = [
  { id: 'ocean',    name: 'Ocean',    bg: '#0b2a40' },
  { id: 'clean',    name: 'Clean',    bg: '#ffffff', border: true },
  { id: 'midnight', name: 'Midnight', bg: '#121217' },
  { id: 'forest',   name: 'Forest',   bg: '#14241a' },
  { id: 'slate',    name: 'Slate',    bg: '#1b2230' },
]

type ThemeId = 'ocean' | 'clean' | 'midnight' | 'forest' | 'slate'

const BASE: Omit<Profile, 'username' | 'full_name' | 'title' | 'company' | 'bio' | 'email' | 'social_links' | 'theme' | 'persona'> = {
  id: 'demo',
  avatar_url: null,
  phone: null,
  website: null,
  plan: null,
  stripe_customer_id: null,
  subscription_id: null,
  subscription_end_date: null,
  referred_by: null,
  created_at: '',
  updated_at: '',
  department: null,
  phones: [],
  work_address: null,
  address_visibility: 'vcard_only',
  location: null,
  logo_url: null,
  brand_color_primary: null,
  brand_color_accent: null,
  student_info: null,
  recruiter_info: null,
  card_layout: null,
  card_back_fields: null,
  resume_url: null,
}

const studentProfile: Profile = {
  ...BASE,
  username: 'jordantaylor',
  full_name: 'Jordan Taylor',
  title: 'Marketing Major',
  company: 'State University, Class of 2026',
  bio: 'Marketing student passionate about brand strategy and digital media. Actively seeking internship opportunities.',
  email: 'jordan@example.com',
  social_links: { linkedin: 'https://linkedin.com/in/jordantaylor' },
  theme: 'ocean',
  persona: 'student',
}

const professionalProfile: Profile = {
  ...BASE,
  username: 'alexrivera',
  full_name: 'Alex Rivera',
  title: 'Product Manager',
  company: 'Meridian Technologies',
  bio: 'Product leader with 7 years building B2B developer tools. Focused on platform strategy and growth.',
  email: 'alex@meridiantech.com',
  social_links: {
    linkedin: 'https://linkedin.com/in/alexrivera',
    github: 'https://github.com/alexrivera',
  },
  theme: 'midnight',
  persona: 'professional',
}

const DEMO_URL = 'https://linkfol.co/demo'

export default function PhoneMockup() {
  const [theme, setTheme] = useState<ThemeId>('midnight')
  const [persona, setPersona] = useState<'student' | 'professional'>('professional')

  const profile = persona === 'student' ? studentProfile : professionalProfile

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Persona toggle */}
      <div className="flex rounded-full bg-zinc-200 p-1 text-sm dark:bg-zinc-800">
        {(['professional', 'student'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPersona(p)}
            className={`rounded-full px-5 py-1.5 font-medium transition-all ${
              persona === p
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-600 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {p === 'student' ? 'Student' : 'Professional'}
          </button>
        ))}
      </div>

      {/* Phone frame */}
      <div
        className="relative rounded-[3rem] bg-zinc-900 shadow-2xl ring-1 ring-white/10"
        style={{ width: 340, padding: 14 }}
      >
        {/* Side buttons (decorative) */}
        <div className="absolute -left-[5px] top-24 h-10 w-[5px] rounded-l-sm bg-zinc-700" />
        <div className="absolute -left-[5px] top-40 h-14 w-[5px] rounded-l-sm bg-zinc-700" />
        <div className="absolute -left-[5px] top-56 h-14 w-[5px] rounded-l-sm bg-zinc-700" />
        <div className="absolute -right-[5px] top-36 h-20 w-[5px] rounded-r-sm bg-zinc-700" />

        {/* Screen */}
        <div
          className="relative overflow-hidden rounded-[2.4rem] bg-zinc-100 dark:bg-zinc-950"
          style={{ height: 622 }}
        >
          {/* Dynamic island */}
          <div className="absolute left-1/2 top-4 z-10 h-7 w-28 -translate-x-1/2 rounded-full bg-black dark:bg-zinc-950 shadow-inner" />

          {/* Card content */}
          <div className="flex h-full items-center justify-center pt-12 pb-6">
            <BusinessCard
              profile={{ ...profile, theme }}
              pageUrl={DEMO_URL}
              theme={theme}
            />
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2.5 left-1/2 h-[5px] w-24 -translate-x-1/2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
        </div>
      </div>

      {/* Theme switcher */}
      <div className="flex items-end gap-2">
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id as ThemeId)}
            title={t.name}
            className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-2 transition-all ${
              theme === t.id
                ? 'bg-white shadow-sm dark:bg-zinc-800'
                : 'opacity-50 hover:opacity-80'
            }`}
          >
            <span
              className={`h-6 w-6 rounded-full shadow-sm ${t.border ? 'border border-zinc-300' : ''}`}
              style={{ background: t.bg }}
            />
            <span className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
