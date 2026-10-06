'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, GraduationCap, Users } from 'lucide-react'
import LinkfolLogo from '@/components/LinkfolLogo'
import AvatarUpload from '@/components/AvatarUpload'
import { themes, getTheme } from '@/lib/themes'
import { PERSONA_CONFIG, FIELD_DEFS } from '@/lib/persona-config'
import type { OnboardingFieldConfig } from '@/lib/persona-config'
import type { Persona } from '@/lib/types'
import { checkUsername, saveOnboardingProfile } from './actions'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 30)
}

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

// ── Persona option card ───────────────────────────────────────────────────────

const PERSONA_ICONS: Record<Persona, React.FC<{ className?: string }>> = {
  professional: ({ className }) => <Briefcase className={className} />,
  student: ({ className }) => <GraduationCap className={className} />,
  recruiter: ({ className }) => <Users className={className} />,
}

const PERSONAS: Persona[] = ['professional', 'student', 'recruiter']

// ── Card mini preview ─────────────────────────────────────────────────────────

function CardMiniPreview({
  fullName,
  subtitle,
  email,
  avatarUrl,
  theme: themeId,
}: {
  fullName: string
  subtitle: string
  email: string
  avatarUrl: string | null
  theme: string
}) {
  const t = getTheme(themeId)
  const initial = fullName?.trim().charAt(0).toUpperCase() || '?'

  return (
    <div
      className="w-full border px-6 py-8"
      style={{
        background: t.colors.background,
        borderColor: t.colors.border,
        borderRadius: t.style.borderRadius,
        boxShadow: t.style.shadow,
      }}
    >
      <div className="flex flex-col items-center text-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName || 'Preview'}
            className="h-20 w-20 rounded-full object-cover object-center"
            style={{ boxShadow: `0 0 0 4px ${t.colors.avatarRing}` }}
          />
        ) : (
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-semibold"
            style={{
              backgroundColor: t.colors.avatarInitialBg,
              color: t.colors.avatarInitialText,
              boxShadow: `0 0 0 4px ${t.colors.avatarRing}`,
            }}
          >
            {initial}
          </div>
        )}
        <h2
          className="mt-4 text-xl tracking-tight"
          style={{ color: t.colors.text, fontWeight: t.style.fontWeight }}
        >
          {fullName || 'Your Name'}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: t.colors.textSecondary }}>
            {subtitle}
          </p>
        )}
      </div>
      {email && (
        <div className="mt-5">
          <div
            className="flex items-center gap-2 border px-3 py-2 text-sm"
            style={{
              background: t.colors.contactBg,
              borderColor: t.colors.contactBorder,
              color: t.colors.contactText,
              borderRadius: t.style.innerRadius,
            }}
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: t.colors.iconColor }}
              aria-hidden="true"
            >
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{email}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500'

const labelClass = 'block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1'

// ── Main component ────────────────────────────────────────────────────────────

