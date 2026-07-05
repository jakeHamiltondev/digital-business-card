'use client'

import { useActionState, useState } from 'react'
import { updateProfile } from './actions'
import type { FormState } from './actions'
import type { Profile } from '@/lib/types'
import { themes } from '@/lib/themes'

const initialState: FormState = { success: false, error: null }

const inputClass =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500'

const labelClass = 'block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1'

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = 'text',
}: {
  label: string
  name: string
  defaultValue?: string | null
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  )
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)
  const [selectedTheme, setSelectedTheme] = useState(profile.theme ?? 'midnight')
  const social = profile.social_links ?? {}

  return (
    <form action={formAction} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Basic Information
        </h2>
        <div>
          <label htmlFor="username" className={labelClass}>
            Username <span className="text-red-500">*</span>
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            defaultValue={profile.username}
            placeholder="your-username"
            className={inputClass}
          />
        </div>
        <Field label="Full Name" name="full_name" defaultValue={profile.full_name} placeholder="Jane Smith" />
        <Field label="Title" name="title" defaultValue={profile.title} placeholder="Software Engineer" />
        <Field label="Company" name="company" defaultValue={profile.company} placeholder="Acme Corp" />
        <div>
          <label htmlFor="bio" className={labelClass}>
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={profile.bio ?? ''}
            placeholder="A short description about yourself..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Contact
        </h2>
        <Field label="Email" name="email" type="email" defaultValue={profile.email} placeholder="jane@example.com" />
        <Field label="Phone" name="phone" type="tel" defaultValue={profile.phone} placeholder="+1 (555) 000-0000" />
        <Field label="Website" name="website" type="url" defaultValue={profile.website} placeholder="https://example.com" />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Social Links
        </h2>
        <Field label="LinkedIn" name="linkedin" defaultValue={social.linkedin} placeholder="https://linkedin.com/in/username" />
        <Field label="Twitter / X" name="twitter" defaultValue={social.twitter} placeholder="https://x.com/username" />
        <Field label="Instagram" name="instagram" defaultValue={social.instagram} placeholder="https://instagram.com/username" />
        <Field label="GitHub" name="github" defaultValue={social.github} placeholder="https://github.com/username" />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Card Theme
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {themes.map((theme) => (
            <button
              type="button"
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`flex-shrink-0 overflow-hidden border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 ${
                selectedTheme === theme.id
                  ? 'border-zinc-900 dark:border-zinc-100'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
              }`}
              style={{
                borderRadius: theme.style.borderRadius === '0' ? '0.375rem' : theme.style.borderRadius,
                width: '80px',
              }}
              aria-label={`${theme.name} theme`}
              aria-pressed={selectedTheme === theme.id}
            >
              {/* Mini card preview */}
              <div
                className="flex flex-col items-center px-2 py-3"
                style={{ background: theme.colors.background }}
              >
                {/* Avatar circle */}
                <div
                  className="rounded-full"
                  style={{
                    width: '22px',
                    height: '22px',
                    backgroundColor: theme.colors.avatarInitialBg,
                    boxShadow: `0 0 0 2px ${theme.colors.avatarRing}`,
                  }}
                />
                {/* Name line */}
                <div
                  style={{
                    height: '3px',
                    backgroundColor: theme.colors.text,
                    width: '80%',
                    borderRadius: '2px',
                    marginTop: '8px',
                    opacity: 0.8,
                  }}
                />
                {/* Title line */}
                <div
                  style={{
                    height: '2px',
                    backgroundColor: theme.colors.textSecondary,
                    width: '60%',
                    borderRadius: '2px',
                    marginTop: '4px',
                    opacity: 0.7,
                  }}
                />
                {/* Contact row hint */}
                <div
                  style={{
                    height: '14px',
                    backgroundColor: theme.colors.contactBg,
                    width: '90%',
                    borderRadius: theme.style.innerRadius,
                    marginTop: '10px',
                    border: `1px solid ${theme.colors.contactBorder}`,
                  }}
                />
              </div>
              {/* Theme name label */}
              <div className="border-t border-zinc-200 bg-white py-1.5 text-center dark:border-zinc-700 dark:bg-zinc-900">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {theme.name}
                </span>
              </div>
            </button>
          ))}
        </div>
        <input type="hidden" name="theme" value={selectedTheme} />
      </section>

      <div className="space-y-3">
        {state.success && (
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Profile saved successfully.
          </p>
        )}
        {state.error && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isPending ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </form>
  )
}