export default function OnboardingClient({
  userId,
  userEmail,
  existingUsername,
  existingAvatarUrl,
}: {
  userId: string
  userEmail: string | null
  existingUsername: string
  existingAvatarUrl: string | null
}) {
  const router = useRouter()

  // step 1 = persona picker, 2 = the basics, 3 = make it yours
  const [step, setStep] = useState(1)
  const [persona, setPersona] = useState<Persona>('professional')

  // ── Universal Step 2 fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState(userEmail ?? '')
  const [username, setUsername] = useState(existingUsername)
  const [usernameEdited, setUsernameEdited] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')
  const [stepError, setStepError] = useState<string | null>(null)

  // ── Professional
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')

  // ── Student
  const [university, setUniversity] = useState('')
  const [major, setMajor] = useState('')
  const [expectedGraduation, setExpectedGraduation] = useState('')

  // ── Recruiter (also uses company above)
  const [department, setDepartment] = useState('')
  const [hiringFocus, setHiringFocus] = useState('')

  // ── Step 3 fields
  const [website, setWebsite] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [twitter, setTwitter] = useState('')
  const [instagram, setInstagram] = useState('')
  const [github, setGithub] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [theme, setTheme] = useState('midnight')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(existingAvatarUrl)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Username helpers ──────────────────────────────────────────────────────

  function scheduleUsernameCheck(value: string) {
    setUsernameStatus('checking')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value || value.length < 2) {
      setUsernameStatus('invalid')
      return
    }
    debounceRef.current = setTimeout(async () => {
      const result = await checkUsername(value)
      setUsernameStatus(result.available ? 'available' : 'taken')
    }, 300)
  }

  function handleFullNameChange(value: string) {
    setFullName(value)
    if (!usernameEdited) {
      const slug = nameToSlug(value)
      if (slug.length >= 2) {
        setUsername(slug)
        scheduleUsernameCheck(slug)
      } else {
        setUsername('')
        setUsernameStatus('idle')
      }
    }
  }

  function handleUsernameChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30)
    setUsername(cleaned)
    setUsernameEdited(true)
    scheduleUsernameCheck(cleaned)
  }

  // ── Field state lookup (for validation) ─────────────────────────────────

  function getFieldValue(key: string): string {
    switch (key) {
      case 'title':                return title
      case 'company':              return company
      case 'phones':               return phone
      case 'university':           return university
      case 'major':                return major
      case 'expected_graduation':  return expectedGraduation
      case 'department':           return department
      case 'hiring_focus':         return hiringFocus
      default:                     return ''
    }
  }

  // ── Step 2 validation + advance ──────────────────────────────────────────

  function handleNextStep() {
    if (!fullName.trim()) { setStepError('Full name is required.'); return }
    if (!email.trim()) { setStepError('Email is required.'); return }
    if (!username || username.length < 2) {
      setStepError('Please choose a card URL (at least 2 characters).')
      return
    }
    if (usernameStatus === 'taken') { setStepError('That URL is taken. Please choose another.'); return }
    if (usernameStatus === 'checking') { setStepError('Please wait while we check that URL.'); return }
    if (usernameStatus === 'invalid') { setStepError('Please enter a valid card URL.'); return }

    for (const fieldConfig of PERSONA_CONFIG[persona].onboardingFields) {
      const def = FIELD_DEFS[fieldConfig.key]
      const isRequired = fieldConfig.required ?? def.required ?? false
      if (!isRequired) continue
      if (!getFieldValue(fieldConfig.key).trim()) {
        setStepError(`${def.label} is required.`)
        return
      }
    }

    setStepError(null)
    setStep(3)
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  async function handleSave() {
    setIsSaving(true)
    setSaveError(null)
    const result = await saveOnboardingProfile({
      persona,
      full_name: fullName,
      email,
      username,
      title,
      company,
      phone,
      university,
      major,
      expectedGraduation,
      department,
      hiringFocus,
      website,
      linkedin,
      twitter,
      instagram,
      github,
      tiktok,
      theme,
    })
    if (result.success && result.username) {
      router.push('/dashboard')
    } else {
      setSaveError(result.error ?? 'Something went wrong. Please try again.')
      setIsSaving(false)
    }
  }

  // ── Persona-specific field rendering (Step 2) ─────────────────────────────

  function renderPersonaField(fieldConfig: OnboardingFieldConfig) {
    const { key } = fieldConfig
    const def = FIELD_DEFS[key]
    const isRequired = fieldConfig.required ?? def.required ?? false

    const labelEl = (
      <label className={labelClass}>
        {def.label}
        {isRequired && <span className="text-red-500"> *</span>}
      </label>
    )

    switch (key) {
      case 'title':
        return (
          <div key={key}>
            {labelEl}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={def.placeholder}
              className={inputClass}
            />
          </div>
        )
      case 'company':
        return (
          <div key={key}>
            {labelEl}
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={def.placeholder}
              className={inputClass}
            />
          </div>
        )
      case 'phones':
        return (
          <div key={key}>
            {labelEl}
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneDisplay(e.target.value))}
              placeholder="(555) 000-0000"
              className={inputClass}
            />
          </div>
        )
      case 'university':
        return (
          <div key={key}>
            {labelEl}
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder={def.placeholder}
              className={inputClass}
            />
          </div>
        )
      case 'major':
        return (
          <div key={key}>
            {labelEl}
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder={def.placeholder}
              className={inputClass}
            />
          </div>
        )
      case 'expected_graduation':
        return (
          <div key={key}>
            {labelEl}
            {def.hint && (
              <p className="mb-1 text-xs text-zinc-400 dark:text-zinc-500">{def.hint}</p>
            )}
            <input
              type="month"
              value={expectedGraduation}
              onChange={(e) => setExpectedGraduation(e.target.value)}
              className={inputClass}
            />
          </div>
        )
      case 'department':
        return (
          <div key={key}>
            {labelEl}
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder={def.placeholder}
              className={inputClass}
            />
          </div>
        )
      case 'hiring_focus':
        return (
          <div key={key}>
            {labelEl}
            <input
              type="text"
              value={hiringFocus}
              onChange={(e) => setHiringFocus(e.target.value)}
              placeholder={def.placeholder}
              className={inputClass}
            />
          </div>
        )
      default:
        return null
    }
  }

  // ── Preview subtitle ─────────────────────────────────────────────────────

  function getPreviewSubtitle(): string {
    switch (persona) {
      case 'professional':
        return [title, company].filter(Boolean).join(' at ')
      case 'student':
        return [major, university].filter(Boolean).join(' · ')
      case 'recruiter':
        return [department, company].filter(Boolean).join(', ')
    }
  }

  // ── Progress bar labels ──────────────────────────────────────────────────

  const stepLabels: Record<number, string> = {
    1: 'What describes you?',
    2: 'The basics',
    3: 'Make it yours',
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <LinkfolLogo size="sm" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Step {step} of 3
            </span>
            <span className="text-sm text-zinc-400">{stepLabels[step]}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-1.5 rounded-full bg-zinc-900 transition-all duration-300 dark:bg-zinc-50"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Step 1: Persona picker ── */}
        {step === 1 && (
          <div className="max-w-2xl">
            <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              What best describes you?
            </h1>
            <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
              We&apos;ll tailor your card to show what matters most for your goals.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {PERSONAS.map((p) => {
                const config = PERSONA_CONFIG[p]
                const Icon = PERSONA_ICONS[p]
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPersona(p)
                      setStep(2)
                    }}
                    className="flex flex-col items-start rounded-xl border-2 p-6 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-500 border-zinc-200 dark:border-zinc-700"
                  >
                    <Icon className="mb-4 h-8 w-8 text-zinc-700 dark:text-zinc-300" />
                    <span className="mb-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {config.label}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {config.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Step 2: The basics ── */}
        {step === 2 && (
          <div className="max-w-xl">
            <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              The basics
            </h1>
            <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
              Let&apos;s get your card set up. You can always edit this later.
            </p>

            <p className="mb-6 text-xs text-zinc-400 dark:text-zinc-500">
              <span className="text-red-500">*</span> Required
            </p>

            <div className="space-y-5">
              {/* Universal fields */}
              <div>
                <label htmlFor="full_name" className={labelClass}>
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  id="full_name"
                  type="text"
                  value={fullName}
                  onChange={(e) => handleFullNameChange(e.target.value)}
                  placeholder="Jane Smith"
                  className={inputClass}
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className={inputClass}
                />
              </div>

              {/* Persona-specific fields */}
              {PERSONA_CONFIG[persona].onboardingFields.map((fieldConfig) =>
                renderPersonaField(fieldConfig)
              )}

              {/* Card URL */}
              <div>
                <label htmlFor="username" className={labelClass}>
                  Choose your card URL <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center overflow-hidden rounded-lg border border-zinc-200 focus-within:border-zinc-400 dark:border-zinc-700 dark:focus-within:border-zinc-500">
                  <span className="shrink-0 whitespace-nowrap border-r border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                    linkfol.com/
                  </span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="yourname"
                    className="flex-1 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
                  />
                  <div className="pr-3">
                    {usernameStatus === 'checking' && (
                      <svg
                        className="h-4 w-4 animate-spin text-zinc-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    )}
                    {usernameStatus === 'available' && (
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">✓</span>
                    )}
                    {usernameStatus === 'taken' && (
                      <span className="text-sm font-medium text-red-500">✗</span>
                    )}
                  </div>
                </div>
                {usernameStatus === 'available' && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">Available!</p>
                )}
                {usernameStatus === 'taken' && (
                  <p className="mt-1 text-xs text-red-500">That URL is taken. Try something else.</p>
                )}
              </div>
            </div>

            {stepError && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">{stepError}</p>
            )}

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => { setStepError(null); setStep(1) }}
                className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Make it yours ── */}
        {step === 3 && (
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
            {/* Left: form */}
            <div className="max-w-xl flex-1">
              <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Make it yours
              </h1>
              <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
                Add a photo and customize how your card looks.
              </p>

              <div className="space-y-8">
                {/* Photo */}
                <section className="space-y-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Photo
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Add a photo so people recognize you
                  </p>
                  <AvatarUpload
                    userId={userId}
                    avatarUrl={avatarUrl}
                    fullName={fullName}
                    onAvatarChange={setAvatarUrl}
                  />
                </section>

                {/* Website */}
                <section className="space-y-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Website
                  </h2>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yoursite.com"
                    className={inputClass}
                  />
                </section>

                {/* Social links */}
                <section className="space-y-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Social Links
                  </h2>
                  <div className="space-y-4">
                    {[
                      { label: 'LinkedIn', value: linkedin, set: setLinkedin, placeholder: 'https://linkedin.com/in/username' },
                      { label: 'Twitter / X', value: twitter, set: setTwitter, placeholder: 'https://x.com/username' },
                      { label: 'Instagram', value: instagram, set: setInstagram, placeholder: 'https://instagram.com/username' },
                      { label: 'GitHub', value: github, set: setGithub, placeholder: 'https://github.com/username' },
                      { label: 'TikTok', value: tiktok, set: setTiktok, placeholder: 'https://tiktok.com/@username' },
                    ].map(({ label, value, set, placeholder }) => (
                      <div key={label}>
                        <label className={labelClass}>{label}</label>
                        <input
                          type="url"
                          value={value}
                          onChange={(e) => set(e.target.value)}
                          placeholder={placeholder}
                          className={inputClass}
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Theme picker */}
                <section className="space-y-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Card Theme
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Pick a look for your card</p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id)}
                        className={`flex-shrink-0 overflow-hidden border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 ${
                          theme === t.id
                            ? 'border-zinc-900 dark:border-zinc-100'
                            : 'border-zinc-200 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500'
                        }`}
                        style={{
                          borderRadius:
                            t.style.borderRadius === '0' ? '0.375rem' : t.style.borderRadius,
                          width: '80px',
                        }}
                        aria-label={`${t.name} theme`}
                        aria-pressed={theme === t.id}
                      >
                        <div
                          className="flex flex-col items-center px-2 py-3"
                          style={{ background: t.colors.background }}
                        >
                          <div
                            className="rounded-full"
                            style={{
                              width: '22px',
                              height: '22px',
                              backgroundColor: t.colors.avatarInitialBg,
                              boxShadow: `0 0 0 2px ${t.colors.avatarRing}`,
                            }}
                          />
                          <div
                            style={{
                              height: '3px',
                              backgroundColor: t.colors.text,
                              width: '80%',
                              borderRadius: '2px',
                              marginTop: '8px',
                              opacity: 0.8,
                            }}
                          />
                          <div
                            style={{
                              height: '2px',
                              backgroundColor: t.colors.textSecondary,
                              width: '60%',
                              borderRadius: '2px',
                              marginTop: '4px',
                              opacity: 0.7,
                            }}
                          />
                          <div
                            style={{
                              height: '14px',
                              backgroundColor: t.colors.contactBg,
                              width: '90%',
                              borderRadius: t.style.innerRadius,
                              marginTop: '10px',
                              border: `1px solid ${t.colors.contactBorder}`,
                            }}
                          />
                        </div>
                        <div className="border-t border-zinc-200 bg-white py-1.5 text-center dark:border-zinc-700 dark:bg-zinc-900">
                          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            {t.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {saveError && (
                <p className="mt-4 text-sm text-red-600 dark:text-red-400">{saveError}</p>
              )}

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {isSaving ? 'Creating…' : 'Create my card →'}
                </button>
              </div>
            </div>

            {/* Right: live preview */}
            <div className="lg:w-72 lg:flex-shrink-0">
              <div className="lg:sticky lg:top-6">
                <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Preview
                </p>
                <CardMiniPreview
                  fullName={fullName}
                  subtitle={getPreviewSubtitle()}
                  email={email}
                  avatarUrl={avatarUrl}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
